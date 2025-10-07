# X.509 Digital Signature Application - User Guide

Welcome to the X.509 Digital Signature Application! This comprehensive guide will help you understand and use all features of the application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Certificate Management](#certificate-management)
3. [Signing Documents](#signing-documents)
4. [Validating Signatures](#validating-signatures)
5. [Understanding Results](#understanding-results)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)
8. [FAQ](#faq)

## Getting Started

### System Requirements

- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- Minimum 2GB RAM recommended
- Internet connection (for initial load only)

### First Steps

1. Open the application in your web browser
2. You'll see the home page with three main features:
   - **Certificates**: Manage and view X.509 certificates
   - **Sign**: Create digital signatures for documents
   - **Validate**: Verify digital signatures

### Navigation

Use the navigation menu at the top to switch between features:
- **Home**: Return to the main page
- **Certificates**: Certificate management
- **Sign**: Document signing
- **Validate**: Signature validation

## Certificate Management

### Uploading Certificates

1. Navigate to the **Certificates** page
2. You can upload certificates in two ways:
   - **Drag & Drop**: Drag a certificate file onto the upload area
   - **Click to Browse**: Click the upload area to select a file

### Supported Certificate Formats

- **PEM** (.pem, .crt, .cer) - Most common format
- **DER** (.der, .cer) - Binary format
- **Base64** - Text-encoded certificates

### Viewing Certificate Details

Once uploaded, you'll see detailed information about the certificate:

#### Subject Information
- **Common Name (CN)**: The entity the certificate identifies
- **Organization (O)**: Company or organization name
- **Organizational Unit (OU)**: Department or division
- **Locality (L)**: City or locality
- **State/Province (ST)**: State or province
- **Country (C)**: Two-letter country code
- **Email (E)**: Email address

#### Issuer Information
- Same fields as Subject, but for the Certificate Authority (CA)

#### Validity Period
- **Not Before**: Certificate valid from this date
- **Not After**: Certificate expires on this date
- **Status Badge**: 
  - 🟢 **Valid**: Certificate is currently valid
  - 🟡 **Expiring Soon**: Less than 30 days until expiration
  - 🔴 **Expired**: Certificate has expired

#### Public Key Information
- **Algorithm**: RSA or ECDSA
- **Key Size**: Bit length (e.g., 2048, 4096)
- **Modulus**: For RSA keys
- **Curve**: For ECDSA keys

#### Fingerprints
- **SHA-1**: Legacy fingerprint (40 hex characters)
- **SHA-256**: Modern fingerprint (64 hex characters)
- Formatted with colons for readability (e.g., `AB:CD:EF:...`)

#### Extensions
- **Key Usage**: How the key can be used
- **Extended Key Usage**: Specific purposes
- **Subject Alternative Names**: Additional identities
- **Basic Constraints**: CA certificate indicator
- **Authority Key Identifier**: Links to issuer
- **Subject Key Identifier**: Unique key identifier

### Certificate Actions

- **Copy Fingerprint**: Click to copy SHA-256 fingerprint
- **Export**: Download certificate details as JSON
- **Clear**: Remove certificate and start over

## Signing Documents

### Prerequisites

Before signing, you need:
1. **Certificate**: Your X.509 certificate (PEM format)
2. **Private Key**: Corresponding private key (PEM format)
3. **Document**: The file you want to sign

### Step-by-Step Signing Process

#### Step 1: Upload Certificate

1. Go to the **Sign** page
2. In the "Certificate" section, upload your certificate
3. Verify the certificate details are correct
4. Check that the certificate is valid (not expired)

#### Step 2: Upload Private Key

1. In the "Private Key" section, upload your private key
2. If the key is encrypted, enter the password
3. The application will verify the key matches the certificate
4. ⚠️ **Security Note**: Your private key never leaves your browser

#### Step 3: Upload Document

1. In the "Document" section, upload the file to sign
2. Supported file types: Any file up to 50MB
3. The application will calculate the document hash
4. Review the document information:
   - File name
   - File size
   - SHA-256 hash

#### Step 4: Configure Signature Options

Choose your signature settings:

**Hash Algorithm**
- **SHA-256** (Recommended): Most widely supported
- **SHA-384**: Higher security, larger signatures
- **SHA-512**: Maximum security, largest signatures

**Signature Format**
- **PKCS#7**: Standard format, includes certificate
- **Detached**: Separate signature file, smaller size

**Additional Options**
- **Include Timestamp**: Add trusted timestamp (requires TSA)
- **Output Format**: Base64 (text) or Binary

#### Step 5: Generate Signature

1. Review all settings
2. Click **Sign Document**
3. Wait for signature generation (usually < 1 second)
4. The signature will be displayed

#### Step 6: Download Signature

1. Review the signature details
2. Click **Download Signature** to save the file
3. Or click **Copy to Clipboard** to copy the signature
4. The signature file will be named: `[document-name].sig`

### Signature File Formats

**PKCS#7 Format**
```
-----BEGIN PKCS7-----
MIIGPQYJKoZIhvcNAQcCoIIGLjCCBioCAQExDzANBglghkgBZQMEAgEFADALBgkq
...
-----END PKCS7-----
```

**Detached Signature**
- Binary file containing only the signature
- Requires original document for verification
- Smaller file size

## Validating Signatures

### Prerequisites

To validate a signature, you need:
1. **Original Document**: The signed file (unchanged)
2. **Signature File**: The .sig or PKCS#7 file
3. **CA Certificates** (Optional): Trusted root certificates

### Step-by-Step Validation Process

#### Step 1: Upload Document

1. Go to the **Validate** page
2. Upload the original document
3. Ensure it's the exact same file that was signed
4. Any modification will cause validation to fail

#### Step 2: Upload Signature

1. Upload the signature file (.sig or .p7s)
2. The application will parse the signature
3. It will extract the signer's certificate

#### Step 3: Upload CA Certificates (Optional)

1. If you want to verify the certificate chain:
2. Upload trusted CA certificates
3. You can upload multiple CA certificates
4. This validates the signer's certificate is trusted

#### Step 4: Validate

1. Click **Validate Signature**
2. The application will perform multiple checks:
   - Signature cryptographic validity
   - Document integrity (hash match)
   - Certificate validity (not expired)
   - Certificate chain (if CAs provided)
   - Timestamp validity (if present)

### Validation Results

#### ✅ Valid Signature

All checks passed:
- ✓ Signature is cryptographically valid
- ✓ Document has not been modified
- ✓ Certificate is valid
- ✓ Certificate chain is trusted (if verified)

#### ⚠️ Valid with Warnings

Signature is valid but has warnings:
- ⚠️ Certificate is expired (but was valid when signed)
- ⚠️ Certificate chain cannot be verified
- ⚠️ Weak hash algorithm used

#### ❌ Invalid Signature

Validation failed:
- ❌ Signature does not match document
- ❌ Document has been modified
- ❌ Certificate is invalid
- ❌ Cryptographic verification failed

### Understanding Validation Details

**Signature Information**
- Algorithm used
- Signature timestamp
- Signer certificate details

**Certificate Chain**
- Signer certificate
- Intermediate certificates
- Root CA certificate
- Chain validation status

**Validation Checks**
- Signature verification: Pass/Fail
- Hash match: Pass/Fail
- Certificate validity: Pass/Fail/Warning
- Chain validation: Pass/Fail/Not Checked

## Understanding Results

### Certificate Status Indicators

| Indicator | Meaning | Action |
|-----------|---------|--------|
| 🟢 Valid | Certificate is currently valid | Safe to use |
| 🟡 Expiring Soon | Less than 30 days until expiration | Renew soon |
| 🔴 Expired | Certificate has expired | Do not use for new signatures |

### Signature Validation Status

| Status | Icon | Meaning |
|--------|------|---------|
| Valid | ✅ | Signature is completely valid |
| Valid with Warnings | ⚠️ | Valid but has non-critical issues |
| Invalid | ❌ | Signature verification failed |

### Common Warning Messages

**"Certificate expired"**
- The certificate has passed its expiration date
- Signature may still be valid if signed before expiration
- Check signature timestamp

**"Certificate chain cannot be verified"**
- No trusted CA certificates provided
- Certificate may be self-signed
- Upload CA certificates to verify chain

**"Weak hash algorithm"**
- SHA-1 or MD5 was used
- Consider re-signing with SHA-256 or higher
- Still cryptographically valid but not recommended

## Troubleshooting

### Certificate Upload Issues

**"Invalid certificate format"**
- Ensure file is in PEM, DER, or CRT format
- Check file is not corrupted
- Try converting to PEM format

**"Cannot parse certificate"**
- File may be encrypted
- File may be a certificate request (CSR) not a certificate
- Verify file contains a valid X.509 certificate

### Signing Issues

**"Private key does not match certificate"**
- Ensure you're using the correct private key
- Key and certificate must be a pair
- Check if key is encrypted and password is correct

**"Failed to generate signature"**
- Check private key is valid
- Ensure document is not corrupted
- Try with a smaller document

**"Document too large"**
- Maximum file size is 50MB
- Split large files or compress
- Use detached signature format

### Validation Issues

**"Signature verification failed"**
- Document may have been modified
- Signature file may be corrupted
- Ensure using correct document and signature pair

**"Hash mismatch"**
- Document has been modified after signing
- Using wrong document file
- Document encoding may have changed

## Best Practices

### Certificate Management

1. **Keep Certificates Secure**
   - Store in encrypted location
   - Limit access to authorized users
   - Back up certificates regularly

2. **Monitor Expiration**
   - Check expiration dates regularly
   - Renew certificates before expiration
   - Set up expiration reminders

3. **Use Strong Keys**
   - Minimum 2048-bit RSA keys
   - Prefer 4096-bit for long-term use
   - Consider ECDSA for better performance

### Signing Documents

1. **Choose Appropriate Algorithm**
   - Use SHA-256 or higher
   - Avoid SHA-1 and MD5
   - Consider SHA-512 for sensitive documents

2. **Protect Private Keys**
   - Never share private keys
   - Use encrypted keys with strong passwords
   - Clear browser cache after use

3. **Include Timestamps**
   - Proves when document was signed
   - Validates signature even after certificate expires
   - Use trusted timestamp authorities

4. **Document Integrity**
   - Sign final versions only
   - Don't modify documents after signing
   - Keep original and signed copies

### Validation

1. **Verify Complete Chain**
   - Always provide CA certificates
   - Verify chain to trusted root
   - Check for revocation (CRL/OCSP)

2. **Check All Details**
   - Review signer identity
   - Verify signature timestamp
   - Check certificate validity period

3. **Keep Records**
   - Save validation reports
   - Document validation date
   - Store with signed documents

## FAQ

### General Questions

**Q: Is my data secure?**
A: Yes! All operations happen in your browser. No data is transmitted to any server.

**Q: Do I need to install anything?**
A: No, it's a web application. Just use a modern browser.

**Q: Can I use this offline?**
A: After initial load, most features work offline. Timestamp validation requires internet.

### Certificate Questions

**Q: What certificate formats are supported?**
A: PEM (.pem, .crt, .cer), DER (.der), and Base64 encoded certificates.

**Q: Can I use self-signed certificates?**
A: Yes, but they won't have a trusted chain unless you provide the CA certificate.

**Q: How do I get a certificate?**
A: From a Certificate Authority (CA) like Let's Encrypt, DigiCert, or create self-signed for testing.

### Signing Questions

**Q: What file types can I sign?**
A: Any file type up to 50MB.

**Q: Can I sign multiple documents at once?**
A: Currently no, sign documents one at a time.

**Q: Is the signature legally binding?**
A: Depends on jurisdiction. Consult legal counsel for your specific use case.

### Validation Questions

**Q: Can I validate old signatures?**
A: Yes, if the certificate was valid when signed and you have the original document.

**Q: What if validation shows warnings?**
A: Review the warnings. Some (like expired certificates) may be acceptable if signed before expiration.

**Q: Can I validate signatures created by other tools?**
A: Yes, if they use standard PKCS#7 format.

## Support

Need help? Here's how to get support:

- 📧 **Email**: support@example.com
- 💬 **Discord**: [Join our community](https://discord.gg/example)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/nextjs-x509/issues)
- 📖 **Documentation**: [Full Documentation](https://docs.example.com)

## Additional Resources

- [API Reference](api-reference.md) - For developers
- [Development Guide](development.md) - Contributing guide
- [Security Best Practices](security.md) - Security guidelines
- [X.509 Standard](https://www.itu.int/rec/T-REC-X.509) - Official specification

---

Last Updated: 2025-10-07
Version: 1.0.0