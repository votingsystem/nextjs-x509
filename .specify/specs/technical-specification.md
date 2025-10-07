# X.509 Digital Signature Application - Technical Specification

**Version:** 1.0.0  
**Date:** 2025-10-07  
**Status:** Draft

---

## 1. Architecture Overview

### 1.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React UI Components                      │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │  │
│  │  │   Sign     │  │  Validate  │  │   Cert     │     │  │
│  │  │  Documents │  │ Signatures │  │  Viewer    │     │  │
│  │  └────────────┘  └────────────┘  └────────────┘     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Business Logic Layer                     │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │  │
│  │  │Certificate │  │ Signature  │  │ Validation │     │  │
│  │  │  Manager   │  │  Service   │  │  Service   │     │  │
│  │  └────────────┘  └────────────┘  └────────────┘     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Cryptographic Operations Layer              │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │  │
│  │  │ Web Crypto │  │   PKI.js   │  │node-forge  │     │  │
│  │  │    API     │  │            │  │            │     │  │
│  │  └────────────┘  └────────────┘  └────────────┘     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Optional API Calls
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Server (Optional)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  API Routes                           │  │
│  │  • /api/validate-certificate                          │  │
│  │  • /api/timestamp                                     │  │
│  │  • /api/revocation-check                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

#### Frontend

- **Framework:** Next.js 15.5.4 (App Router)
- **UI Library:** React 19.1.0
- **Language:** TypeScript 5.x (strict mode)
- **Styling:** Tailwind CSS 4.x
- **State Management:** React hooks + Context API (minimal)

#### Cryptographic Libraries

- **PKI.js:** X.509 certificate parsing and validation
- **node-forge:** Additional crypto operations and format conversions
- **Web Crypto API:** Native browser cryptography

#### Additional Libraries

- **pdf-lib:** PDF signature embedding
- **file-saver:** File download handling
- **clsx:** Conditional class names
- **zod:** Runtime type validation

---

## 2. Project Structure

```
nextjs-x509/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home/Dashboard
│   ├── sign/                    # Document signing section
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── validate/                # Signature validation section
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── certificates/            # Certificate management
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   │   └── page.tsx        # Certificate details
│   │   └── generate/
│   │       └── page.tsx        # Certificate generation
│   ├── api/                     # API routes (optional)
│   │   ├── validate-certificate/
│   │   │   └── route.ts
│   │   ├── timestamp/
│   │   │   └── route.ts
│   │   └── revocation-check/
│   │       └── route.ts
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Alert.tsx
│   │   ├── Badge.tsx
│   │   ├── Dialog.tsx
│   │   ├── Tabs.tsx
│   │   └── FileUpload.tsx
│   ├── certificates/            # Certificate-related components
│   │   ├── CertificateUpload.tsx
│   │   ├── CertificateViewer.tsx
│   │   ├── CertificateCard.tsx
│   │   ├── CertificateChain.tsx
│   │   └── CertificateDetails.tsx
│   ├── signing/                 # Signing components
│   │   ├── DocumentUpload.tsx
│   │   ├── SignatureOptions.tsx
│   │   ├── SigningProgress.tsx
│   │   └── SignatureResult.tsx
│   ├── validation/              # Validation components
│   │   ├── ValidationUpload.tsx
│   │   ├── ValidationResult.tsx
│   │   ├── ValidationDetails.tsx
│   │   └── TrustStoreManager.tsx
│   └── layout/                  # Layout components
│       ├── Header.tsx
│       ├── Navigation.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
│
├── lib/                         # Business logic and utilities
│   ├── crypto/                  # Cryptographic operations
│   │   ├── certificate.ts       # Certificate operations
│   │   ├── signature.ts         # Signature operations
│   │   ├── validation.ts        # Validation logic
│   │   ├── key-management.ts    # Private key handling
│   │   └── hash.ts              # Hashing utilities
│   ├── parsers/                 # File parsers
│   │   ├── pem-parser.ts
│   │   ├── der-parser.ts
│   │   ├── pfx-parser.ts
│   │   └── pdf-parser.ts
│   ├── formatters/              # Output formatters
│   │   ├── certificate-formatter.ts
│   │   ├── signature-formatter.ts
│   │   └── validation-formatter.ts
│   ├── utils/                   # Utility functions
│   │   ├── file-utils.ts
│   │   ├── date-utils.ts
│   │   ├── encoding-utils.ts
│   │   └── error-utils.ts
│   └── constants.ts             # Application constants
│
├── types/                       # TypeScript type definitions
│   ├── certificate.types.ts
│   ├── signature.types.ts
│   ├── validation.types.ts
│   ├── api.types.ts
│   └── index.ts
│
├── hooks/                       # Custom React hooks
│   ├── useCertificate.ts
│   ├── useSignature.ts
│   ├── useValidation.ts
│   ├── useFileUpload.ts
│   └── useLocalStorage.ts
│
├── context/                     # React Context providers
│   ├── CertificateContext.tsx
│   ├── SignatureContext.tsx
│   └── ThemeContext.tsx
│
├── config/                      # Configuration files
│   ├── crypto-config.ts
│   ├── app-config.ts
│   └── validation-config.ts
│
├── public/                      # Static assets
│   ├── icons/
│   └── images/
│
├── tests/                       # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .specify/                    # Project specifications
│   ├── specs/
│   │   ├── product-requirements.md
│   │   └── technical-specification.md
│   └── memory/
│       └── constitution.md
│
└── docs/                        # Documentation
    ├── user-guide.md
    ├── api-reference.md
    └── development.md
```

