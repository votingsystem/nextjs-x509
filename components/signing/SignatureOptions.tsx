'use client';

import { SignatureOptions as SignatureOptionsType, HashAlgorithm, SignatureFormat } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SignatureOptionsProps {
  options: SignatureOptionsType;
  onChange: (options: SignatureOptionsType) => void;
}

export function SignatureOptions({ options, onChange }: SignatureOptionsProps) {
  const handleAlgorithmChange = (value: string) => {
    onChange({
      ...options,
      algorithm: value as HashAlgorithm,
    });
  };

  const handleFormatChange = (value: string) => {
    onChange({
      ...options,
      format: value as SignatureFormat,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signature Options</CardTitle>
        <CardDescription>
          Configure how you want to sign the document
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="algorithm">Hash Algorithm</Label>
          <Select value={options.algorithm} onValueChange={handleAlgorithmChange}>
            <SelectTrigger id="algorithm">
              <SelectValue placeholder="Select hash algorithm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SHA-256">SHA-256 (Recommended)</SelectItem>
              <SelectItem value="SHA-384">SHA-384</SelectItem>
              <SelectItem value="SHA-512">SHA-512</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            SHA-256 is recommended for most use cases
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="format">Signature Format</Label>
          <Select value={options.format} onValueChange={handleFormatChange}>
            <SelectTrigger id="format">
              <SelectValue placeholder="Select signature format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pkcs7">PKCS#7/CMS (Standard)</SelectItem>
              <SelectItem value="detached">Detached Signature</SelectItem>
              <SelectItem value="pdf">PDF Embedded (PDF only)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {options.format === 'pkcs7' && 'Standard format, widely supported'}
            {options.format === 'detached' && 'Signature in separate file'}
            {options.format === 'pdf' && 'Signature embedded in PDF document'}
          </p>
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Summary</h4>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Algorithm:</dt>
                <dd className="font-medium">{options.algorithm}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Format:</dt>
                <dd className="font-medium">
                  {options.format === 'pkcs7' && 'PKCS#7/CMS'}
                  {options.format === 'detached' && 'Detached'}
                  {options.format === 'pdf' && 'PDF Embedded'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}