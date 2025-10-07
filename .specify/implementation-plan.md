# X.509 Digital Signature Application - Implementation Plan

**Version:** 1.0.0  
**Date:** 2025-10-07  
**Status:** Ready for Implementation

---

## 1. Technology Stack (Updated)

### 1.1 Core Framework

```json
{
  "framework": "Next.js 14+",
  "router": "App Router",
  "react": "18+",
  "typescript": "5.x",
  "node": "18+"
}
```

### 1.2 Cryptography Libraries

**Primary Libraries:**

- **jsrsasign** (v10.9.0+): X.509 certificate operations, signature creation/validation
- **asn1js** (v3.0.5+): ASN.1 parsing and encoding

**Why these libraries?**

- `jsrsasign`: Comprehensive, pure JavaScript, well-maintained, supports all required operations
- `asn1js`: Industry standard for ASN.1 operations, used by PKI.js

### 1.3 UI Components

**Styling & Components:**

- **Tailwind CSS** (v3.4+): Utility-first CSS framework
- **shadcn/ui**: High-quality, accessible React components
- **lucide-react**: Modern icon library

**Additional UI:**

- `@radix-ui/react-*`: Headless UI primitives (used by shadcn/ui)
- `class-variance-authority`: Component variants
- `tailwind-merge`: Merge Tailwind classes

### 1.4 Standards Compliance

- ✅ X.509 v3 certificate standard (RFC 5280)
- ✅ PKCS#7/CMS (RFC 5652)
- ✅ PKCS#12 for certificate/key packaging
- ✅ RFC 3161 for timestamping

---

## 2. Project Setup

### 2.1 Initialize Project

```bash
# Create Next.js project with TypeScript
npx create-next-app@latest nextjs-x509 --typescript --tailwind --app --no-src-dir

cd nextjs-x509

# Install cryptography libraries
npm install jsrsasign asn1js

# Install UI components and utilities
npm install lucide-react class-variance-authority clsx tailwind-merge

# Install shadcn/ui
npx shadcn-ui@latest init

# Install development dependencies
npm install -D @types/jsrsasign vitest @testing-library/react @testing-library/jest-dom
```

### 2.2 Configure shadcn/ui

```bash
# Add required components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add accordion
```

### 2.3 Project Structure Setup

```bash
# Create directory structure
mkdir -p components/{ui,certificates,signing,validation,layout}
mkdir -p lib/{crypto,parsers,formatters,utils}
mkdir -p types
mkdir -p hooks
mkdir -p context
mkdir -p config
mkdir -p app/{sign,validate,certificates}
mkdir -p tests/{unit,integration}
```

---

## 3. Implementation Phases

### Phase 1: Foundation & Core Setup (Week 1)

#### 3.1.1 Project Configuration

**Tasks:**

- [x] Initialize Next.js project
- [ ] Configure TypeScript (strict mode)
- [ ] Setup Tailwind CSS
- [ ] Configure shadcn/ui
- [ ] Setup ESLint and Prettier
- [ ] Configure path aliases (@/\*)

**Files to Create:**

```
tsconfig.json          # TypeScript configuration
next.config.ts         # Next.js configuration
tailwind.config.ts     # Tailwind configuration
.eslintrc.json         # ESLint rules
.prettierrc            # Prettier rules
```

**Example tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### 3.1.2 Type Definitions

**Create:** `types/index.ts`

```typescript
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
  raw: string; // PEM or base64
}

export interface DistinguishedName {
  CN?: string; // Common Name
  O?: string; // Organization
  OU?: string; // Organizational Unit
  L?: string; // Locality
  ST?: string; // State
  C?: string; // Country
  E?: string; // Email
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
  signature: string; // base64
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
  certificateChain: ParsedCertificate[];
  signedAt?: Date;
  validatedAt: Date;
}
```

#### 3.1.3 Utility Functions

**Create:** `lib/utils/cn.ts`

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Create:** `lib/utils/encoding.ts`

```typescript
export function base64ToHex(base64: string): string {
  const raw = atob(base64);
  let hex = '';
  for (let i = 0; i < raw.length; i++) {
    const hexByte = raw.charCodeAt(i).toString(16);
    hex += hexByte.length === 2 ? hexByte : '0' + hexByte;
  }
  return hex.toUpperCase();
}

export function hexToBase64(hex: string): string {
  const bytes = hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [];
  const binary = String.fromCharCode(...bytes);
  return btoa(binary);
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
```

