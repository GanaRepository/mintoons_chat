// app/(auth)/reset-password/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import ResetPasswordClient from './ResetPasswordClient';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';

export const metadata: Metadata = {
  title: 'Create New Password | MINTOONS',
  description: 'Create a new password for your MINTOONS account.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/reset-password',
  },
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <LoadingAnimation size="lg" />
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
