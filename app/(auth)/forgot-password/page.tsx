// app/(auth)/forgot-password/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import ForgotPasswordClient from './ForgotPasswordClient';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';

export const metadata: Metadata = {
  title: 'Reset Your Password | MINTOONS',
  description: 'Forgot your MINTOONS password? Enter your email address and we\'ll send you a link to reset it.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/forgot-password',
  },
};

export default function ForgotPasswordPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingAnimation size="lg" />
        </div>
      }
    >
      <ForgotPasswordClient />
    </Suspense>
  );
}