---

### Phase 2: Certificate Management (Week 2)

#### 3.2.1 Certificate Parser

**Create:** `lib/crypto/certificate-parser.ts`

```typescript
import * as jsrsasign from 'jsrsasign';
import {
  ParsedCertificate,
  DistinguishedName,
  PublicKeyInfo,
  Fingerprints,
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
      // Convert DER to PEM
      pemCert = jsrsasign.KJUR.asn1.ASN1Util.getPEMStringFromHex(
        certData,
        'CERTIFICATE'
      );
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
    throw new Error(`Failed to parse certificate: ${error.message}`);
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
      keySize: 256, // Default, should be determined from curve
      curve: pubKey.curveName,
    };
  }

  throw new Error('Unsupported public key algorithm');
}

function parseExtensions(x509: jsrsasign.X509): any[] {
  const extensions: any[] = [];
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
```

#### 3.2.2 Certificate Upload Component

**Create:** `components/certificates/CertificateUpload.tsx`

```typescript
'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseCertificate } from '@/lib/crypto/certificate-parser';
import { ParsedCertificate } from '@/types';

interface CertificateUploadProps {
  onCertificateLoaded: (certificate: ParsedCertificate) => void;
  onError?: (error: Error) => void;
}

export function CertificateUpload({
  onCertificateLoaded,
  onError,
}: CertificateUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);

      try {
        const text = await file.text();
        const certificate = await parseCertificate(text, 'pem');
        onCertificateLoaded(certificate);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to parse certificate';
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setIsLoading(false);
      }
    },
    [onCertificateLoaded, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Certificate</CardTitle>
        <CardDescription>
          Upload your X.509 certificate in PEM, DER, or PFX format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25',
            isLoading && 'opacity-50 pointer-events-none'
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Drag and drop your certificate file here, or
            </p>
            <Button variant="outline" disabled={isLoading} asChild>
              <label>
                <FileText className="mr-2 h-4 w-4" />
                Browse Files
                <input
                  type="file"
                  className="hidden"
                  accept=".pem,.crt,.cer,.der,.pfx,.p12"
                  onChange={handleFileInput}
                  disabled={isLoading}
                />
              </label>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Supported formats: PEM, DER, PFX/P12
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Parsing certificate...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### 3.2.3 Certificate Viewer Component

**Create:** `components/certificates/CertificateViewer.tsx`

```typescript
'use client';

import { ParsedCertificate } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { checkCertificateExpiration } from '@/lib/crypto/certificate-parser';

interface CertificateViewerProps {
  certificate: ParsedCertificate;
}

