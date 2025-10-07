import * as jsrsasign from 'jsrsasign';
import { ParsedCertificate } from '@/types';

export async function importPrivateKey(
  keyData: string,
  password?: string
): Promise<string> {
  try {
    let privateKeyPEM: string;

    // Check if key is encrypted
    if (keyData.includes('ENCRYPTED')) {
      if (!password) {
        throw new Error('Password required for encrypted private key');
      }
      // Decrypt the key
      privateKeyPEM = jsrsasign.KEYUTIL.getDecryptedKeyHex(keyData, password);
      // Convert hex to PEM
      privateKeyPEM = jsrsasign.KEYUTIL.getPEM(privateKeyPEM, 'PRIVATE KEY');
    } else {
      privateKeyPEM = keyData;
    }

    // Validate the key format
    const key = jsrsasign.KEYUTIL.getKey(privateKeyPEM);
    if (!key) {
      throw new Error('Invalid private key format');
    }

    return privateKeyPEM;
  } catch (error) {
    throw new Error(`Failed to import private key: ${(error as Error).message}`);
  }
}

export async function validateKeyPair(
  privateKeyPEM: string,
  certificate: ParsedCertificate
): Promise<boolean> {
  try {
    // Get the private key
    const privateKey = jsrsasign.KEYUTIL.getKey(privateKeyPEM);
    
    // Create a test signature
    const testData = 'test-data-for-validation';
    const testDataHex = jsrsasign.rstrtohex(testData);
    
    // Sign with private key
    const sig = new jsrsasign.KJUR.crypto.Signature({ alg: 'SHA256withRSA' });
    sig.init(privateKey);
    sig.updateHex(testDataHex);
    const signatureHex = sig.sign();
    
    // Verify with public key from certificate
    const x509 = new jsrsasign.X509();
    x509.readCertPEM(certificate.raw);
    const publicKey = x509.getPublicKey();
    
    const verifier = new jsrsasign.KJUR.crypto.Signature({ alg: 'SHA256withRSA' });
    verifier.init(publicKey);
    verifier.updateHex(testDataHex);
    const isValid = verifier.verify(signatureHex);
    
    return isValid;
  } catch (error) {
    console.error('Key pair validation error:', error);
    return false;
  }
}

export function clearSensitiveData(data: string): void {
  // Overwrite the string in memory (best effort)
  data = '';
  // Trigger garbage collection if available
  if (typeof global !== 'undefined' && (global as any).gc) {
    (global as any).gc();
  }
}

export async function extractPrivateKeyFromPFX(
  pfxData: string,
  password: string
): Promise<string> {
  try {
    // Parse PFX/P12 file
    const pfxHex = jsrsasign.b64tohex(pfxData);
    const pkcs12 = jsrsasign.KJUR.asn1.ASN1Util.getPEMStringFromHex(pfxHex, 'PKCS12');
    
    // Extract private key
    const privateKey = jsrsasign.KEYUTIL.getKeyFromPlainPrivatePKCS8PEM(pkcs12);
    const privateKeyPEM = jsrsasign.KEYUTIL.getPEM(privateKey, 'PRIVATE KEY');
    
    return privateKeyPEM;
  } catch (error) {
    throw new Error(`Failed to extract private key from PFX: ${(error as Error).message}`);
  }
}

export function generateKeyPair(
  algorithm: 'RSA' | 'ECDSA' = 'RSA',
  keySize: number = 2048
): { privateKey: string; publicKey: string } {
  try {
    if (algorithm === 'RSA') {
      const keypair = jsrsasign.KEYUTIL.generateKeypair('RSA', keySize);
      const privateKeyPEM = jsrsasign.KEYUTIL.getPEM(keypair.prvKeyObj, 'PKCS8PRV');
      const publicKeyPEM = jsrsasign.KEYUTIL.getPEM(keypair.pubKeyObj, 'PKCS8PUB');
      
      return {
        privateKey: privateKeyPEM,
        publicKey: publicKeyPEM,
      };
    } else {
      // ECDSA
      const curveName = keySize === 256 ? 'secp256r1' : 'secp384r1';
      const keypair = jsrsasign.KEYUTIL.generateKeypair('EC', curveName);
      const privateKeyPEM = jsrsasign.KEYUTIL.getPEM(keypair.prvKeyObj, 'PKCS8PRV');
      const publicKeyPEM = jsrsasign.KEYUTIL.getPEM(keypair.pubKeyObj, 'PKCS8PUB');
      
      return {
        privateKey: privateKeyPEM,
        publicKey: publicKeyPEM,
      };
    }
  } catch (error) {
    throw new Error(`Failed to generate key pair: ${(error as Error).message}`);
  }
}