'use client';

import { ValidationDetails as ValidationDetailsType, Certificate } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, FileText, Calendar, Hash } from 'lucide-react';
import { CertificateViewer } from '@/components/certificates/CertificateViewer';

interface ValidationDetailsProps {
  details: ValidationDetailsType;
  signerCertificate?: Certificate;
}

export function ValidationDetails({ details, signerCertificate }: ValidationDetailsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Validation Details</CardTitle>
          <CardDescription>
            Detailed information about the validation process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              {details.signatureValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium">Signature Verification</p>
                <p className="text-xs text-muted-foreground">
                  {details.signatureValid
                    ? 'Cryptographic signature is valid'
                    : 'Signature verification failed'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              {details.certificateValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium">Certificate Validity</p>
                <p className="text-xs text-muted-foreground">
                  {details.certificateValid
                    ? 'Certificate is currently valid'
                    : 'Certificate is not valid'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              {details.chainValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium">Chain Validation</p>
                <p className="text-xs text-muted-foreground">
                  {details.chainValid
                    ? 'Certificate chain is valid'
                    : 'Chain validation failed'}
                </p>
              </div>
            </div>

            {details.timestampValid !== undefined && (
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                {details.timestampValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="text-sm font-medium">Timestamp Validation</p>
                  <p className="text-xs text-muted-foreground">
                    {details.timestampValid
                      ? 'Timestamp is valid'
                      : 'Timestamp validation failed'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t space-y-3">
            {details.signedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Signed At</p>
                  <p className="text-sm text-muted-foreground">
                    {details.signedAt.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Validated At</p>
                <p className="text-sm text-muted-foreground">
                  {details.validatedAt.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {signerCertificate && (
        <Card>
          <CardHeader>
            <CardTitle>Signer Certificate</CardTitle>
            <CardDescription>
              Certificate used to create the signature
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CertificateViewer certificate={signerCertificate} />
          </CardContent>
        </Card>
      )}

      {details.certificateChain.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Certificate Chain</CardTitle>
            <CardDescription>
              Complete chain of trust ({details.certificateChain.length} certificates)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {details.certificateChain.map((cert, index) => (
                <AccordionItem key={index} value={`cert-${index}`}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">
                        {index === 0 ? 'Signer' : `CA Level ${index}`}
                      </span>
                      <span className="text-muted-foreground">
                        - {cert.subject.CN || 'Unknown'}
                      </span>
                      {index === 0 && (
                        <Badge variant="secondary" className="ml-2">
                          End Entity
                        </Badge>
                      )}
                      {cert.subject.CN === cert.issuer.CN && (
                        <Badge variant="secondary" className="ml-2">
                          Self-Signed
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div>
                        <p className="text-sm font-medium">Subject</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {Object.entries(cert.subject)
                            .map(([key, value]) => `${key}=${value}`)
                            .join(', ')}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Issuer</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {Object.entries(cert.issuer)
                            .map(([key, value]) => `${key}=${value}`)
                            .join(', ')}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Valid From</p>
                          <p className="text-sm text-muted-foreground">
                            {cert.notBefore.toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Valid Until</p>
                          <p className="text-sm text-muted-foreground">
                            {cert.notAfter.toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Serial Number</p>
                        <p className="text-sm text-muted-foreground font-mono break-all">
                          {cert.serialNumber}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium flex items-center gap-2">
                          <Hash className="h-3 w-3" />
                          SHA-256 Fingerprint
                        </p>
                        <p className="text-xs text-muted-foreground font-mono break-all">
                          {cert.fingerprints.sha256
                            .match(/.{1,2}/g)
                            ?.join(':')
                            .toUpperCase()}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Public Key</p>
                        <p className="text-sm text-muted-foreground">
                          {cert.publicKey.algorithm} - {cert.publicKey.keySize} bits
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
    </div>
  );
}