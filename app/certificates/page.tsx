'use client';

import { useState } from 'react';
import { CertificateUpload } from '@/components/certificates/CertificateUpload';
import { CertificateViewer } from '@/components/certificates/CertificateViewer';
import { ParsedCertificate } from '@/types';

export default function CertificatesPage() {
  const [certificate, setCertificate] = useState<ParsedCertificate | null>(null);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Certificate Management</h1>
        <p className="text-muted-foreground mt-2">
          Upload and view X.509 certificates
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <CertificateUpload
          onCertificateLoaded={setCertificate}
          onError={(error) => console.error('Certificate error:', error)}
        />

        {certificate && (
          <CertificateViewer certificate={certificate} />
        )}
      </div>
    </div>
  );
}