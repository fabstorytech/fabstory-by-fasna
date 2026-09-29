import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fabstorybyfasna.com'),
  title: {
    default: 'Fabstory by Fasna — Sewing Fabulous Stories',
    template: '%s | Fabstory by Fasna',
  },
  description:
    'Premium handcrafted women\'s fashion. Custom-made outfits, ready-to-ship collections, and exquisite fabrics. Specially curated for the modern woman who values style, comfort and elegance.',
  keywords: [
    'custom made outfits',
    'women fashion',
    'Indian fashion',
    'handcrafted clothing',
    'premium fabrics',
    'anarkali',
    'abaya',
    'kurti',
    'custom tailoring',
    'Fabstory by Fasna',
  ],
  authors: [{ name: 'Fabstory by Fasna' }],
  creator: 'Fabstory by Fasna',
  icons: {
    icon: [
      { url: '/logo.png', sizes: 'any' },
      { url: '/logo.png', type: 'image/png', sizes: '48x48' },
      { url: '/logo.png', type: 'image/png', sizes: '96x96' },
      { url: '/logo.png', type: 'image/png', sizes: '192x192' },
      { url: '/logo.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/logo.png',
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://fabstorybyfasna.com',
    siteName: 'Fabstory by Fasna',
    title: 'Fabstory by Fasna — Sewing Fabulous Stories',
    description:
      'Premium handcrafted women\'s fashion. Custom-made outfits, ready-to-ship collections, and exquisite fabrics.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Fabstory by Fasna',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fabstory by Fasna — Sewing Fabulous Stories',
    description:
      'Premium handcrafted women\'s fashion. Custom-made outfits, ready-to-ship collections, and exquisite fabrics.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
        <link rel="icon" href="/logo.png" type="image/png" sizes="48x48" />
        <link rel="icon" href="/logo.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/logo.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#23484A" />
      </head>
      <body
        className="min-h-full flex flex-col font-sans text-foreground bg-[#F8F5EF]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
