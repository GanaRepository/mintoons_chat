// app/(auth)/layout.tsx - Authentication Layout
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { FadeIn } from '@components/animations/FadeIn';

export const metadata: Metadata = {
  title: {
    template: '%s | MINTOONS Auth',
    default: 'Authentication | MINTOONS',
  },
  description:
    'Sign in or create your MINTOONS account to start writing amazing stories with AI guidance.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-purple-300 to-pink-300 opacity-20 blur-3xl" />
        <div
          className="absolute -bottom-40 -left-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-blue-300 to-cyan-300 opacity-20 blur-3xl"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="relative flex min-h-screen">
        {/* Left side - Branding */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 p-12 lg:flex lg:w-1/2">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute left-20 top-20 h-32 w-32 animate-pulse rounded-full bg-white/10" />
            <div
              className="absolute bottom-32 right-32 h-24 w-24 animate-pulse rounded-full bg-white/10"
              style={{ animationDelay: '1s' }}
            />
            <div
              className="absolute left-1/3 top-1/2 h-16 w-16 animate-pulse rounded-full bg-white/10"
              style={{ animationDelay: '2s' }}
            />
          </div>

          <div className="relative z-10">
            <FadeIn>
              <Link href="/" className="flex items-center gap-3 text-white">
                <Image
                  src="/images/logo/logo-white.svg"
                  alt="MINTOONS Logo"
                  width={48}
                  height={48}
                  className="h-12 w-12"
                />
                <span className="font-fredoka text-2xl font-bold">
                  MINTOONS
                </span>
              </Link>
            </FadeIn>
          </div>

          <div className="relative z-10 space-y-8">
            <FadeIn delay={0.2}>
              <h1 className="text-4xl font-bold leading-tight text-white lg:text-5xl">
                Where Children Create{' '}
                <span className="text-yellow-300">Amazing Stories</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.4}>
              <p className="text-xl leading-relaxed text-purple-100">
                Join 12,000+ young writers on the safest AI-powered story
                platform. Children write WITH AI guidance, not AI generation.
              </p>
            </FadeIn>

            <FadeIn delay={0.6}>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 text-purple-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                    <span className="text-sm">🛡️</span>
                  </div>
                  <span>100% Safe & COPPA Compliant</span>
                </div>
                <div className="flex items-center gap-3 text-purple-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                    <span className="text-sm">✨</span>
                  </div>
                  <span>AI Guidance, Not Generation</span>
                </div>
                <div className="flex items-center gap-3 text-purple-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                    <span className="text-sm">🎯</span>
                  </div>
                  <span>Age-Appropriate Content (2-18 years)</span>
                </div>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.8}>
            <div className="relative z-10 text-sm text-purple-200">
              © 2024 MINTOONS. Empowering young writers worldwide.
            </div>
          </FadeIn>
        </div>

        {/* Right side - Form */}
        <div className="flex flex-1 items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            <FadeIn delay={0.3}>{children}</FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
