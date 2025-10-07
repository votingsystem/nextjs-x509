'use client';

import { SignatureResult as SignatureResultType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, Copy } from 'lucide-react';
import { useState } from 'react';
import { downloadSignature } from '@/lib/crypto/signature-generator';
import { formatFingerprint } from '@/lib/crypto/certificate-parser';

interface SignatureResultProps {
  result: SignatureResultType;
  documentName: string;
}

export function SignatureResult({ result, documentName }: SignatureResultProps) {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const filename = `${documentName}.sig`;
    downloadSignature(result.signature, filename);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.signature);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Signature Created</CardTitle>
            <CardDescription>
              Document signed successfully
            </CardDescription>
          </div>
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Success
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Signature Details</h4>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Algorithm:</dt>
              <dd className="font-medium">{result.algorithm}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Hash Algorithm:</dt>
              <dd className="font-medium">{result.metadata.hashAlgorithm}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Format:</dt>
              <dd className="font-medium">
                {result.format === 'pkcs7' && 'PKCS#7/CMS'}
                {result.format === 'detached' && 'Detached'}
                {result.format === 'pdf' && 'PDF Embedded'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Signed At:</dt>
              <dd className="font-medium">{result.metadata.signedAt.toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Signer Information</h4>
          <dl className="space-y-2 text-sm">
            {Object.entries(result.metadata.signerInfo).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <dt className="text-muted-foreground">{key}:</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Certificate Fingerprint</h4>
          <p className="text-xs font-mono text-muted-foreground break-all">
            {formatFingerprint(result.metadata.certificateFingerprint)}
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Signature Value</h4>
          <div className="relative">
            <pre className="text-xs font-mono bg-muted p-3 rounded-lg overflow-x-auto max-h-32">
              {result.signature.substring(0, 200)}
              {result.signature.length > 200 && '...'}
            </pre>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleDownload} className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download Signature
          </Button>
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy to Clipboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}