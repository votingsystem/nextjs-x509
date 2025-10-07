'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSignature, ShieldCheck, FileText, ArrowRight, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: FileSignature,
      title: 'Sign Documents',
      description: 'Create digital signatures using X.509 certificates and private keys',
      href: '/sign',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      icon: ShieldCheck,
      title: 'Validate Signatures',
      description: 'Verify the authenticity and integrity of digitally signed documents',
      href: '/validate',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      icon: FileText,
      title: 'Manage Certificates',
      description: 'Upload, parse, and view X.509 certificate details',
      href: '/certificates',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Upload Certificate',
      description: 'Load your X.509 certificate in PEM, DER, or PKCS#12 format',
    },
    {
      number: '2',
      title: 'Provide Private Key',
      description: 'Upload your private key (encrypted keys supported)',
    },
    {
      number: '3',
      title: 'Select Document',
      description: 'Choose the document you want to sign',
    },
    {
      number: '4',
      title: 'Generate Signature',
      description: 'Create a PKCS#7/CMS digital signature',
    },
  ];

  const securityFeatures = [
    'Client-side cryptography only',
    'No server-side key storage',
    'Session-based operations',
    'Multiple signature formats',
    'Certificate chain validation',
    'Timestamp support',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            X.509 Digital Signature
            <span className="block text-primary mt-2">Application</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A secure, client-side tool for creating and validating digital signatures using X.509
            certificates. Perfect for development and testing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/sign">
                <FileSignature className="mr-2 h-5 w-5" />
                Sign Document
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/validate">
                <ShieldCheck className="mr-2 h-5 w-5" />
                Validate Signature
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.href} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href={feature.href}>
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {step.number}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Security First</h2>
          <Card>
            <CardHeader>
              <CardTitle>Built with Security in Mind</CardTitle>
              <CardDescription>
                All cryptographic operations are performed client-side in your browser. Your
                private keys never leave your device.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground">
            Choose an action below to begin working with digital signatures
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/sign">Sign a Document</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/validate">Validate a Signature</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/certificates">View Certificates</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
