'use client';

import Link from 'next/link';
import { Github, FileSignature } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileSignature className="h-5 w-5" />
              <span className="font-semibold">X.509 Signature</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A secure, client-side tool for digital signatures using X.509 certificates.
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold mb-3">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/sign" className="hover:text-foreground transition-colors">
                  Sign Documents
                </Link>
              </li>
              <li>
                <Link href="/validate" className="hover:text-foreground transition-colors">
                  Validate Signatures
                </Link>
              </li>
              <li>
                <Link href="/certificates" className="hover:text-foreground transition-colors">
                  Manage Certificates
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://datatracker.ietf.org/doc/html/rfc5280"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  RFC 5280 (X.509)
                </a>
              </li>
              <li>
                <a
                  href="https://datatracker.ietf.org/doc/html/rfc5652"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  RFC 5652 (CMS)
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/kjur/jsrsasign"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  jsrsasign Library
                </a>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold mb-3">About</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="hover:text-foreground transition-colors">
                  Version 1.0.0
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors">
                  Development Tool
                </span>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} X.509 Digital Signature Application. Built with Next.js and TypeScript.
          </p>
          <p className="mt-2">
            All cryptographic operations are performed client-side. No data is sent to any server.
          </p>
        </div>
      </div>
    </footer>
  );
}