---

## 3. Core Modules

### 3.1 Certificate Management Module

**Location:** `lib/crypto/certificate.ts`

**Responsibilities:**

- Parse X.509 certificates (PEM, DER, PFX formats)
- Extract certificate information
- Validate certificate chains
- Check certificate expiration
- Calculate certificate fingerprints

**Key Functions:**

```typescript
// Parse certificate from various formats
export async function parseCertificate(
  data: ArrayBuffer | string,
  format: 'pem' | 'der' | 'pfx',
  password?: string
): Promise<ParsedCertificate>;

// Validate certificate chain
export async function validateCertificateChain(
  certificate: ParsedCertificate,
  chain: ParsedCertificate[],
  trustedCAs: ParsedCertificate[]
): Promise<ValidationResult>;

// Check certificate expiration
export function checkCertificateExpiration(
  certificate: ParsedCertificate
): ExpirationStatus;

// Extract certificate details
export function extractCertificateDetails(
  certificate: ParsedCertificate
): CertificateDetails;

// Calculate fingerprints
export async function calculateFingerprints(
  certificate: ParsedCertificate
): Promise<Fingerprints>;
```

### 3.2 Signature Creation Module

**Location:** `lib/crypto/signature.ts`

**Responsibilities:**

- Generate digital signatures
- Support multiple signature formats (PKCS#7, detached, PDF)
- Handle different hash algorithms
- Include timestamps in signatures
- Manage private key operations

**Key Functions:**

```typescript
// Create digital signature
export async function createSignature(
  document: ArrayBuffer,
  certificate: ParsedCertificate,
  privateKey: CryptoKey,
  options: SignatureOptions
): Promise<SignatureResult>;

// Create detached signature
export async function createDetachedSignature(
  documentHash: ArrayBuffer,
  certificate: ParsedCertificate,
  privateKey: CryptoKey,
  algorithm: HashAlgorithm
): Promise<ArrayBuffer>;

// Embed signature in PDF
export async function embedPDFSignature(
  pdfDocument: ArrayBuffer,
  signature: ArrayBuffer,
  certificate: ParsedCertificate
): Promise<ArrayBuffer>;

// Add timestamp to signature
export async function addTimestamp(
  signature: ArrayBuffer,
  timestampURL?: string
): Promise<ArrayBuffer>;
```

### 3.3 Signature Validation Module

**Location:** `lib/crypto/validation.ts`

**Responsibilities:**

- Verify signature cryptographic integrity
- Validate certificate chains
- Check certificate revocation status
- Validate timestamps
- Generate validation reports

**Key Functions:**

```typescript
// Validate signature
export async function validateSignature(
  document: ArrayBuffer,
  signature: ArrayBuffer,
  options: ValidationOptions
): Promise<ValidationResult>;

// Verify signature integrity
export async function verifySignatureIntegrity(
  document: ArrayBuffer,
  signature: ArrayBuffer,
  publicKey: CryptoKey
): Promise<boolean>;

// Validate certificate chain
export async function validateChain(
  signerCertificate: ParsedCertificate,
  chain: ParsedCertificate[],
  trustedCAs: ParsedCertificate[]
): Promise<ChainValidationResult>;

// Check revocation status
export async function checkRevocationStatus(
  certificate: ParsedCertificate,
  options: RevocationCheckOptions
): Promise<RevocationStatus>;

// Validate timestamp
export async function validateTimestamp(
  timestamp: ArrayBuffer
): Promise<TimestampValidationResult>;
```

### 3.4 Key Management Module

**Location:** `lib/crypto/key-management.ts`

**Responsibilities:**

- Import private keys
- Decrypt encrypted keys
- Validate key-certificate pairs
- Secure memory clearing
- Key format conversions

**Key Functions:**

```typescript
// Import private key
export async function importPrivateKey(
  keyData: ArrayBuffer | string,
  format: 'pem' | 'pkcs8',
  password?: string
): Promise<CryptoKey>;

// Decrypt private key
export async function decryptPrivateKey(
  encryptedKey: ArrayBuffer,
  password: string
): Promise<ArrayBuffer>;

// Validate key-certificate pair
export async function validateKeyPair(
  privateKey: CryptoKey,
  certificate: ParsedCertificate
): Promise<boolean>;

// Clear sensitive data from memory
export function clearSensitiveData(data: ArrayBuffer | CryptoKey): void;

// Convert key formats
export async function convertKeyFormat(
  key: CryptoKey,
  targetFormat: 'pem' | 'pkcs8' | 'jwk'
): Promise<string | ArrayBuffer>;
```

---

## 4. Data Models

### 4.1 Certificate Types

**Location:** `types/certificate.types.ts`

```typescript
export interface ParsedCertificate {
  version: number;
  serialNumber: string;
  issuer: DistinguishedName;
  subject: DistinguishedName;
  notBefore: Date;
  notAfter: Date;
  publicKey: PublicKeyInfo;
  signatureAlgorithm: AlgorithmIdentifier;
  extensions: CertificateExtension[];
  raw: ArrayBuffer;
}

export interface DistinguishedName {
  commonName?: string;
  organization?: string;
  organizationalUnit?: string;
  locality?: string;
  state?: string;
  country?: string;
  email?: string;
}

export interface PublicKeyInfo {
  algorithm: 'RSA' | 'ECDSA';
  keySize: number;
  key: CryptoKey;
  parameters?: any;
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

export interface ExpirationStatus {
  isExpired: boolean;
  daysUntilExpiration: number;
  notBefore: Date;
  notAfter: Date;
}
```

### 4.2 Signature Types

**Location:** `types/signature.types.ts`

```typescript
export interface SignatureOptions {
  algorithm: HashAlgorithm;
  format: SignatureFormat;
  includeTimestamp: boolean;
  timestampURL?: string;
  detached: boolean;
}

export type HashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512';

export type SignatureFormat = 'pkcs7' | 'cms' | 'pdf' | 'raw';

export interface SignatureResult {
  signature: ArrayBuffer;
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

export interface DetachedSignature {
  signature: ArrayBuffer;
  algorithm: string;
  certificate: ParsedCertificate;
  format: 'base64' | 'binary';
}
```

### 4.3 Validation Types

**Location:** `types/validation.types.ts`

```typescript
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

export type ValidationStatus =
  | 'valid'
  | 'valid-with-warnings'
  | 'invalid'
  | 'unknown';

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
  revocationStatus?: RevocationStatus;
  certificateChain: ParsedCertificate[];
  signedAt?: Date;
  validatedAt: Date;
}

export interface RevocationStatus {
  checked: boolean;
  revoked: boolean;
  reason?: string;
  revokedAt?: Date;
  method: 'CRL' | 'OCSP' | 'none';
}

export interface ChainValidationResult {
  valid: boolean;
  chain: ParsedCertificate[];
  trustedRoot?: ParsedCertificate;
  errors: string[];
}
```

---

## 5. Component Specifications

### 5.1 Certificate Upload Component

**Location:** `components/certificates/CertificateUpload.tsx`

**Props:**

```typescript
interface CertificateUploadProps {
  onCertificateLoaded: (certificate: ParsedCertificate) => void;
  onError: (error: Error) => void;
  acceptedFormats?: ('pem' | 'der' | 'pfx')[];
  requirePrivateKey?: boolean;
}
```

**Features:**

- Drag-and-drop file upload
- Format auto-detection
- Password input for encrypted files
- Real-time validation
- Error handling with user feedback

### 5.2 Certificate Viewer Component

**Location:** `components/certificates/CertificateViewer.tsx`

**Props:**

```typescript
interface CertificateViewerProps {
  certificate: ParsedCertificate;
  showChain?: boolean;
  expandable?: boolean;
  onExport?: (format: 'json' | 'text' | 'pem') => void;
}
```

**Features:**

- Hierarchical display of certificate data
- Expandable sections
- Expiration warnings
- Fingerprint display
- Export functionality

### 5.3 Signature Options Component

**Location:** `components/signing/SignatureOptions.tsx`

**Props:**

```typescript
interface SignatureOptionsProps {
  onOptionsChange: (options: SignatureOptions) => void;
  defaultOptions?: Partial<SignatureOptions>;
  availableAlgorithms?: HashAlgorithm[];
}
```

**Features:**

- Algorithm selection
- Format selection
- Timestamp options
- Output format preferences
- Validation of selections

### 5.4 Validation Result Component

**Location:** `components/validation/ValidationResult.tsx`

**Props:**

```typescript
interface ValidationResultProps {
  result: ValidationResult;
  showDetails?: boolean;
  onExportReport?: () => void;
}
```

**Features:**

- Visual status indicators (✅ ⚠️ ❌)
- Expandable error/warning details
- Certificate chain visualization
- Export validation report
- Timestamp information

---

## 6. API Specifications

### 6.1 Certificate Validation API

**Endpoint:** `POST /api/validate-certificate`

**Request:**

```typescript
interface ValidateCertificateRequest {
  certificate: string; // base64 encoded
  chain?: string[]; // base64 encoded certificates
  options?: {
    checkRevocation?: boolean;
    trustedCAs?: string[];
  };
}
```

**Response:**

```typescript
interface ValidateCertificateResponse {
  valid: boolean;
  chain: string[];
  errors: string[];
  warnings: string[];
  revocationStatus?: {
    checked: boolean;
    revoked: boolean;
  };
}
```

### 6.2 Timestamp Service API

**Endpoint:** `POST /api/timestamp`

**Request:**

```typescript
interface TimestampRequest {
  hash: string; // hex encoded hash
  algorithm: HashAlgorithm;
}
```

**Response:**

```typescript
interface TimestampResponse {
  timestamp: string; // RFC 3161 timestamp token (base64)
  time: string; // ISO 8601 timestamp
  serialNumber: string;
}
```

---

## 7. Security Implementation

### 7.1 Client-Side Security

**Private Key Handling:**

```typescript
// Never store private keys
// Clear from memory immediately after use
export class SecureKeyManager {
  private key: CryptoKey | null = null;

  async loadKey(keyData: ArrayBuffer, password?: string): Promise<void> {
    this.key = await importPrivateKey(keyData, 'pkcs8', password);
  }

  async sign(data: ArrayBuffer): Promise<ArrayBuffer> {
    if (!this.key) throw new Error('No key loaded');
    const signature = await crypto.subtle.sign(
      { name: 'RSASSA-PKCS1-v1_5' },
      this.key,
      data
    );
    return signature;
  }

  clear(): void {
    this.key = null;
    // Force garbage collection hint
    if (global.gc) global.gc();
  }
}
```

**Content Security Policy:**

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];
```

### 7.2 Input Validation

**File Upload Validation:**

```typescript
export function validateFileUpload(
  file: File,
  options: {
    maxSize: number;
    allowedTypes: string[];
  }
): ValidationResult {
  const errors: string[] = [];

  // Size check
  if (file.size > options.maxSize) {
    errors.push(`File size exceeds ${options.maxSize / 1024 / 1024}MB`);
  }

  // Type check
  if (!options.allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} not allowed`);
  }

  // Name sanitization
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

  return {
    valid: errors.length === 0,
    errors,
    sanitizedName,
  };
}
```

---

## 8. Performance Optimization

### 8.1 Code Splitting

```typescript
// Dynamic imports for heavy components
const CertificateViewer = dynamic(
  () => import('@/components/certificates/CertificateViewer'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

const PDFSigner = dynamic(() => import('@/lib/crypto/pdf-signer'), {
  ssr: false,
});
```

### 8.2 Web Worker for Heavy Operations

```typescript
// lib/workers/crypto-worker.ts
self.addEventListener('message', async (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'SIGN_DOCUMENT':
      const signature = await signDocument(data);
      self.postMessage({ type: 'SIGN_COMPLETE', signature });
      break;

    case 'VALIDATE_SIGNATURE':
      const result = await validateSignature(data);
      self.postMessage({ type: 'VALIDATION_COMPLETE', result });
      break;
  }
});
```

### 8.3 Caching Strategy

```typescript
// Cache parsed certificates in session
export class CertificateCache {
  private cache = new Map<string, ParsedCertificate>();

  set(fingerprint: string, certificate: ParsedCertificate): void {
    this.cache.set(fingerprint, certificate);
  }

  get(fingerprint: string): ParsedCertificate | undefined {
    return this.cache.get(fingerprint);
  }

  clear(): void {
    this.cache.clear();
  }
}
```

---

## 9. Error Handling

### 9.1 Error Types

```typescript
export class CertificateError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'CertificateError';
  }
}

export class SignatureError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'SignatureError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### 9.2 Error Boundary

```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  state = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

---

## 10. Testing Strategy

### 10.1 Unit Tests

```typescript
// tests/unit/certificate.test.ts
describe('Certificate Parser', () => {
  it('should parse PEM certificate', async () => {
    const pem = readTestCertificate('test-cert.pem');
    const cert = await parseCertificate(pem, 'pem');

    expect(cert.subject.commonName).toBe('Test Certificate');
    expect(cert.version).toBe(3);
  });

  it('should validate certificate chain', async () => {
    const cert = await parseCertificate(testCert, 'pem');
    const chain = await parseChain(testChain);
    const result = await validateCertificateChain(cert, chain, []);

    expect(result.valid).toBe(true);
  });
});
```

### 10.2 Integration Tests

```typescript
// tests/integration/signing.test.ts
describe('Document Signing Flow', () => {
  it('should sign and validate document', async () => {
    // Load certificate and key
    const cert = await loadTestCertificate();
    const key = await loadTestPrivateKey();

    // Sign document
    const document = new TextEncoder().encode('Test document');
    const signature = await createSignature(document, cert, key, {
      algorithm: 'SHA-256',
      format: 'pkcs7',
      includeTimestamp: false,
      detached: true,
    });

    // Validate signature
    const result = await validateSignature(document, signature.signature, {
      trustedCAs: [cert],
      checkRevocation: false,
      validateTimestamp: false,
      allowExpiredCertificates: true,
    });

    expect(result.valid).toBe(true);
  });
});
```

---

## 11. Deployment

### 11.1 Build Configuration

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 11.2 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_APP_NAME=X.509 Digital Signature Tool
NEXT_PUBLIC_MAX_FILE_SIZE=52428800
NEXT_PUBLIC_TIMESTAMP_URL=https://timestamp.example.com
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

---

## 12. Monitoring and Logging

### 12.1 Client-Side Logging

```typescript
export class Logger {
  static info(message: string, data?: any): void {
    console.log(`[INFO] ${message}`, data);
  }

  static error(message: string, error?: Error): void {
    console.error(`[ERROR] ${message}`, error);
    // Send to monitoring service if configured
  }

  static warn(message: string, data?: any): void {
    console.warn(`[WARN] ${message}`, data);
  }
}
```

---

## Appendix A: Dependencies

### Production Dependencies

```json
{
  "dependencies": {
    "next": "15.5.4",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "pkijs": "^3.0.0",
    "node-forge": "^1.3.1",
    "pdf-lib": "^1.17.1",
    "file-saver": "^2.0.5",
    "clsx": "^2.0.0",
    "zod": "^3.22.0"
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/node-forge": "^1.3.0",
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "eslint": "^8",
    "eslint-config-next": "15.5.4"
  }
}
```

---

**Document Control:**

- **Author:** Technical Team
- **Reviewers:** Architecture Team, Security Team
- **Approval:** Pending
- **Next Review:** 2025-11-07