export function CertificateViewer({ certificate }: CertificateViewerProps) {
  const expiration = checkCertificateExpiration(certificate);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Certificate Details</CardTitle>
            <CardDescription>{certificate.subject.CN}</CardDescription>
          </div>
          {expiration.isExpired ? (
            <Badge variant="destructive">
              <AlertCircle className="mr-1 h-3 w-3" />
              Expired
            </Badge>
          ) : expiration.daysUntilExpiration < 30 ? (
            <Badge variant="warning">
              <Clock className="mr-1 h-3 w-3" />
              Expires in {expiration.daysUntilExpiration} days
            </Badge>
          ) : (
            <Badge variant="success">
              <CheckCircle className="mr-1 h-3 w-3" />
              Valid
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="subject">
            <AccordionTrigger>Subject</AccordionTrigger>
            <AccordionContent>
              <dl className="space-y-2">
                {Object.entries(certificate.subject).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="font-medium text-sm">{key}:</dt>
                    <dd className="text-sm text-muted-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="issuer">
            <AccordionTrigger>Issuer</AccordionTrigger>
            <AccordionContent>
              <dl className="space-y-2">
                {Object.entries(certificate.issuer).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="font-medium text-sm">{key}:</dt>
                    <dd className="text-sm text-muted-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="validity">
            <AccordionTrigger>Validity Period</AccordionTrigger>
            <AccordionContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="font-medium text-sm">Not Before:</dt>
                  <dd className="text-sm text-muted-foreground">
                    {certificate.notBefore.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-sm">Not After:</dt>
                  <dd className="text-sm text-muted-foreground">
                    {certificate.notAfter.toLocaleString()}
                  </dd>
                </div>
              </dl>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="public-key">
            <AccordionTrigger>Public Key</AccordionTrigger>
            <AccordionContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="font-medium text-sm">Algorithm:</dt>
                  <dd className="text-sm text-muted-foreground">
                    {certificate.publicKey.algorithm}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-sm">Key Size:</dt>
                  <dd className="text-sm text-muted-foreground">
                    {certificate.publicKey.keySize} bits
                  </dd>
                </div>
              </dl>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="fingerprints">
            <AccordionTrigger>Fingerprints</AccordionTrigger>
            <AccordionContent>
              <dl className="space-y-2">
                <div>
                  <dt className="font-medium text-sm mb-1">SHA-1:</dt>
                  <dd className="text-xs font-mono text-muted-foreground break-all">
                    {certificate.fingerprints.sha1}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-sm mb-1">SHA-256:</dt>
                  <dd className="text-xs font-mono text-muted-foreground break-all">
                    {certificate.fingerprints.sha256}
                  </dd>
                </div>
              </dl>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
```

---

### Phase 3: Document Signing (Week 3)

#### 3.3.1 Signature Generator

**Create:** `lib/crypto/signature-generator.ts`

```typescript
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
    const documentHash = jsrsasign.KJUR.crypto.Util.hashHex(
      documentHex,
      hashAlg
    );

    // Create signature
    const sig = new jsrsasign.KJUR.crypto.Signature({
      alg: `${hashAlg}withRSA`,
    });
    sig.init(privateKeyPEM);
    sig.updateHex(documentHash);
    const signatureHex = sig.sign();

    // Create PKCS#7 signature
    const sd = new jsrsasign.KJUR.asn1.cms.SignedData({
      content: { hex: documentHex },
      certs: [certificate.raw],
      signerInfos: [
        {
          hashAlg: hashAlg,
          sAttr: { SigningTime: {} },
          signerCert: certificate.raw,
          sigAlg: `${hashAlg}withRSA`,
          signerPrvKey: privateKeyPEM,
        },
      ],
    });

    const signatureBase64 = jsrsasign.hextob64(
      sd.getContentInfo().getEncodedHex()
    );

    const result: SignatureResult = {
      signature: signatureBase64,
      format: options.format,
      algorithm: `${hashAlg}withRSA`,
      certificate,
      timestamp: options.includeTimestamp ? new Date() : undefined,
      metadata: {
        signedAt: new Date(),
        signerInfo: certificate.subject,
        algorithm: `${hashAlg}withRSA`,
        hashAlgorithm: options.algorithm,
        certificateFingerprint: certificate.fingerprints.sha256,
      },
    };

    return result;
  } catch (error) {
    throw new Error(`Failed to create signature: ${error.message}`);
  }
}

export function clearPrivateKey(privateKeyPEM: string): void {
  // Overwrite the string in memory (best effort)
  // Note: JavaScript doesn't provide true memory clearing
  privateKeyPEM = '';
  if (global.gc) {
    global.gc();
  }
}
```

---

### Phase 4: Signature Validation (Week 4)

#### 3.4.1 Signature Validator

**Create:** `lib/crypto/signature-validator.ts`

```typescript
import * as jsrsasign from 'jsrsasign';
import {
  ValidationResult,
  ValidationOptions,
  ParsedCertificate,
} from '@/types';
import { parseCertificate } from './certificate-parser';

export async function validateSignature(
  documentData: string | ArrayBuffer,
  signatureBase64: string,
  options: ValidationOptions
): Promise<ValidationResult> {
  const errors: any[] = [];
  const warnings: any[] = [];

  try {
    // Parse PKCS#7 signature
    const signatureHex = jsrsasign.b64tohex(signatureBase64);
    const cms = new jsrsasign.KJUR.asn1.cms.CMSParser();
    const cmsObj = cms.getCMSSignedData(signatureHex);

    // Extract signer certificate
    const signerCert = cmsObj.certs[0];
    const certificate = await parseCertificate(signerCert, 'pem');

    // Verify signature
    const isValid = cmsObj.isSignatureValid();

    if (!isValid) {
      errors.push({
        code: 'INVALID_SIGNATURE',
        message: 'Signature verification failed',
        severity: 'critical',
      });
    }

    // Check certificate expiration
    const now = new Date();
    if (now > certificate.notAfter) {
      if (options.allowExpiredCertificates) {
        warnings.push({
          code: 'CERT_EXPIRED',
          message: 'Certificate has expired',
          severity: 'warning',
        });
      } else {
        errors.push({
          code: 'CERT_EXPIRED',
          message: 'Certificate has expired',
          severity: 'error',
        });
      }
    }

    // Validate certificate chain
    let chainValid = true;
    if (options.trustedCAs && options.trustedCAs.length > 0) {
      // Implement chain validation logic
      chainValid = validateChain(certificate, options.trustedCAs);
      if (!chainValid) {
        errors.push({
          code: 'INVALID_CHAIN',
          message: 'Certificate chain validation failed',
          severity: 'error',
        });
      }
    }

    const result: ValidationResult = {
      valid: errors.length === 0,
      status:
        errors.length === 0
          ? warnings.length > 0
            ? 'valid-with-warnings'
            : 'valid'
          : 'invalid',
      errors,
      warnings,
      details: {
        signatureValid: isValid,
        certificateValid: now <= certificate.notAfter,
        chainValid,
        certificateChain: [certificate],
        signedAt: new Date(cmsObj.signerInfos[0].sAttrs.SigningTime),
        validatedAt: new Date(),
      },
      timestamp: new Date(),
    };

    return result;
  } catch (error) {
    return {
      valid: false,
      status: 'invalid',
      errors: [
        {
          code: 'VALIDATION_ERROR',
          message: `Validation failed: ${error.message}`,
          severity: 'critical',
        },
      ],
      warnings: [],
      details: {
        signatureValid: false,
        certificateValid: false,
        chainValid: false,
        certificateChain: [],
        validatedAt: new Date(),
      },
      timestamp: new Date(),
    };
  }
}

function validateChain(
  certificate: ParsedCertificate,
  trustedCAs: ParsedCertificate[]
): boolean {
  // Simplified chain validation
  // In production, implement full chain validation
  return trustedCAs.some((ca) => ca.subject.CN === certificate.issuer.CN);
}
```

---

## 4. Implementation Checklist

### Week 1: Foundation

- [ ] Initialize Next.js project with TypeScript
- [ ] Configure Tailwind CSS and shadcn/ui
- [ ] Setup project structure
- [ ] Create type definitions
- [ ] Implement utility functions
- [ ] Configure ESLint and Prettier

### Week 2: Certificate Management

- [ ] Implement certificate parser (jsrsasign)
- [ ] Create CertificateUpload component
- [ ] Create CertificateViewer component
- [ ] Implement certificate validation
- [ ] Add fingerprint calculation
- [ ] Create certificate details page

### Week 3: Document Signing

- [ ] Implement signature generator
- [ ] Create DocumentUpload component
- [ ] Create SignatureOptions component
- [ ] Implement private key handling
- [ ] Create SignatureResult component
- [ ] Add download functionality

### Week 4: Signature Validation

- [ ] Implement signature validator
- [ ] Create ValidationUpload component
- [ ] Create ValidationResult component
- [ ] Implement chain validation
- [ ] Add trust store management
- [ ] Create validation report export

### Week 5: UI/UX Polish

- [ ] Create dashboard/home page
- [ ] Implement navigation
- [ ] Add loading states
- [ ] Improve error handling
- [ ] Add tooltips and help text
- [ ] Implement dark mode

### Week 6: Testing & Documentation

- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Create user documentation
- [ ] Create developer documentation
- [ ] Performance optimization
- [ ] Security audit

---

## 5. Package.json Dependencies

```json
{
  "name": "nextjs-x509",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "jsrsasign": "^10.9.0",
    "asn1js": "^3.0.5",
    "lucide-react": "^0.400.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/jsrsasign": "^10.5.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "vitest": "^1.6.0",
    "@testing-library/react": "^15.0.0",
    "@testing-library/jest-dom": "^6.4.0",
    "prettier": "^3.2.0"
  }
}
```

---

## 6. Next Steps

1. **Start with Phase 1**: Setup project foundation
2. **Follow the checklist**: Complete each week's tasks
3. **Test continuously**: Write tests as you implement features
4. **Document as you go**: Keep documentation up to date
5. **Review security**: Regular security audits
6. **Optimize performance**: Profile and optimize

---

**Document Control:**

- **Author:** Development Team
- **Status:** Ready for Implementation
- **Start Date:** TBD
- **Estimated Completion:** 6 weeks
