'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils/cn';

interface DocumentUploadProps {
  onDocumentLoaded: (file: File, hash: string) => void;
  onError?: (error: Error) => void;
  maxSize?: number; // in bytes
}

export function DocumentUpload({ 
  onDocumentLoaded, 
  onError,
  maxSize = 50 * 1024 * 1024 // 50MB default
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; hash: string } | null>(null);

  const calculateHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const handleFile = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);

      try {
        // Validate file size
        if (file.size > maxSize) {
          throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
        }

        // Calculate hash
        const hash = await calculateHash(file);
        
        setFileInfo({
          name: file.name,
          size: file.size,
          hash,
        });

        onDocumentLoaded(file, hash);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to process document';
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setIsLoading(false);
      }
    },
    [onDocumentLoaded, onError, maxSize]
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Upload the document you want to sign (max {maxSize / 1024 / 1024}MB)
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
              Drag and drop your document here, or
            </p>
            <Button variant="outline" disabled={isLoading} asChild>
              <label>
                <FileText className="mr-2 h-4 w-4" />
                Browse Files
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileInput}
                  disabled={isLoading}
                />
              </label>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            All file types supported
          </p>
        </div>

        {fileInfo && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Document Information</h4>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Name:</dt>
                <dd className="font-mono">{fileInfo.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Size:</dt>
                <dd>{formatFileSize(fileInfo.size)}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground">SHA-256 Hash:</dt>
                <dd className="font-mono text-xs break-all">{fileInfo.hash}</dd>
              </div>
            </dl>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Processing document...
          </div>
        )}
      </CardContent>
    </Card>
  );
}