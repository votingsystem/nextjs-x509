# X.509 Digital Signature Application

A modern, browser-based application for managing X.509 certificates and creating/validating digital signatures. Built with Next.js 15, TypeScript, and Tailwind CSS.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-19.1-blue)

## 🌟 Features

### Certificate Management
- 📤 **Upload & Parse Certificates** - Support for PEM, DER, CRT, CER formats
- 🔍 **Detailed Certificate Viewer** - View all certificate fields and extensions
- 🔐 **Fingerprint Calculation** - SHA-1 and SHA-256 fingerprints
- ⏰ **Expiration Tracking** - Visual indicators for certificate validity
- 📊 **Distinguished Name Parsing** - Complete DN field extraction

### Digital Signatures
- ✍️ **Document Signing** - Sign any document with X.509 certificates
- 🔑 **Private Key Support** - Secure private key handling (never transmitted)
- 🎯 **Multiple Algorithms** - SHA-256, SHA-384, SHA-512 support
- 📦 **PKCS#7 Format** - Industry-standard signature format
- 🔒 **Detached Signatures** - Separate signature files

### Signature Validation
- ✅ **Signature Verification** - Cryptographic integrity validation
- 🔗 **Certificate Chain Validation** - Trust chain verification
- 📋 **Detailed Reports** - Comprehensive validation results
- ⚠️ **Warning Detection** - Expired certificates and other issues
- 📄 **Export Reports** - JSON and text format exports

### User Experience
- 🎨 **Modern UI** - Clean, intuitive interface with shadcn/ui
- 🌓 **Dark Mode** - Full dark mode support
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ♿ **Accessible** - WCAG 2.1 AA compliant
- ⚡ **Fast Performance** - Optimized with Next.js 15

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nextjs-x509.git
cd nextjs-x509

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## 📖 Usage

### Managing Certificates

1. Navigate to the **Certificates** page
2. Drag and drop a certificate file or click to browse
3. View detailed certificate information including:
   - Subject and Issuer details
   - Validity period
   - Public key information
   - Fingerprints
   - Extensions

### Signing Documents

1. Go to the **Sign** page
2. Upload your certificate (PEM, CRT, CER format)
3. Upload your private key (PEM format)
4. Select the document to sign
5. Choose signature options:
   - Hash algorithm (SHA-256, SHA-384, SHA-512)
   - Signature format (PKCS#7, Detached)
   - Optional timestamp
6. Click **Sign Document**
7. Download the signature file

### Validating Signatures

1. Navigate to the **Validate** page
2. Upload the original document
3. Upload the signature file
4. (Optional) Upload trusted CA certificates
5. Click **Validate**
6. Review the validation results:
   - Signature validity
   - Certificate chain status
   - Expiration warnings
   - Detailed error messages

## 🛠️ Technology Stack

- **Framework**: Next.js 15.5 with App Router
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **UI Components**: shadcn/ui + Radix UI
- **Cryptography**: jsrsasign, asn1js
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier

## 📁 Project Structure

```
nextjs-x509/
├── app/                      # Next.js app directory
│   ├── certificates/         # Certificate management page
│   ├── sign/                 # Document signing page
│   ├── validate/             # Signature validation page
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── certificates/        # Certificate-related components
│   ├── signing/            # Signing-related components
│   ├── validation/         # Validation-related components
│   ├── layout/             # Layout components
│   └── ui/                 # shadcn/ui components
├── lib/                    # Utility libraries
│   ├── crypto/            # Cryptography functions
│   └── utils/             # Helper utilities
├── types/                 # TypeScript type definitions
├── tests/                 # Test files
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
└── public/               # Static assets
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🔒 Security

This application prioritizes security:

- **Client-Side Only**: All cryptographic operations happen in the browser
- **No Data Transmission**: Private keys and documents never leave your device
- **Memory Clearing**: Sensitive data is cleared from memory after use
- **No Storage**: No certificates or keys are stored on disk
- **CSP Headers**: Content Security Policy for XSS protection

## 📚 Documentation

- [User Guide](docs/user-guide.md) - Detailed usage instructions
- [API Reference](docs/api-reference.md) - Function and component documentation
- [Development Guide](docs/development.md) - Contributing and development setup
- [Architecture](docs/architecture.md) - System design and architecture

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Run linting (`npm run lint`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## 🐛 Known Issues

- PFX/P12 format support is limited
- Timestamp validation requires external TSA server
- Some certificate extensions may not display correctly

## 🗺️ Roadmap

- [ ] PFX/P12 certificate support
- [ ] Timestamp Authority (TSA) integration
- [ ] Batch signature validation
- [ ] Certificate chain builder
- [ ] CRL and OCSP validation
- [ ] PDF signature support
- [ ] Hardware token support (PKCS#11)
- [ ] Multi-language support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- [jsrsasign](https://github.com/kjur/jsrsasign) - JavaScript RSA-Sign library
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Next.js](https://nextjs.org/) - The React Framework
- [Vercel](https://vercel.com/) - Deployment platform

## 📞 Support

- 📧 Email: support@example.com
- 💬 Discord: [Join our server](https://discord.gg/example)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/nextjs-x509/issues)
- 📖 Docs: [Documentation](https://docs.example.com)

## ⭐ Star History

If you find this project useful, please consider giving it a star on GitHub!

---

Made with ❤️ using Next.js and TypeScript
