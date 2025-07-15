import type { Metadata } from 'next';
import { Suspense } from 'react';
import PricingClient from './PricingClient';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';
import { SubscriptionConfig } from '@config/subscription';

export const metadata: Metadata = {
  title: 'Pricing Plans | MINTOONS - Affordable Creative Storytelling',
  description: 'Choose the perfect plan for your child\'s storytelling journey. Free and premium options available with AI mentorship and creative tools.',
  keywords: ['pricing', 'subscription', 'plans', 'storytelling', 'kids', 'creative writing', 'AI mentor'],
  openGraph: {
    title: 'MINTOONS Pricing - Plans for Every Young Storyteller',
    description: 'Discover our affordable pricing plans designed to nurture your child\'s creativity and writing skills.',
    type: 'website',
    siteName: 'MINTOONS',
    images: [
      {
        url: '/images/og/pricing.jpg',
        width: 1200,
        height: 630,
        alt: 'MINTOONS Pricing Plans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MINTOONS Pricing - Plans for Every Young Storyteller',
    description: 'Discover our affordable pricing plans designed to nurture your child\'s creativity and writing skills.',
    images: ['/images/og/pricing.jpg'],
  },
  alternates: {
    canonical: '/pricing',
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'pricing:currency': 'USD',
    'pricing:amount': (typeof SubscriptionConfig.getTier('premium')?.price === 'number'
      ? SubscriptionConfig.getTier('premium')!.price.toString()
      : '19.99'),
  },
};

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingAnimation size="lg" />
        </div>
      }
    >
      <PricingClient />
    </Suspense>
  );
}