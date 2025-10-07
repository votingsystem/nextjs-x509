import * as jsrsasign from 'jsrsasign';
import { SignatureOptions, SignatureResult, ParsedCertificate } from '@/types';

export async function createSignature(
  documentData: string | ArrayBuffer,
  certificate: ParsedCertificate,
  privateKeyPEM: string,
  options: SignatureOptions
): Promise<SignatureResult> {
  try {
    // Convert document to hex
    const documentHex =
      typeof documentData === 'string'
        ? jsrsasign.rstrtohex(documentData)
        : jsrsasign.ArrayBuffertohex(documentData);

    // Calculate document hash
    const hashAlg = options.algorithm.replace('-', '').toLowerCase();
    const documentHash = jsrsasign.KJUR.crypto.Util.hashHex(documentHex, hashAlg);

    // Determine signature algorithm based on key type
    const sigAlg = certificate.publicKey.algorithm === 'RSA' 
      ? `${hashAlg}withRSA` 
      : `${hashAlg}withECDSA`;

    // Create signature
    const sig = new jsrsasign.KJUR.crypto.Signature({ alg: sigAlg });
    sig.init(privateKeyPEM);
    sig.updateHex(documentHash);
    const signatureHex = sig.sign();

    // Create PKCS#7 signature if requested
    let signatureBase64: string;
    
    if (options.format === 'pkcs7') {
      const sd = new jsrsasign.KJUR.asn1.cms.SignedData({
        content: { hex: documentHex },
        certs: [certificate.raw],
        signerInfos: [
          {
            hashAlg: hashAlg,
            sAttr: { SigningTime: {} },
            signerCert: certificate.raw,
            sigAlg: sigAlg,
            signerPrvKey: privateKeyPEM,
          },
        ],
      });
      signatureBase64 = jsrsasign.hextob64(sd.getContentInfo().getEncodedHex());
    } else {
      // Detached signature
      signatureBase64 = jsrsasign.hextob64(signatureHex);
    }

    const result: SignatureResult = {
      signature: signatureBase64,
      format: options.format,
      algorithm: sigAlg,
      certificate,
      timestamp: options.includeTimestamp ? new Date() : undefined,
      metadata: {
        signedAt: new Date(),
        signerInfo: certificate.subject,
        algorithm: sigAlg,
        hashAlgorithm: options.algorithm,
        certificateFingerprint: certificate.fingerprints.sha256,
      },
    };

    return result;
  } catch (error) {
    throw new Error(`Failed to create signature: ${(error as Error).message}`);
  }
}

export async function signDocument(
  document: File,
  certificate: ParsedCertificate,
  privateKeyPEM: string,
  options: SignatureOptions
): Promise<SignatureResult> {
  const arrayBuffer = await document.arrayBuffer();
  return createSignature(arrayBuffer, certificate, privateKeyPEM, options);
}

export function clearPrivateKey(privateKeyPEM: string): void {
  // Overwrite the string in memory (best effort)
  // Note: JavaScript doesn't provide true memory clearing
  privateKeyPEM = '';
  if (global.gc) {
    global.gc();
  }
}

export function downloadSignature(signature: string, filename: string): void {
  const blob = new Blob([signature], { type: 'application/pkcs7-signature' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}