'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, FileText, FileSignature, Shield, X } from 'lucide-react';
import { Certificate } from '@/types';
import { parseCertificate } from '@/lib/crypto/certificate-parser';

interface ValidationUploadProps {
  onFilesLoaded: (data: {
    document: File;
    signature: string;
    trustedCAs?: Certificate[];
  }) => void;
  onError: (error: string) => void;
}

export function ValidationUpload({ onFilesLoaded, onError }: ValidationUploadProps) {
  const [document, setDocument] = useState<File | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [trustedCAs, setTrustedCAs] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const documentInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const caInputRef = useRef<HTMLInputElement>(null);

  const handleDocumentUpload = (file: File) => {
    setDocument(file);
    onError('');
  };

  const handleSignatureUpload = async (file: File) => {
    try {
      setIsLoading(true);
      const text = await file.text();
      
      // Validate signature format (should be base64 or PEM)
      if (!text.includes('BEGIN') && !text.match(/^[A-Za-z0-9+/=]+$/)) {
        throw new Error('Invalid signature format. Expected base64 or PEM format.');
      }

      setSignature(text);
      onError('');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to load signature');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCAUpload = async (files: FileList) => {
    try {
      setIsLoading(true);
      const certs: Certificate[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const text = await file.text();
        const cert = await parseCertificate(text);
        certs.push(cert);
      }

      setTrustedCAs((prev) => [...prev, ...certs]);
      onError('');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to load CA certificates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCA = (index: number) => {
    setTrustedCAs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleValidate = () => {
    if (!document) {
      onError('Please upload a document');
      return;
    }

    if (!signature) {
      onError('Please upload a signature');
      return;
    }

    onFilesLoaded({
      document,
      signature,
      trustedCAs: trustedCAs.length > 0 ? trustedCAs : undefined,
    });
  };

  const canValidate = document && signature && !isLoading;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document
          </CardTitle>
          <CardDescription>Upload the original document that was signed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document-file">Document File</Label>
            <Input
              id="document-file"
              ref={documentInputRef}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleDocumentUpload(file);
              }}
            />
          </div>

          {document && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>{document.name}</strong>
                    <p className="text-xs text-muted-foreground">
                      {(document.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDocument(null);
                      if (documentInputRef.current) {
                        documentInputRef.current.value = '';
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Signature
          </CardTitle>
          <CardDescription>Upload the digital signature file</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signature-file">Signature File</Label>
            <Input
              id="signature-file"
              ref={signatureInputRef}
              type="file"
              accept=".sig,.p7s,.p7m"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleSignatureUpload(file);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: .sig, .p7s, .p7m
            </p>
          </div>

          {signature && (
            <Alert>
              <FileSignature className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Signature loaded</strong>
                    <p className="text-xs text-muted-foreground">
                      {signature.length} characters
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSignature(null);
                      if (signatureInputRef.current) {
                        signatureInputRef.current.value = '';
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Trusted CAs (Optional)
          </CardTitle>
          <CardDescription>
            Upload trusted CA certificates for chain validation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ca-files">CA Certificates</Label>
            <Input
              id="ca-files"
              ref={caInputRef}
              type="file"
              accept=".pem,.crt,.cer"
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  handleCAUpload(files);
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              You can select multiple CA certificate files
            </p>
          </div>

          {trustedCAs.length > 0 && (
            <div className="space-y-2">
              <Label>Loaded CAs ({trustedCAs.length})</Label>
              <div className="space-y-2">
                {trustedCAs.map((ca, index) => (
                  <Alert key={index}>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <strong>{ca.subject.CN || 'Unknown'}</strong>
                          <p className="text-xs text-muted-foreground">
                            Issuer: {ca.issuer.CN || 'Unknown'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCA(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={handleValidate}
        disabled={!canValidate}
        className="w-full"
        size="lg"
      >
        <Upload className="mr-2 h-4 w-4" />
        Validate Signature
      </Button>
    </div>
  );
}