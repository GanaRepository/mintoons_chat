// app/(auth)/login/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginClient from './LoginClient';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';

export const metadata: Metadata = {
  title: 'Sign In to MINTOONS',
  description:
    'Sign in to your MINTOONS account and continue your story writing journey. Access your stories, progress, and AI writing assistant.',
  openGraph: {
    title: 'Sign In to MINTOONS',
    description:
      'Sign in to your MINTOONS account and continue your story writing journey.',
    type: 'website',
  },
  alternates: {
    canonical: '/login',
  },
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <LoadingAnimation size="lg" />
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
