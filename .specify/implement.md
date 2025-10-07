# X.509 Digital Signature Application - Complete Implementation Guide

**Version:** 1.0.0  
**Date:** 2025-10-07  
**Status:** Ready for Implementation

---

## 📖 Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Week 1: Foundation](#week-1-foundation)
5. [Week 2: Certificate Management](#week-2-certificate-management)
6. [Week 3: Document Signing](#week-3-document-signing)
7. [Week 4: Signature Validation](#week-4-signature-validation)
8. [Week 5: UI/UX Polish](#week-5-uiux-polish)
9. [Week 6: Testing & Documentation](#week-6-testing--documentation)
10. [Deployment](#deployment)
11. [Maintenance](#maintenance)

---

## Project Overview

### What We're Building

A Next.js web application for digitally signing documents and validating signatures using X.509 certificates. This is a development and testing tool with 100% client-side cryptography.

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 3.4+
- **Components**: shadcn/ui
- **Icons**: lucide-react
- **Crypto**: jsrsasign, asn1js

### Key Features

1. **Certificate Management**: Upload, parse, and view X.509 certificates
2. **Document Signing**: Create digital signatures with PKCS#7/CMS
3. **Signature Validation**: Verify signatures and certificate chains
4. **Security**: 100% client-side operations, no server-side key storage

---

## Prerequisites

### Required Software

```bash
# Check versions
node --version    # Should be 18+
npm --version     # Should be 9+
git --version     # Any recent version
```

### Required Knowledge

- Basic understanding of Next.js and React
- TypeScript fundamentals
- Command line basics
- Git basics

### Recommended Tools

- VS Code with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense

---

## Initial Setup

### Step 1: Create Project

```bash
# Create Next.js project
npx create-next-app@latest nextjs-x509 \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

# Navigate to project
cd nextjs-x509
```

### Step 2: Install Dependencies

```bash
# Cryptography libraries
npm install jsrsasign asn1js

# UI utilities
npm install lucide-react class-variance-authority clsx tailwind-merge

# Development dependencies
npm install -D @types/jsrsasign vitest @testing-library/react @testing-library/jest-dom
```

### Step 3: Initialize shadcn/ui

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# When prompted, choose:
# - Style: Default
# - Base color: Zinc
# - CSS variables: Yes
```

### Step 4: Install shadcn/ui Components

```bash
# Core components
npx shadcn-ui@latest add button card input label select

# Additional components
npx shadcn-ui@latest add tabs alert badge dialog dropdown-menu

# Final components
npx shadcn-ui@latest add toast progress separator accordion
```

### Step 5: Create Directory Structure

```bash
# Create all directories
mkdir -p components/{ui,certificates,signing,validation,layout}
mkdir -p lib/{crypto,parsers,formatters,utils}
mkdir -p types
mkdir -p hooks
mkdir -p context
mkdir -p config
mkdir -p app/{sign,validate,certificates}
mkdir -p tests/{unit,integration}
mkdir -p docs
```

### Step 6: Verify Setup

```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
# You should see the Next.js welcome page
```

---

## Week 1: Foundation

### Day 1: Configuration Files

#### Task 1.1: Update tsconfig.json

**File**: `tsconfig.json`

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

**Verify**: Run `npx tsc --noEmit` - should have no errors

#### Task 1.2: Create .eslintrc.json

**File**: `.eslintrc.json`

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

**Verify**: Run `npm run lint` - should pass

#### Task 1.3: Create .prettierrc

**File**: `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

#### Task 1.4: Update package.json scripts

**File**: `package.json`

Add these scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  }
}
```

### Day 2: Type Definitions

#### Task 2.1: Create types/index.ts

**File**: `types/index.ts`

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

**Verify**: No TypeScript errors when importing these types

### Day 3: Utility Functions

#### Task 3.1: Create lib/utils/cn.ts

**File**: `lib/utils/cn.ts`

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### Task 3.2: Create lib/utils/encoding.ts

**File**: `lib/utils/encoding.ts`

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

export function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
}

export function arrayBufferToString(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}
```

#### Task 3.3: Create lib/utils/date.ts

**File**: `lib/utils/date.ts`

```typescript
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysUntil(date: Date): number {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function isExpired(date: Date): boolean {
  return new Date() > date;
}

export function formatDuration(days: number): string {
  if (days < 0) return 'Expired';
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  if (days < 30) return `Expires in ${days} days`;
  if (days < 365) return `Expires in ${Math.floor(days / 30)} months`;
  return `Expires in ${Math.floor(days / 365)} years`;
}
```

**Verify**: Create a test file and test these utilities

---

## Week 2: Certificate Management

### Day 6: Certificate Parser

#### Task 6.1: Create lib/crypto/certificate-parser.ts

**File**: `lib/crypto/certificate-parser.ts`

```typescript
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
```

**Verify**: Test with a sample PEM certificate

### Day 7-10: Certificate Components

Due to length constraints, I'll provide the key component structures. Full implementations are in the implementation plan.

#### CertificateUpload Component Structure

**File**: `components/certificates/CertificateUpload.tsx`

Key features:

- Drag & drop file upload
- File format validation
- Certificate parsing
- Error handling
- Loading states

#### CertificateViewer Component Structure

**File**: `components/certificates/CertificateViewer.tsx`

Key features:

- Accordion sections for certificate details
- Expiration status badge
- Fingerprint display
- Public key information
- Extension details

---

## Week 3-6: Remaining Implementation

Due to the comprehensive nature of this project (126 tasks), I'll provide a structured approach for the remaining weeks:

### Week 3: Document Signing

- Signature generator with jsrsasign
- Private key management
- Document upload and hashing
- Signature options UI
- Sign page integration

### Week 4: Signature Validation

- Signature validator
- Certificate chain validation
- Validation result display
- Trust store management
- Validate page integration

### Week 5: UI/UX Polish

- Dashboard/home page
- Navigation and layout
- Loading states and error handling
- Dark mode implementation
- Responsive design

### Week 6: Testing & Documentation

- Unit tests for all modules
- Integration tests for workflows
- User and developer documentation
- Performance optimization
- Security audit

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix linting issues
npm run type-check      # Check TypeScript
npm run format          # Format with Prettier

# Testing
npm run test            # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

---

## Next Steps

1. **Complete Week 1 tasks** following this guide
2. **Refer to** `.specify/tasks.md` for detailed task breakdown
3. **Check** `.specify/implementation-plan.md` for code examples
4. **Follow** `.specify/memory/constitution.md` for coding standards
5. **Review** `.specify/clarify.md` for any questions

---

**Status**: Foundation guide complete. Refer to other specification documents for detailed implementation of remaining features.

**Last Updated**: 2025-10-07
