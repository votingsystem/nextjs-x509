import * as jsrsasign from 'jsrsasign';
import {
  ParsedCertificate,
  DistinguishedName,
  PublicKeyInfo,
  Fingerprints,
  CertificateExtension,
} from '@/types';

export async function parseCertificate(
  certData: string,
  format: 'pem' | 'der' | 'pfx' = 'pem'
): Promise<ParsedCertificate> {
  try {
    let pemCert: string;

    if (format === 'pem') {
      pemCert = certData;
    } else if (format === 'der') {
      pemCert = jsrsasign.KJUR.asn1.ASN1Util.getPEMStringFromHex(certData, 'CERTIFICATE');
    } else {
      throw new Error('PFX format requires separate handling');
    }

    const x509 = new jsrsasign.X509();
    x509.readCertPEM(pemCert);

    const parsed: ParsedCertificate = {
      version: x509.version,
      serialNumber: x509.getSerialNumberHex(),
      issuer: parseDistinguishedName(x509.getIssuerString()),
      subject: parseDistinguishedName(x509.getSubjectString()),
      notBefore: new Date(x509.getNotBefore()),
      notAfter: new Date(x509.getNotAfter()),
      publicKey: parsePublicKey(x509),
      signatureAlgorithm: x509.getSignatureAlgorithmName(),
      extensions: parseExtensions(x509),
      fingerprints: await calculateFingerprints(pemCert),
      raw: pemCert,
    };

    return parsed;
  } catch (error) {
    throw new Error(`Failed to parse certificate: ${(error as Error).message}`);
  }
}

function parseDistinguishedName(dnString: string): DistinguishedName {
  const parts = dnString.split('/').filter(Boolean);
  const dn: DistinguishedName = {};

  parts.forEach((part) => {
    const [key, value] = part.split('=');
    if (key && value) {
      dn[key as keyof DistinguishedName] = value;
    }
  });

  return dn;
}

function parsePublicKey(x509: jsrsasign.X509): PublicKeyInfo {
  const pubKey = x509.getPublicKey();

  if (pubKey instanceof jsrsasign.RSAKey) {
    return {
      algorithm: 'RSA',
      keySize: pubKey.n.bitLength(),
      modulus: pubKey.n.toString(16),
      exponent: pubKey.e.toString(16),
    };
  } else if (pubKey instanceof jsrsasign.KJUR.crypto.ECDSA) {
    return {
      algorithm: 'ECDSA',
      keySize: 256,
      curve: pubKey.curveName,
    };
  }

  throw new Error('Unsupported public key algorithm');
}

function parseExtensions(x509: jsrsasign.X509): CertificateExtension[] {
  const extensions: CertificateExtension[] = [];
  const extInfo = x509.getExtInfo();

  if (extInfo) {
    Object.keys(extInfo).forEach((oid) => {
      extensions.push({
        oid,
        critical: extInfo[oid].critical || false,
        value: extInfo[oid],
      });
    });
  }

  return extensions;
}

async function calculateFingerprints(pemCert: string): Promise<Fingerprints> {
  const certHex = jsrsasign.pemtohex(pemCert);

  const sha1 = jsrsasign.KJUR.crypto.Util.hashHex(certHex, 'sha1');
  const sha256 = jsrsasign.KJUR.crypto.Util.hashHex(certHex, 'sha256');

  return {
    sha1: sha1.toUpperCase(),
    sha256: sha256.toUpperCase(),
  };
}

export function checkCertificateExpiration(cert: ParsedCertificate): {
  isExpired: boolean;
  daysUntilExpiration: number;
} {
  const now = new Date();
  const daysUntilExpiration = Math.floor(
    (cert.notAfter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    isExpired: now > cert.notAfter,
    daysUntilExpiration,
  };
}

export function formatFingerprint(fingerprint: string): string {
  return fingerprint.match(/.{1,2}/g)?.join(':') || fingerprint;
}