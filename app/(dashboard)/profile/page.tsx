// app/(dashboard)/profile/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import Subscription from '@models/Subscription';

export const metadata: Metadata = {
  title: 'Profile Settings',
  description: 'Manage your MINTOONS account settings, preferences, and subscription details.',
  robots: {
    index: false,
    follow: false,
  },
};

async function getUserProfileData(userId: string) {
  await connectDB();

  const [user, subscription] = await Promise.all([
    User.findById(userId).select('-password').lean(),
    Subscription.findOne({ userId }).lean(),
  ]);

  return {
    user,
    subscription,
  };
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/profile');
  }

  const { user, subscription } = await getUserProfileData(session.user.id);

  if (!user) {
    redirect('/login?error=UserNotFound');
  }

  return (
    <Suspense 
      fallback={
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingAnimation size="lg" />
        </div>
      }
    >
      <ProfileClient 
        user={user}
        subscription={subscription}
      />
    </Suspense>
  );
}