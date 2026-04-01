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
        <SchemaInjector />

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fserberoink4165back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.17" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></head>
      <body>{children}
</body>
    </html>
  );
}