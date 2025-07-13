// app/layout.tsx - Root Layout
import type { Metadata, Viewport } from 'next';
import { Inter, Fredoka } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@components/layout/Header';
import { Footer } from '@components/layout/Footer';
import { cn } from '@utils/cn';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-fredoka',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mintoons.com'),
  title: {
    default: 'MINTOONS - AI-Powered Story Writing Platform for Children',
    template: '%s | MINTOONS',
  },
  description:
    'The #1 AI-powered story writing platform for children ages 2-18. Safe, COPPA-compliant collaborative writing that encourages creativity. Join 12,000+ young writers today!',
  keywords: [
    'children story writing app',
    'AI story helper for kids',
    'creative writing platform kids',
    'safe writing app children',
    'collaborative storytelling',
    'educational writing tool',
    'story mentor for kids',
    'COPPA compliant writing app',
    'children creativity platform',
    'AI writing assistant kids',
  ],
  authors: [{ name: 'MINTOONS Team', url: 'https://mintoons.com' }],
  creator: 'MINTOONS',
  publisher: 'MINTOONS',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mintoons.com',
    siteName: 'MINTOONS',
    title: 'MINTOONS - Where Children Create Amazing Stories with AI',
    description:
      'Join 12,000+ young writers on the safest AI-powered story platform. Children write WITH AI guidance, not AI generation. Ages 2-18.',
    images: [
      {
        url: '/images/og/homepage-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Children writing creative stories with AI guidance on MINTOONS platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mintoons',
    creator: '@mintoons',
    title: 'MINTOONS - Where Children Create Amazing Stories with AI',
    description:
      'Safe, collaborative story writing platform for 12,000+ young writers. AI guidance, not generation. Ages 2-18.',
    images: {
      url: '/images/og/homepage-hero.jpg',
      alt: 'MINTOONS - AI-powered story writing for children',
    },
  },
  manifest: '/manifest.json',

  alternates: {
    canonical: 'https://mintoons.com',
    languages: {
      'en-US': 'https://mintoons.com',
    },
  },
  category: 'Education',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f0f' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable,
          fredoka.variable
        )}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
