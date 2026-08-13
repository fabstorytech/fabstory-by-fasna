import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
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
        url: '/og-image.jpg',
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
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col font-sans text-foreground bg-[#F8F5EF]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
