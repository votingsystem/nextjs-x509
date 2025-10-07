'use client';

import { ValidationResult as ValidationResultType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, XCircle, AlertTriangle, Download, FileText } from 'lucide-react';
import { exportValidationResult, exportValidationResultAsText } from '@/lib/crypto/signature-validator';

interface ValidationResultProps {
  result: ValidationResultType;
}

export function ValidationResult({ result }: ValidationResultProps) {
  const getStatusIcon = () => {
    switch (result.status) {
      case 'valid':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'valid-with-warnings':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'invalid':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (result.status) {
      case 'valid':
        return <Badge className="bg-green-500">Valid</Badge>;
      case 'valid-with-warnings':
        return <Badge className="bg-yellow-500">Valid with Warnings</Badge>;
      case 'invalid':
        return <Badge variant="destructive">Invalid</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleDownloadJSON = () => {
    const json = exportValidationResult(result);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadText = () => {
    const text = exportValidationResultAsText(result);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <CardTitle>Validation Result</CardTitle>
                <CardDescription>
                  Validated at {result.timestamp.toLocaleString()}
                </CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Signature Valid</p>
              <p className="text-lg font-semibold">
                {result.details.signatureValid ? '✓ Yes' : '✗ No'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Certificate Valid</p>
              <p className="text-lg font-semibold">
                {result.details.certificateValid ? '✓ Yes' : '✗ No'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Chain Valid</p>
              <p className="text-lg font-semibold">
                {result.details.chainValid ? '✓ Yes' : '✗ No'}
              </p>
            </div>
            {result.details.timestampValid !== undefined && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Timestamp Valid</p>
                <p className="text-lg font-semibold">
                  {result.details.timestampValid ? '✓ Yes' : '✗ No'}
                </p>
              </div>
            )}
          </div>

          {result.details.signedAt && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Signed At</p>
              <p className="text-lg font-semibold">
                {result.details.signedAt.toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {result.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <XCircle className="h-5 w-5" />
              Errors ({result.errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.errors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertDescription>
                    <div>
                      <strong>[{error.code}]</strong>
                      <p className="mt-1">{error.message}</p>
                      <p className="text-xs mt-1 opacity-75">
                        Severity: {error.severity}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {result.warnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-500">
              <AlertTriangle className="h-5 w-5" />
              Warnings ({result.warnings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.warnings.map((warning, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div>
                      <strong>[{warning.code}]</strong>
                      <p className="mt-1">{warning.message}</p>
                      <p className="text-xs mt-1 opacity-75">
                        Severity: {warning.severity}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {result.details.certificateChain.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Certificate Chain</CardTitle>
            <CardDescription>
              Certificates in the validation chain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {result.details.certificateChain.map((cert, index) => (
                <AccordionItem key={index} value={`cert-${index}`}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{cert.subject.CN || 'Unknown'}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Subject:</strong>
                        <p className="text-muted-foreground">
                          {Object.entries(cert.subject)
                            .map(([key, value]) => `${key}=${value}`)
                            .join(', ')}
                        </p>
                      </div>
                      <div>
                        <strong>Issuer:</strong>
                        <p className="text-muted-foreground">
                          {Object.entries(cert.issuer)
                            .map(([key, value]) => `${key}=${value}`)
                            .join(', ')}
                        </p>
                      </div>
                      <div>
                        <strong>Valid From:</strong>
                        <p className="text-muted-foreground">
                          {cert.notBefore.toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <strong>Valid Until:</strong>
                        <p className="text-muted-foreground">
                          {cert.notAfter.toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <strong>Serial Number:</strong>
                        <p className="text-muted-foreground font-mono text-xs">
                          {cert.serialNumber}
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Button onClick={handleDownloadJSON} variant="outline" className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Download JSON Report
        </Button>
        <Button onClick={handleDownloadText} variant="outline" className="flex-1">
          <FileText className="mr-2 h-4 w-4" />
          Download Text Report
        </Button>
      </div>
    </div>
  );
}