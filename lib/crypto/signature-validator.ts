import * as jsrsasign from 'jsrsasign';
import {
  ValidationResult,
  ValidationOptions,
  ValidationError,
  ValidationWarning,
  ValidationDetails,
  Certificate,
} from '@/types';
import { parseCertificate } from './certificate-parser';

/**
 * Validates a digital signature against a document
 */
export async function validateSignature(
  document: Uint8Array,
  signature: string,
  options: ValidationOptions = {
    checkRevocation: false,
    validateTimestamp: false,
    allowExpiredCertificates: false,
  }
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const timestamp = new Date();

  try {
    // Parse the PKCS#7/CMS signature
    const cms = new jsrsasign.KJUR.asn1.cms.CMSParser();
    const signedData = cms.getCMSSignedData(signature);

    if (!signedData) {
      errors.push({
        code: 'INVALID_SIGNATURE_FORMAT',
        message: 'Invalid signature format. Expected PKCS#7/CMS.',
        severity: 'critical',
      });

      return createValidationResult(false, 'invalid', errors, warnings, timestamp);
    }

    // Extract signer certificate
    const signerCert = await extractSignerCertificate(signedData);
    if (!signerCert) {
      errors.push({
        code: 'NO_SIGNER_CERTIFICATE',
        message: 'No signer certificate found in signature.',
        severity: 'critical',
      });

      return createValidationResult(false, 'invalid', errors, warnings, timestamp);
    }

    // Verify signature cryptographically
    const signatureValid = verifySignatureCryptography(document, signedData, signerCert);
    if (!signatureValid) {
      errors.push({
        code: 'SIGNATURE_VERIFICATION_FAILED',
        message: 'Signature verification failed. The document may have been modified.',
        severity: 'critical',
      });
    }

    // Check certificate expiration
    const certValid = checkCertificateValidity(signerCert, options.allowExpiredCertificates);
    if (!certValid.valid) {
      if (options.allowExpiredCertificates) {
        warnings.push({
          code: 'CERTIFICATE_EXPIRED',
          message: certValid.message,
          severity: 'warning',
        });
      } else {
        errors.push({
          code: 'CERTIFICATE_EXPIRED',
          message: certValid.message,
          severity: 'error',
        });
      }
    }

    // Validate certificate chain
    const chainValid = await validateCertificateChain(
      signerCert,
      options.trustedCAs || []
    );
    if (!chainValid.valid) {
      errors.push({
        code: 'CHAIN_VALIDATION_FAILED',
        message: chainValid.message,
        severity: 'error',
      });
    }

    // Extract timestamp if present
    let signedAt: Date | undefined;
    try {
      signedAt = extractTimestamp(signedData);
      if (signedAt && options.validateTimestamp) {
        const timestampValid = validateTimestampValidity(signedAt);
        if (!timestampValid) {
          warnings.push({
            code: 'INVALID_TIMESTAMP',
            message: 'Timestamp is outside acceptable range.',
            severity: 'warning',
          });
        }
      }
    } catch (err) {
      // Timestamp is optional
    }

    // Determine overall status
    const valid = errors.length === 0;
    const status = valid
      ? warnings.length > 0
        ? 'valid-with-warnings'
        : 'valid'
      : 'invalid';

    const details: ValidationDetails = {
      signatureValid,
      certificateValid: certValid.valid,
      chainValid: chainValid.valid,
      timestampValid: signedAt ? true : undefined,
      certificateChain: [signerCert],
      signedAt,
      validatedAt: timestamp,
    };

    return {
      valid,
      status,
      errors,
      warnings,
      details,
      timestamp,
    };
  } catch (error) {
    errors.push({
      code: 'VALIDATION_ERROR',
      message: `Validation failed: ${(error as Error).message}`,
      severity: 'critical',
    });

    return createValidationResult(false, 'invalid', errors, warnings, timestamp);
  }
}

/**
 * Extracts the signer certificate from CMS SignedData
 */
async function extractSignerCertificate(
  signedData: any
): Promise<Certificate | null> {
  try {
    const certs = signedData.certs;
    if (!certs || certs.length === 0) {
      return null;
    }

    // Get the first certificate (signer certificate)
    const certHex = certs[0];
    const certPem = jsrsasign.KJUR.asn1.ASN1Util.getPEMStringFromHex(certHex, 'CERTIFICATE');
    
    return await parseCertificate(certPem);
  } catch (error) {
    return null;
  }
}

/**
 * Verifies the cryptographic integrity of the signature
 */
function verifySignatureCryptography(
  document: Uint8Array,
  signedData: any,
  certificate: Certificate
): boolean {
  try {
    // Calculate document hash
    const documentHex = Array.from(document)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Get signature algorithm
    const sigAlg = signedData.signerInfos[0]?.digestAlgorithm || 'sha256';
    
    // Calculate hash
    const hash = jsrsasign.KJUR.crypto.Util.hashHex(documentHex, sigAlg);

    // Get signature value
    const sigValue = signedData.signerInfos[0]?.signature;
    if (!sigValue) {
      return false;
    }

    // Verify signature using public key from certificate
    const x509 = new jsrsasign.X509();
    x509.readCertPEM(certificate.raw);
    const pubKey = x509.getPublicKey();

    const sig = new jsrsasign.KJUR.crypto.Signature({ alg: `${sigAlg}withRSA` });
    sig.init(pubKey);
    sig.updateHex(hash);

    return sig.verify(sigValue);
  } catch (error) {
    return false;
  }
}

/**
 * Checks if the certificate is currently valid
 */
