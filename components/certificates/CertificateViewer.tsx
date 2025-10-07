'use client';

import { ParsedCertificate } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { checkCertificateExpiration, formatFingerprint } from '@/lib/crypto/certificate-parser';

interface CertificateViewerProps {
  certificate: ParsedCertificate;
}

export function CertificateViewer({ certificate }: CertificateViewerProps) {
  const expiration = checkCertificateExpiration(certificate);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Certificate Details</CardTitle>
            <CardDescription>{certificate.subject.CN}</CardDescription>
          </div>
          {expiration.isExpired ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Expired
            </Badge>
          ) : expiration.daysUntilExpiration < 30 ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Expires in {expiration.daysUntilExpiration} days
            </Badge>
          ) : (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Valid
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="subject">
            <AccordionTrigger>Subject</AccordionTrigger>
            <AccordionContent>
              <dl className="space-y-2">
                {Object.entries(certificate.subject).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="font-medium text-sm">{key}:</dt>
                    <dd className="text-sm text-muted-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="issuer">
            <AccordionTrigger>Issuer</AccordionTrigger>
            <AccordionContent>
              <dl className="space-y-2">
                {Object.entries(certificate.issuer).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="font-medium text-sm">{key}:</dt>
                    <dd className="text-sm text-muted-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="validity">
            <AccordionTrigger>Validity Period</AccordionTrigger>
            <AccordionContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="font-medium text-sm">Not Before:</dt>
                  <dd className="text-sm text-muted-foreground">
                    {certificate.notBefore.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-sm">Not After:</dt>
                  <dd className="text-sm text-muted-foreground">
                    {certificate.notAfter.toLocaleString()}
                  </dd>
                </div>
              </dl>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="public-key">
            <AccordionTrigger>Public Key</AccordionTrigger>
            <AccordionContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="font-medium text-sm">Algorithm:</dt>
                  <dd className="text-sm text-muted-foreground">
                    {certificate.publicKey.algorithm}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-sm">Key Size:</dt>
                  <dd className="text-sm text-muted-foreground">
                    {certificate.publicKey.keySize} bits
                  </dd>
                </div>
              </dl>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="fingerprints">
            <AccordionTrigger>Fingerprints</AccordionTrigger>
            <AccordionContent>
              <dl className="space-y-2">
                <div>
                  <dt className="font-medium text-sm mb-1">SHA-1:</dt>
                  <dd className="text-xs font-mono text-muted-foreground break-all">
                    {formatFingerprint(certificate.fingerprints.sha1)}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-sm mb-1">SHA-256:</dt>
                  <dd className="text-xs font-mono text-muted-foreground break-all">
                    {formatFingerprint(certificate.fingerprints.sha256)}
                  </dd>
                </div>
              </dl>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}