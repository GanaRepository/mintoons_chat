import type { Metadata } from 'next';
import { Suspense } from 'react';
import ContactClient from './ContactClient';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';

export const metadata: Metadata = {
  title: 'Contact Us | MINTOONS - Creative Storytelling for Kids',
  description:
    "Get in touch with the MINTOONS team. We're here to help with questions about our creative storytelling platform for children aged 2-18.",
  keywords: [
    'contact',
    'support',
    'help',
    'customer service',
    'MINTOONS',
    'storytelling platform',
  ],
  openGraph: {
    title: "Contact MINTOONS - We're Here to Help",
    description:
      "Reach out to our friendly support team for assistance with your child's storytelling journey.",
    type: 'website',
    siteName: 'MINTOONS',
    images: [
      {
        url: '/images/og/contact.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact MINTOONS Support Team',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Contact MINTOONS - We're Here to Help",
    description:
      "Reach out to our friendly support team for assistance with your child's storytelling journey.",
    images: ['/images/og/contact.jpg'],
  },
  alternates: {
    canonical: '/contact',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <LoadingAnimation size="lg" />
        </div>
      }
    >
      <ContactClient />
    </Suspense>
  );
}
