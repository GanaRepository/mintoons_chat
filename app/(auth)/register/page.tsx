// app/(auth)/register/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import RegisterClient from './RegisterClient';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';

export const metadata: Metadata = {
  title: 'Create Your MINTOONS Account',
  description:
    'Join 12,000+ young writers on MINTOONS. Create your free account and start writing amazing stories with AI guidance today.',
  openGraph: {
    title: 'Create Your MINTOONS Account',
    description:
      'Join 12,000+ young writers on MINTOONS. Create your free account and start writing amazing stories with AI guidance.',
    type: 'website',
  },
  alternates: {
    canonical: '/register',
  },
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <LoadingAnimation size="lg" />
        </div>
      }
    >
      <RegisterClient />
    </Suspense>
  );
}
