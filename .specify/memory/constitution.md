# nextjs-x509 Constitution

## Core Principles

### I. Clean & Modular Code

- **Single Responsibility**: Each component, function, and module must have one clear purpose
- **DRY (Don't Repeat Yourself)**: Extract reusable logic into shared utilities, hooks, or components
- **Separation of Concerns**: Business logic separate from UI, data fetching separate from presentation
- **Small Functions**: Functions should be concise and focused (ideally < 20 lines)
- **Clear Naming**: Use descriptive, self-documenting names for variables, functions, and components

### II. Next.js Best Practices

- **Server Components by Default**: Use React Server Components unless client interactivity is needed
- **Client Components Only When Necessary**: Mark with `'use client'` only for interactive features
- **App Router Structure**: Follow Next.js 13+ conventions (app directory, layouts, loading states)
- **File-based Routing**: Leverage Next.js routing conventions (page.tsx, layout.tsx, loading.tsx, error.tsx)
- **Metadata API**: Use Next.js Metadata API for SEO optimization
- **Image Optimization**: Always use `next/image` for images
- **Font Optimization**: Use `next/font` for web fonts

### III. TypeScript Standards

- **Strict Mode**: TypeScript strict mode must be enabled
- **Type Safety**: No `any` types unless absolutely necessary and documented
- **Interface Over Type**: Prefer interfaces for object shapes, types for unions/intersections
- **Explicit Return Types**: Functions should have explicit return type annotations
- **Type Imports**: Use `import type` for type-only imports

### IV. Component Architecture

- **Component Hierarchy**:
  - `app/` - Pages and layouts
  - `components/` - Reusable UI components
  - `lib/` - Utilities, helpers, and business logic
  - `types/` - Shared TypeScript types and interfaces
- **Component Structure**:
  ```tsx
  // 1. Imports (grouped: React, Next.js, external, internal)
  // 2. Types/Interfaces
  // 3. Component definition
  // 4. Helper functions (if small) or extract to lib/
  ```
- **Props Validation**: All component props must be typed
- **Default Exports**: Use default exports for pages/layouts, named exports for components

### V. State Management

- **Server State First**: Leverage React Server Components for data fetching
- **Client State Minimal**: Use React hooks (useState, useReducer) for local state
- **URL as State**: Use searchParams for shareable/bookmarkable state
- **Context Sparingly**: Only for truly global client state (theme, auth)

### VI. Data Fetching

- **Server-Side by Default**: Fetch data in Server Components when possible
- **Async/Await**: Use async/await syntax for data fetching
- **Error Handling**: Always handle errors with try/catch or error boundaries
- **Loading States**: Provide loading.tsx for route segments
- **Caching Strategy**: Understand and use Next.js caching (force-cache, no-store, revalidate)

### VII. Styling Standards

- **Tailwind CSS**: Primary styling solution
- **Utility-First**: Use Tailwind utilities, avoid custom CSS when possible
- **CSS Variables**: Use CSS custom properties for theme values
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Dark Mode**: Support dark mode via `prefers-color-scheme` or class strategy
- **Component Variants**: Use `clsx` or `cn` utility for conditional classes

### VIII. Code Organization

- **Feature-Based Structure**: Group related files by feature when appropriate
- **Barrel Exports**: Use index.ts for clean imports from directories
- **Absolute Imports**: Use `@/` path alias for imports
- **Co-location**: Keep related files close (component + test + styles)

### IX. Performance Optimization

- **Code Splitting**: Leverage Next.js automatic code splitting
- **Dynamic Imports**: Use `next/dynamic` for heavy components
- **Image Optimization**: Always specify width/height for images
- **Bundle Analysis**: Regular bundle size monitoring
- **Lazy Loading**: Defer non-critical resources

### X. Testing & Quality

- **Type Checking**: Run `tsc --noEmit` before commits
- **Linting**: ESLint must pass without warnings
- **Component Testing**: Test user interactions and edge cases
- **Accessibility**: Follow WCAG guidelines, use semantic HTML
- **Error Boundaries**: Implement error.tsx for graceful error handling

## Development Workflow

### File Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase (e.g., `User.types.ts`)
- **Constants**: UPPER_SNAKE_CASE in files (e.g., `API_ENDPOINTS`)

### Code Review Checklist

- [ ] TypeScript strict mode compliance
- [ ] No console.logs in production code
- [ ] Proper error handling implemented
- [ ] Loading and error states provided
- [ ] Responsive design verified
- [ ] Accessibility considerations addressed
- [ ] Performance implications considered
- [ ] Code is self-documenting or has necessary comments

### Git Commit Standards

- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`
- Keep commits atomic and focused
- Write clear, descriptive commit messages

## Security & Best Practices

### Environment Variables

- Use `.env.local` for local secrets
- Prefix client-side vars with `NEXT_PUBLIC_`
- Never commit secrets to version control
- Validate environment variables at startup

### API Routes & Server Actions

- Validate all inputs
- Implement rate limiting for public endpoints
- Use proper HTTP status codes
- Handle errors gracefully
- Sanitize user inputs

### Authentication & Authorization

- Use established libraries (NextAuth.js, Clerk, etc.)
- Implement proper session management
- Protect API routes and server actions
- Validate permissions on server-side

## X.509 Specific Guidelines

### Certificate Handling

- **Server-Side Processing**: All certificate parsing and validation on server
- **Type Safety**: Strong typing for certificate data structures
- **Error Handling**: Comprehensive error messages for certificate issues
- **Security**: Never expose private keys or sensitive certificate data to client
- **Validation**: Implement proper certificate chain validation

### Certificate Display

- **Readable Format**: Present certificate information in user-friendly format
- **Technical Details**: Provide expandable sections for technical data
- **Visual Indicators**: Use clear visual cues for validity, expiration, trust status
- **Export Options**: Allow certificate export in standard formats (PEM, DER)

## Governance

### Constitution Authority

- This constitution supersedes all other coding practices
- All code reviews must verify compliance with these principles
- Exceptions require documentation and team approval

### Amendment Process

- Amendments require team consensus
- Document rationale for changes
- Update version and date below

### Continuous Improvement

- Regular retrospectives on code quality
- Update constitution based on lessons learned
- Share knowledge and best practices within team

**Version**: 1.0.0 | **Ratified**: 2025-10-07 | **Last Amended**: 2025-10-07
