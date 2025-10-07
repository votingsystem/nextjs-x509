# Development Guide

Guide for developers who want to contribute to or extend the X.509 Digital Signature Application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Project Architecture](#project-architecture)
4. [Code Style](#code-style)
5. [Testing](#testing)
6. [Building](#building)
7. [Contributing](#contributing)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/nextjs-x509.git
cd nextjs-x509

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Recommended VS Code Extensions

- **ESLint**: For code linting
- **Prettier**: For code formatting
- **TypeScript**: Enhanced TypeScript support
- **Tailwind CSS IntelliSense**: Tailwind class autocomplete
- **Error Lens**: Inline error display

---

## Development Environment

### Environment Variables

Create a `.env.local` file for local development:

```env
# Optional: Timestamp Authority URL
NEXT_PUBLIC_TSA_URL=https://timestamp.example.com

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Development Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Run TypeScript type checking
npm run type-check

# Format code with Prettier
npm run format

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

---

## Project Architecture

### Directory Structure

```
nextjs-x509/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── error.tsx                # Error boundary
│   ├── certificates/            # Certificate management
│   │   └── page.tsx
│   ├── sign/                    # Document signing
│   │   └── page.tsx
│   └── validate/                # Signature validation
│       └── page.tsx
│
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── certificates/            # Certificate components
│   │   ├── CertificateUpload.tsx
│   │   ├── CertificateViewer.tsx
│   │   └── CertificateCard.tsx
│   ├── signing/                 # Signing components
│   │   ├── DocumentUpload.tsx
│   │   ├── SignatureOptions.tsx
│   │   └── SignatureResult.tsx
│   ├── validation/              # Validation components
│   │   ├── ValidationUpload.tsx
│   │   ├── ValidationResult.tsx
│   │   └── ValidationDetails.tsx
│   └── layout/                  # Layout components
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── ThemeToggle.tsx
│
├── lib/                         # Utility libraries
│   ├── crypto/                  # Cryptography functions
│   │   ├── certificate-parser.ts
│   │   ├── signature-generator.ts
│   │   ├── signature-validator.ts
│   │   └── key-management.ts
│   └── utils/                   # Helper utilities
│       ├── cn.ts                # Class name merger
│       ├── encoding.ts          # Encoding conversions
│       └── date.ts              # Date utilities
│
├── types/                       # TypeScript definitions
│   └── index.ts                 # All type definitions
│
├── tests/                       # Test files
│   ├── setup.ts                 # Test setup
│   ├── unit/                    # Unit tests
│   │   ├── certificate-parser.test.ts
│   │   ├── signature-generator.test.ts
│   │   ├── signature-validator.test.ts
│   │   └── utils.test.ts
│   └── integration/             # Integration tests
│       ├── signing.test.ts
│       ├── validation.test.ts
│       └── certificates.test.ts
│
├── public/                      # Static assets
│   └── ...
│
├── docs/                        # Documentation
│   ├── user-guide.md
│   ├── api-reference.md
│   └── development.md
│
└── config files                 # Configuration
    ├── next.config.ts
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── vitest.config.ts
    ├── .eslintrc.json
    └── .prettierrc
```

### Architecture Patterns

#### Component Structure

Components follow this pattern:

```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { MyProps } from '@/types';

// 2. Type definitions
interface ComponentProps {
  // Props interface
}

// 3. Component
export function MyComponent({ prop1, prop2 }: ComponentProps) {
  // 4. State
  const [state, setState] = useState();

  // 5. Effects
  useEffect(() => {
    // Side effects
  }, []);

  // 6. Handlers
  const handleClick = () => {
    // Event handler
  };

  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

#### Crypto Module Pattern

Crypto functions are organized by responsibility:

- **certificate-parser.ts**: Certificate parsing and analysis
- **signature-generator.ts**: Signature creation
- **signature-validator.ts**: Signature verification
- **key-management.ts**: Private key handling

Each module exports pure functions that:

- Take clear inputs
- Return predictable outputs
- Handle errors explicitly
- Don't maintain state

---

## Code Style

### TypeScript Guidelines

1. **Use strict mode**: All code uses TypeScript strict mode
2. **Explicit types**: Avoid `any`, use proper types
3. **Interfaces over types**: Prefer interfaces for object shapes
4. **Const assertions**: Use `as const` for literal types

```typescript
// Good
interface User {
  id: string;
  name: string;
}

const user: User = {
  id: '123',
  name: 'John',
};

// Avoid
const user: any = {
  id: '123',
  name: 'John',
};
```

### React Guidelines

1. **Functional components**: Use function components, not classes
2. **Hooks**: Use React hooks for state and effects
3. **Props destructuring**: Destructure props in function signature
4. **Event handlers**: Prefix with `handle` (e.g., `handleClick`)

```typescript
// Good
export function MyComponent({ title, onSave }: Props) {
  const [value, setValue] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return <input value={value} onChange={handleChange} />;
}
```

### Naming Conventions

- **Components**: PascalCase (`MyComponent`)
- **Functions**: camelCase (`parseData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_SIZE`)
- **Types/Interfaces**: PascalCase (`UserData`)
- **Files**: kebab-case (`my-component.tsx`)

### Import Order

```typescript
// 1. React imports
import { useState, useEffect } from 'react';

// 2. Third-party imports
import { Button } from '@/components/ui/button';

// 3. Local imports
import { parseData } from '@/lib/utils';
import type { MyType } from '@/types';

// 4. Styles (if any)
import styles from './styles.module.css';
```

### ESLint Configuration

The project uses ESLint with Next.js recommended rules:

```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Prettier Configuration

Code is automatically formatted with Prettier:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## Testing

### Test Structure

Tests are organized by type:

- **Unit tests**: Test individual functions
- **Integration tests**: Test feature workflows
- **Component tests**: Test React components

### Writing Tests

#### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/utils';

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('');
    expect(myFunction(null)).toThrow();
  });
});
```

#### Component Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should handle clicks', () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test certificate-parser

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage Goals

- **Overall**: 80%+ coverage
- **Critical paths**: 100% coverage
- **Crypto functions**: 100% coverage
- **UI components**: 70%+ coverage

---

## Building

### Development Build

```bash
npm run dev
```

Features:

- Hot module replacement
- Fast refresh
- Source maps
- Development warnings

### Production Build

```bash
npm run build
npm start
```

Optimizations:

- Code minification
- Tree shaking
- Image optimization
- Static generation
- Bundle splitting

### Build Analysis

Analyze bundle size:

```bash
npm run build
# Check .next/analyze/ for bundle report
```

---

## Contributing

### Workflow

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Commit** with clear messages
6. **Push** to your fork
7. **Create** a pull request

### Branch Naming

- `feature/description`: New features
- `fix/description`: Bug fixes
- `docs/description`: Documentation
- `refactor/description`: Code refactoring
- `test/description`: Test additions

### Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

Examples:

```
feat(signing): add SHA-512 support
fix(parser): handle malformed certificates
docs(api): update signature generator docs
```

### Pull Request Process

1. **Update** documentation
2. **Add** tests for new features
3. **Ensure** all tests pass
4. **Run** linting and type checking
5. **Update** CHANGELOG.md
6. **Request** review

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log statements
- [ ] TypeScript types are correct
- [ ] Performance is acceptable
- [ ] Security is considered

---

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

#### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors

```bash
# Restart TypeScript server in VS Code
# Command Palette > TypeScript: Restart TS Server

# Or rebuild
npm run type-check
```

#### Build Failures

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Getting Help

- **Documentation**: Check docs/ directory
- **Issues**: Search GitHub issues
- **Discussions**: GitHub Discussions
- **Discord**: Join our Discord server

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [jsrsasign](https://kjur.github.io/jsrsasign/)

---

## License

This project is licensed under the MIT License - see LICENSE file for details.

---

Last Updated: 2025-10-07
Version: 1.0.0
