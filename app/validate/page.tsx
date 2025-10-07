'use client';

import { useState } from 'react';
import { ValidationResult, ValidationOptions, Certificate } from '@/types';
import { ValidationUpload } from '@/components/validation/ValidationUpload';
import { ValidationResult as ValidationResultComponent } from '@/components/validation/ValidationResult';
import { ValidationDetails } from '@/components/validation/ValidationDetails';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { validateSignature } from '@/lib/crypto/signature-validator';

export default function ValidatePage() {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [signerCertificate, setSignerCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [options, setOptions] = useState<ValidationOptions>({
    checkRevocation: false,
    validateTimestamp: false,
    allowExpiredCertificates: false,
  });

  const handleValidate = async (data: {
    document: File;
    signature: string;
    trustedCAs?: Certificate[];
  }) => {
    try {
      setIsValidating(true);
      setError(null);
      setResult(null);

      // Read document as Uint8Array
      const documentBuffer = await data.document.arrayBuffer();
      const documentData = new Uint8Array(documentBuffer);

      // Validate signature
      const validationResult = await validateSignature(documentData, data.signature, {
        ...options,
        trustedCAs: data.trustedCAs,
      });

      setResult(validationResult);

      // Extract signer certificate if available
      if (validationResult.details.certificateChain.length > 0) {
        setSignerCertificate(validationResult.details.certificateChain[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setSignerCertificate(null);
    setError(null);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-8 w-8" />
          Validate Signature
        </h1>
        <p className="text-muted-foreground mt-2">
          Verify the authenticity and integrity of digitally signed documents
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!result ? (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            {isValidating ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-lg font-medium">Validating signature...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This may take a few moments
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ValidationUpload onFilesLoaded={handleValidate} onError={setError} />
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Validation Options</CardTitle>
                <CardDescription>Configure validation settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="allow-expired"
                    checked={options.allowExpiredCertificates}
                    onCheckedChange={(checked) =>
                      setOptions((prev) => ({
                        ...prev,
                        allowExpiredCertificates: checked === true,
                      }))
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="allow-expired"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Allow expired certificates
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Treat expired certificates as warnings instead of errors
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="validate-timestamp"
                    checked={options.validateTimestamp}
                    onCheckedChange={(checked) =>
                      setOptions((prev) => ({
                        ...prev,
                        validateTimestamp: checked === true,
                      }))
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="validate-timestamp"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Validate timestamp
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Verify the signature timestamp if present
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="check-revocation"
                    checked={options.checkRevocation}
                    onCheckedChange={(checked) =>
                      setOptions((prev) => ({
                        ...prev,
                        checkRevocation: checked === true,
                      }))
                    }
                    disabled
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="check-revocation"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Check revocation (Coming soon)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Check certificate revocation status via OCSP/CRL
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Tabs defaultValue="result" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="result">Validation Result</TabsTrigger>
              <TabsTrigger value="details">Detailed Information</TabsTrigger>
            </TabsList>
            <TabsContent value="result" className="mt-6">
              <ValidationResultComponent result={result} />
            </TabsContent>
            <TabsContent value="details" className="mt-6">
              <ValidationDetails
                details={result.details}
                signerCertificate={signerCertificate || undefined}
              />
            </TabsContent>
          </Tabs>

          <Button variant="outline" onClick={handleReset} className="w-full">
            Validate Another Signature
          </Button>
        </div>
      )}
    </div>
  );
}