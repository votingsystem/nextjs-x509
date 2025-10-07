# API Reference

Complete API documentation for the X.509 Digital Signature Application.

## Table of Contents

1. [Certificate Parser](#certificate-parser)
2. [Signature Generator](#signature-generator)
3. [Signature Validator](#signature-validator)
4. [Key Management](#key-management)
5. [Utility Functions](#utility-functions)
6. [Type Definitions](#type-definitions)

---

## Certificate Parser

Module: `lib/crypto/certificate-parser.ts`

### parseCertificate()

Parses an X.509 certificate and extracts all relevant information.

**Signature:**

```typescript
async function parseCertificate(
  certData: string,
  format?: 'pem' | 'der' | 'pfx'
): Promise<ParsedCertificate>;
```

**Parameters:**

- `certData` (string): The certificate data
- `format` (string, optional): Certificate format. Default: `'pem'`
  - `'pem'`: PEM-encoded certificate
  - `'der'`: DER-encoded (hex string)
  - `'pfx'`: PKCS#12 format (not fully supported)

**Returns:**

- `Promise<ParsedCertificate>`: Parsed certificate object

**Throws:**

- `Error`: If certificate parsing fails

**Example:**

```typescript
import { parseCertificate } from '@/lib/crypto/certificate-parser';

const pemCert = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKL0UG+mRKSzMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
...
-----END CERTIFICATE-----`;

try {
  const cert = await parseCertificate(pemCert, 'pem');
  console.log('Subject:', cert.subject.CN);
  console.log('Expires:', cert.notAfter);
} catch (error) {
  console.error('Failed to parse certificate:', error);
}
```

---

### checkCertificateExpiration()

Checks if a certificate is expired and calculates days until expiration.

**Signature:**

```typescript
function checkCertificateExpiration(cert: ParsedCertificate): {
  isExpired: boolean;
  daysUntilExpiration: number;
};
```

**Parameters:**

- `cert` (ParsedCertificate): The parsed certificate

**Returns:**

- Object with:
  - `isExpired` (boolean): True if certificate is expired
  - `daysUntilExpiration` (number): Days until expiration (negative if expired)

**Example:**

```typescript
import { checkCertificateExpiration } from '@/lib/crypto/certificate-parser';

const status = checkCertificateExpiration(cert);

if (status.isExpired) {
  console.log('Certificate expired', Math.abs(status.daysUntilExpiration), 'days ago');
} else if (status.daysUntilExpiration < 30) {
  console.log('Certificate expires in', status.daysUntilExpiration, 'days');
} else {
  console.log('Certificate is valid');
}
```

---

### formatFingerprint()

Formats a fingerprint with colon separators for readability.

**Signature:**

```typescript
function formatFingerprint(fingerprint: string): string;
```

**Parameters:**

- `fingerprint` (string): Hex fingerprint string

**Returns:**

- `string`: Formatted fingerprint with colons (e.g., `AB:CD:EF:12:34:56`)

**Example:**

```typescript
import { formatFingerprint } from '@/lib/crypto/certificate-parser';

const sha256 = 'A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1B2';
const formatted = formatFingerprint(sha256);
// Result: "A1:B2:C3:D4:E5:F6:A7:B8:C9:D0:E1:F2:A3:B4:C5:D6:E7:F8:A9:B0:C1:D2:E3:F4:A5:B6:C7:D8:E9:F0:A1:B2"
```

---

## Signature Generator

Module: `lib/crypto/signature-generator.ts`

### createSignature()

Creates a digital signature for a document using PKCS#7 format.

**Signature:**

```typescript
async function createSignature(
  document: ArrayBuffer,
  certificate: string,
  privateKey: string,
  options: SignatureOptions
): Promise<SignatureResult>;
```

**Parameters:**

- `document` (ArrayBuffer): The document to sign
- `certificate` (string): PEM-encoded certificate
- `privateKey` (string): PEM-encoded private key
- `options` (SignatureOptions): Signature configuration
  - `algorithm`: Hash algorithm (`'SHA-256'` | `'SHA-384'` | `'SHA-512'`)
  - `format`: Signature format (`'pkcs7'` | `'detached'`)
  - `includeTimestamp`: Include timestamp (boolean)
  - `timestampUrl`: TSA server URL (string, optional)

**Returns:**

- `Promise<SignatureResult>`: Signature result object

**Throws:**

- `Error`: If signature generation fails

**Example:**

```typescript
import { createSignature } from '@/lib/crypto/signature-generator';

const document = await file.arrayBuffer();
const options = {
  algorithm: 'SHA-256',
  format: 'pkcs7',
  includeTimestamp: false,
};

try {
  const result = await createSignature(document, certificate, privateKey, options);

  console.log('Signature created:', result.signature);
  console.log('Algorithm:', result.algorithm);
  console.log('Timestamp:', result.timestamp);
} catch (error) {
  console.error('Signature failed:', error);
}
```

---

### calculateDocumentHash()

Calculates the hash of a document.

**Signature:**

```typescript
function calculateDocumentHash(
  document: ArrayBuffer,
  algorithm: 'SHA-256' | 'SHA-384' | 'SHA-512'
): string;
```

**Parameters:**

- `document` (ArrayBuffer): The document data
- `algorithm` (string): Hash algorithm to use

**Returns:**

- `string`: Hex-encoded hash

**Example:**

```typescript
import { calculateDocumentHash } from '@/lib/crypto/signature-generator';

const hash = calculateDocumentHash(documentBuffer, 'SHA-256');
console.log('Document hash:', hash);
```

---

## Signature Validator

Module: `lib/crypto/signature-validator.ts`

### validateSignature()

Validates a digital signature against a document.

**Signature:**

```typescript
async function validateSignature(
  document: ArrayBuffer,
  signature: string,
  options?: ValidationOptions
): Promise<ValidationResult>;
```

**Parameters:**

- `document` (ArrayBuffer): The original document
- `signature` (string): The signature to validate (PEM or Base64)
- `options` (ValidationOptions, optional): Validation configuration
  - `trustedCAs`: Array of trusted CA certificates (string[])
  - `checkExpiration`: Check certificate expiration (boolean)
  - `checkChain`: Validate certificate chain (boolean)

**Returns:**

- `Promise<ValidationResult>`: Validation result object

**Example:**

```typescript
import { validateSignature } from '@/lib/crypto/signature-validator';

const options = {
  trustedCAs: [caCert1, caCert2],
  checkExpiration: true,
  checkChain: true,
};

try {
  const result = await validateSignature(documentBuffer, signatureData, options);

  if (result.valid) {
    console.log('✅ Signature is valid');
  } else {
    console.log('❌ Signature is invalid');
    console.log('Errors:', result.errors);
  }

  if (result.warnings.length > 0) {
    console.log('⚠️ Warnings:', result.warnings);
  }
} catch (error) {
  console.error('Validation failed:', error);
}
```

---

### extractSignerCertificate()

Extracts the signer's certificate from a PKCS#7 signature.

**Signature:**

```typescript
function extractSignerCertificate(signature: string): ParsedCertificate;
```

**Parameters:**

- `signature` (string): PKCS#7 signature

**Returns:**

- `ParsedCertificate`: The signer's certificate

**Throws:**

- `Error`: If certificate extraction fails

**Example:**

```typescript
import { extractSignerCertificate } from '@/lib/crypto/signature-validator';

const signerCert = extractSignerCertificate(pkcs7Signature);
console.log('Signed by:', signerCert.subject.CN);
```

---

## Key Management

Module: `lib/crypto/key-management.ts`

### importPrivateKey()

Imports a private key from PEM format.

**Signature:**

```typescript
function importPrivateKey(keyData: string, password?: string): Promise<any>;
```

**Parameters:**

- `keyData` (string): PEM-encoded private key
- `password` (string, optional): Password for encrypted keys

**Returns:**

- `Promise<any>`: Imported key object

**Throws:**

- `Error`: If key import fails or password is incorrect

**Example:**

```typescript
import { importPrivateKey } from '@/lib/crypto/key-management';

try {
  const key = await importPrivateKey(pemKey, 'mypassword');
  console.log('Key imported successfully');
} catch (error) {
  console.error('Failed to import key:', error);
}
```

---

### validateKeyPair()

Validates that a private key matches a certificate.

**Signature:**

```typescript
function validateKeyPair(privateKey: any, certificate: ParsedCertificate): boolean;
```

**Parameters:**

- `privateKey` (any): The private key object
- `certificate` (ParsedCertificate): The certificate

**Returns:**

- `boolean`: True if key and certificate match

**Example:**

```typescript
import { validateKeyPair } from '@/lib/crypto/key-management';

const matches = validateKeyPair(privateKey, certificate);
if (matches) {
  console.log('✅ Key and certificate match');
} else {
  console.log('❌ Key and certificate do not match');
}
```

---

### clearPrivateKey()

Securely clears a private key from memory.

**Signature:**

```typescript
function clearPrivateKey(key: any): void;
```

**Parameters:**

- `key` (any): The private key object to clear

**Example:**

```typescript
import { clearPrivateKey } from '@/lib/crypto/key-management';

// After using the key
clearPrivateKey(privateKey);
```

---

## Utility Functions

### Encoding Utilities

Module: `lib/utils/encoding.ts`

#### base64ToHex()

Converts Base64 string to hexadecimal.

**Signature:**

```typescript
function base64ToHex(base64: string): string;
```

**Example:**

```typescript
import { base64ToHex } from '@/lib/utils/encoding';

const hex = base64ToHex('SGVsbG8=');
// Result: "48656c6c6f"
```

---

#### hexToBase64()

Converts hexadecimal string to Base64.

**Signature:**

```typescript
function hexToBase64(hex: string): string;
```

**Example:**

```typescript
import { hexToBase64 } from '@/lib/utils/encoding';

const base64 = hexToBase64('48656c6c6f');
// Result: "SGVsbG8="
```

---

#### arrayBufferToBase64()

Converts ArrayBuffer to Base64 string.

**Signature:**

```typescript
function arrayBufferToBase64(buffer: ArrayBuffer): string;
```

**Example:**

```typescript
import { arrayBufferToBase64 } from '@/lib/utils/encoding';

const base64 = arrayBufferToBase64(buffer);
```

---

#### base64ToArrayBuffer()

Converts Base64 string to ArrayBuffer.

**Signature:**

```typescript
function base64ToArrayBuffer(base64: string): ArrayBuffer;
```

**Example:**

```typescript
import { base64ToArrayBuffer } from '@/lib/utils/encoding';

const buffer = base64ToArrayBuffer('SGVsbG8=');
```

---

### Date Utilities

Module: `lib/utils/date.ts`

#### formatDate()

Formats a date for display.

**Signature:**

```typescript
function formatDate(date: Date): string;
```

**Example:**

```typescript
import { formatDate } from '@/lib/utils/date';

const formatted = formatDate(new Date());
// Result: "Jan 15, 2024, 10:30 AM"
```

---

#### getDaysUntil()

Calculates days until a future date.

**Signature:**

```typescript
function getDaysUntil(date: Date): number;
```

**Example:**

```typescript
import { getDaysUntil } from '@/lib/utils/date';

const days = getDaysUntil(expirationDate);
console.log(`Expires in ${days} days`);
```

---

#### isExpired()

Checks if a date is in the past.

**Signature:**

```typescript
function isExpired(date: Date): boolean;
```

**Example:**

```typescript
import { isExpired } from '@/lib/utils/date';

if (isExpired(cert.notAfter)) {
  console.log('Certificate has expired');
}
```

---

### Class Name Utility

Module: `lib/utils/cn.ts`

#### cn()

Merges and deduplicates Tailwind CSS class names.

**Signature:**

```typescript
function cn(...inputs: ClassValue[]): string;
```

**Example:**

```typescript
import { cn } from '@/lib/utils/cn';

const className = cn('px-4 py-2', isActive && 'bg-blue-500', 'hover:bg-blue-600');
```

---

## Type Definitions

Module: `types/index.ts`

### ParsedCertificate

```typescript
interface ParsedCertificate {
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
```

---

### DistinguishedName

```typescript
interface DistinguishedName {
  CN?: string; // Common Name
  O?: string; // Organization
  OU?: string; // Organizational Unit
  L?: string; // Locality
  ST?: string; // State/Province
  C?: string; // Country
  E?: string; // Email
}
```

---

### PublicKeyInfo

```typescript
interface PublicKeyInfo {
  algorithm: 'RSA' | 'ECDSA';
  keySize: number;
  modulus?: string; // For RSA
  exponent?: string; // For RSA
  curve?: string; // For ECDSA
}
```

---

### SignatureOptions

```typescript
interface SignatureOptions {
  algorithm: 'SHA-256' | 'SHA-384' | 'SHA-512';
  format: 'pkcs7' | 'detached';
  includeTimestamp: boolean;
  timestampUrl?: string;
}
```

---

### SignatureResult

```typescript
interface SignatureResult {
  signature: string;
  algorithm: string;
  timestamp?: Date;
  certificate: ParsedCertificate;
  metadata: SignatureMetadata;
}
```

---

### ValidationResult

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  details: ValidationDetails;
  signerCertificate: ParsedCertificate;
  certificateChain?: ParsedCertificate[];
}
```

---

### ValidationDetails

```typescript
interface ValidationDetails {
  signatureValid: boolean;
  hashMatch: boolean;
  certificateValid: boolean;
  chainValid?: boolean;
  timestamp?: Date;
  algorithm: string;
}
```

---

## Error Handling

All async functions may throw errors. Always use try-catch blocks:

```typescript
try {
  const result = await someAsyncFunction();
  // Handle success
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  }
  // Handle error
}
```

Common error types:

- `Error`: General errors with descriptive messages
- `TypeError`: Invalid parameter types
- `RangeError`: Values out of acceptable range

---

## Best Practices

1. **Always validate inputs** before processing
2. **Clear sensitive data** (private keys) after use
3. **Handle errors gracefully** with user-friendly messages
4. **Use TypeScript types** for better type safety
5. **Test edge cases** thoroughly

---

## Version History

- **v1.0.0** (2025-10-07): Initial API release

---

For more information, see:

- [User Guide](user-guide.md)
- [Development Guide](development.md)
- [GitHub Repository](https://github.com/yourusername/nextjs-x509)
