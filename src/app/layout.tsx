import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';
import { SchemaInjector } from '@/components/SchemaInjector';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Serbero Ink — Custom Tattoo Art',
  description: 'Serbero Ink offers permanent custom tattoo art in a dark, vintage style. Book a session with a serious artist who makes every line intentional.',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },
  openGraph: {
    title: 'Serbero Ink — Custom Tattoo Art',
    description: 'Permanent custom tattoo art in a dark, vintage style. Book with a serious artist.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: 'Serbero Ink',
    images: [
      {
        url: '/assets/images/app_logo.png',
        width: 1200,
        height: 630,
        alt: 'Serbero Ink — Custom Tattoo Studio',
        type: 'image/png',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Serbero Ink — Custom Tattoo Art',
    description: 'Permanent custom tattoo art in a dark, vintage style. Book with a serious artist.',
    images: ['/assets/images/app_logo.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Core Web Vitals: preconnect to font origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload critical font subset for LCP */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,900&family=DM+Mono:wght@400&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,900&family=DM+Mono:wght@400&display=swap"
          media="print"
          id="google-fonts-stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var l=document.getElementById('google-fonts-stylesheet');if(l)l.onload=function(){l.media='all'};})();`,
          }}
        />
        <SchemaInjector />
      </head>
      <body>{children}</body>
    </html>
  );
}