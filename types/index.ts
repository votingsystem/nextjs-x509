// Certificate Types
export interface ParsedCertificate {
  version: number;
  serialNumber: string;
  issuer: DistinguishedName;
  subject: DistinguishedName;
  notBefore: Date;
  notAfter: Date;
  publicKey: PublicKeyInfo;
  signatureAlgorithm: string;
  extensions: CertificateExtension[];
  fingerprints: Fingerprints;
  raw: string;
}

export interface DistinguishedName {
  CN?: string;
  O?: string;
  OU?: string;
  L?: string;
  ST?: string;
  C?: string;
  E?: string;
}

export interface PublicKeyInfo {
  algorithm: 'RSA' | 'ECDSA';
  keySize: number;
  modulus?: string;
  exponent?: string;
  curve?: string;
}

export interface CertificateExtension {
  oid: string;
  critical: boolean;
  value: any;
}

export interface Fingerprints {
  sha1: string;
  sha256: string;
}

// Signature Types
export interface SignatureOptions {
  algorithm: HashAlgorithm;
  format: SignatureFormat;
  includeTimestamp: boolean;
  timestampURL?: string;
}

export type HashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512';
export type SignatureFormat = 'pkcs7' | 'detached' | 'pdf';

export interface SignatureResult {
  signature: string;
  format: SignatureFormat;
  algorithm: string;
  certificate: ParsedCertificate;
  timestamp?: Date;
  metadata: SignatureMetadata;
}

export interface SignatureMetadata {
  signedAt: Date;
  signerInfo: DistinguishedName;
  algorithm: string;
  hashAlgorithm: HashAlgorithm;
  certificateFingerprint: string;
}

// Validation Types
export interface ValidationOptions {
  trustedCAs?: ParsedCertificate[];
  checkRevocation: boolean;
  validateTimestamp: boolean;
  allowExpiredCertificates: boolean;
}

export interface ValidationResult {
  valid: boolean;
  status: ValidationStatus;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  details: ValidationDetails;
  timestamp: Date;
}

export type ValidationStatus = 'valid' | 'valid-with-warnings' | 'invalid' | 'unknown';

export interface ValidationError {
  code: string;
  message: string;
  severity: 'error' | 'critical';
}

export interface ValidationWarning {
  code: string;
  message: string;
  severity: 'warning' | 'info';
}

export interface ValidationDetails {
  signatureValid: boolean;
  certificateValid: boolean;
  chainValid: boolean;
  timestampValid?: boolean;
  certificateChain: ParsedCertificate[];
  signedAt?: Date;
  validatedAt: Date;
}