function checkCertificateValidity(
  certificate: Certificate,
  allowExpired: boolean
): { valid: boolean; message: string } {
  const now = new Date();

  if (now < certificate.notBefore) {
    return {
      valid: false,
      message: 'Certificate is not yet valid.',
    };
  }

  if (now > certificate.notAfter) {
    return {
      valid: allowExpired,
      message: `Certificate expired on ${certificate.notAfter.toLocaleDateString()}.`,
    };
  }

  return {
    valid: true,
    message: 'Certificate is valid.',
  };
}

/**
 * Validates the certificate chain against trusted CAs
 */
async function validateCertificateChain(
  certificate: Certificate,
  trustedCAs: Certificate[]
): Promise<{ valid: boolean; message: string }> {
  // If no trusted CAs provided, skip chain validation
  if (trustedCAs.length === 0) {
    return {
      valid: true,
      message: 'Chain validation skipped (no trusted CAs provided).',
    };
  }

  try {
    // Check if certificate is self-signed
    if (certificate.issuer.CN === certificate.subject.CN) {
      // Check if it's in the trusted CAs
      const isTrusted = trustedCAs.some(
        (ca) => ca.fingerprints.sha256 === certificate.fingerprints.sha256
      );

      if (isTrusted) {
        return {
          valid: true,
          message: 'Self-signed certificate is trusted.',
        };
      }

      return {
        valid: false,
        message: 'Self-signed certificate is not in trusted CAs.',
      };
    }

    // Find issuer in trusted CAs
    const issuer = trustedCAs.find(
      (ca) => ca.subject.CN === certificate.issuer.CN
    );

    if (!issuer) {
      return {
        valid: false,
        message: 'Certificate issuer not found in trusted CAs.',
      };
    }

    // Verify certificate was signed by issuer
    const x509 = new jsrsasign.X509();
    x509.readCertPEM(certificate.raw);
    
    const issuerX509 = new jsrsasign.X509();
    issuerX509.readCertPEM(issuer.raw);
    
    const issuerPubKey = issuerX509.getPublicKey();
    const isValid = x509.verifySignature(issuerPubKey);

    if (!isValid) {
      return {
        valid: false,
        message: 'Certificate signature verification failed.',
      };
    }

    return {
      valid: true,
      message: 'Certificate chain is valid.',
    };
  } catch (error) {
    return {
      valid: false,
      message: `Chain validation error: ${(error as Error).message}`,
    };
  }
}

/**
 * Extracts timestamp from signed data
 */
function extractTimestamp(signedData: any): Date | undefined {
  try {
    const signerInfo = signedData.signerInfos[0];
    if (!signerInfo || !signerInfo.signedAttrs) {
      return undefined;
    }

    // Look for signing-time attribute
    const signingTime = signerInfo.signedAttrs.find(
      (attr: any) => attr.type === '1.2.840.113549.1.9.5'
    );

    if (signingTime && signingTime.value) {
      return new Date(signingTime.value);
    }

    return undefined;
  } catch (error) {
    return undefined;
  }
}

/**
 * Validates that timestamp is within acceptable range
 */
function validateTimestampValidity(timestamp: Date): boolean {
  const now = new Date();
  const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds

  // Check if timestamp is not in the future
  if (timestamp > now) {
    return false;
  }

  // Check if timestamp is not too old
  if (now.getTime() - timestamp.getTime() > maxAge) {
    return false;
  }

  return true;
}

/**
 * Creates a validation result object
 */
function createValidationResult(
  valid: boolean,
  status: ValidationResult['status'],
  errors: ValidationError[],
  warnings: ValidationWarning[],
  timestamp: Date
): ValidationResult {
  return {
    valid,
    status,
    errors,
    warnings,
    details: {
      signatureValid: false,
      certificateValid: false,
      chainValid: false,
      certificateChain: [],
      validatedAt: timestamp,
    },
    timestamp,
  };
}

/**
 * Exports validation result as JSON
 */
export function exportValidationResult(result: ValidationResult): string {
  return JSON.stringify(result, null, 2);
}

/**
 * Exports validation result as text report
 */
export function exportValidationResultAsText(result: ValidationResult): string {
  const lines: string[] = [];

  lines.push('=== SIGNATURE VALIDATION REPORT ===');
  lines.push('');
  lines.push(`Status: ${result.status.toUpperCase()}`);
  lines.push(`Valid: ${result.valid ? 'YES' : 'NO'}`);
  lines.push(`Validated At: ${result.timestamp.toLocaleString()}`);
  lines.push('');

  if (result.details.signedAt) {
    lines.push(`Signed At: ${result.details.signedAt.toLocaleString()}`);
    lines.push('');
  }

  lines.push('=== VALIDATION DETAILS ===');
  lines.push(`Signature Valid: ${result.details.signatureValid ? 'YES' : 'NO'}`);
  lines.push(`Certificate Valid: ${result.details.certificateValid ? 'YES' : 'NO'}`);
  lines.push(`Chain Valid: ${result.details.chainValid ? 'YES' : 'NO'}`);
  lines.push('');

  if (result.errors.length > 0) {
    lines.push('=== ERRORS ===');
    result.errors.forEach((error, i) => {
      lines.push(`${i + 1}. [${error.code}] ${error.message}`);
    });
    lines.push('');
  }

  if (result.warnings.length > 0) {
    lines.push('=== WARNINGS ===');
    result.warnings.forEach((warning, i) => {
      lines.push(`${i + 1}. [${warning.code}] ${warning.message}`);
    });
    lines.push('');
  }

  lines.push('=== END OF REPORT ===');

  return lines.join('\n');
}