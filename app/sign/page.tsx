'use client';

import { useState } from 'react';
import { Certificate, PrivateKeyData, SignatureOptions as SignatureOptionsType, SignatureResult } from '@/types';
import { CertificateUpload } from '@/components/certificates/CertificateUpload';
import { DocumentUpload } from '@/components/signing/DocumentUpload';
import { SignatureOptions } from '@/components/signing/SignatureOptions';
import { SignatureResult as SignatureResultComponent } from '@/components/signing/SignatureResult';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileKey, AlertCircle, Loader2 } from 'lucide-react';
import { signDocument } from '@/lib/crypto/signature-generator';
import { importPrivateKey } from '@/lib/crypto/key-management';

export default function SignPage() {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [privateKey, setPrivateKey] = useState<PrivateKeyData | null>(null);
  const [document, setDocument] = useState<{ file: File; hash: string } | null>(null);
  const [options, setOptions] = useState<SignatureOptionsType>({
    algorithm: 'SHA256withRSA',
    format: 'pkcs7',
    includeTimestamp: false,
    includeCertificateChain: true,
  });
  const [result, setResult] = useState<SignatureResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [keyPassword, setKeyPassword] = useState('');

  const handleKeyUpload = async (file: File) => {
    try {
      setError(null);
      const keyData = await file.text();
      
      // Try to import the key (may require password)
      try {
        const imported = await importPrivateKey(keyData, keyPassword || undefined);
        setPrivateKey(imported);
      } catch (err) {
        // If it fails and no password was provided, it might be encrypted
        if (!keyPassword) {
          setError('This private key appears to be encrypted. Please provide the password.');
        } else {
          throw err;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load private key');
    }
  };

  const handleSign = async () => {
    if (!certificate || !privateKey || !document) {
      setError('Please provide certificate, private key, and document');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const documentData = await document.file.arrayBuffer();
      const signatureResult = await signDocument(
        new Uint8Array(documentData),
        certificate,
        privateKey,
        options
      );

      setResult(signatureResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign document');
    } finally {
      setIsLoading(false);
    }
  };

  const canSign = certificate && privateKey && document && !isLoading;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sign Document</h1>
        <p className="text-muted-foreground mt-2">
          Upload your certificate, private key, and document to create a digital signature
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!result ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <CertificateUpload
              onCertificateLoaded={setCertificate}
              onError={setError}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileKey className="h-5 w-5" />
                  Private Key
                </CardTitle>
                <CardDescription>
                  Upload the private key corresponding to your certificate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key-file">Private Key File</Label>
                  <Input
                    id="key-file"
                    type="file"
                    accept=".pem,.key,.p12,.pfx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleKeyUpload(file);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PEM, PKCS#8, PKCS#12
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="key-password">Password (if encrypted)</Label>
                  <Input
                    id="key-password"
                    type="password"
                    value={keyPassword}
                    onChange={(e) => setKeyPassword(e.target.value)}
                    placeholder="Enter password if key is encrypted"
                  />
                </div>

                {privateKey && (
                  <Alert>
                    <AlertDescription>
                      Private key loaded successfully ({privateKey.algorithm})
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <DocumentUpload
              onDocumentLoaded={setDocument}
              onError={setError}
            />
          </div>

          <div className="space-y-6">
            <SignatureOptions
              options={options}
              onChange={setOptions}
            />

            <Button
              onClick={handleSign}
              disabled={!canSign}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing...
                </>
              ) : (
                'Sign Document'
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <SignatureResultComponent
            result={result}
            documentName={document?.file.name || 'document'}
          />
          <Button
            variant="outline"
            onClick={() => {
              setResult(null);
              setDocument(null);
              setError(null);
            }}
            className="w-full"
          >
            Sign Another Document
          </Button>
        </div>
      )}
    </div>
  );
}