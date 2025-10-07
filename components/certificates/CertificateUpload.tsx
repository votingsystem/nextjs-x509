'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseCertificate } from '@/lib/crypto/certificate-parser';
import { ParsedCertificate } from '@/types';
import { cn } from '@/lib/utils/cn';

interface CertificateUploadProps {
  onCertificateLoaded: (certificate: ParsedCertificate) => void;
  onError?: (error: Error) => void;
}

export function CertificateUpload({ onCertificateLoaded, onError }: CertificateUploadProps) {
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
        const errorMessage = err instanceof Error ? err.message : 'Failed to parse certificate';
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
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
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