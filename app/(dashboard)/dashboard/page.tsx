// app/(dashboard)/dashboard/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import Story from '@models/Story';
import { SubscriptionConfig } from '@config/subscription';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Welcome to your MINTOONS dashboard. View your writing progress, recent stories, and achievements.',
  openGraph: {
    title: 'Dashboard | MINTOONS',
    description: 'Your personal story writing dashboard on MINTOONS.',
  },
};

async function getDashboardData(userId: string) {
  await connectDB();

  const [user, recentStories, totalStories] = await Promise.all([
    User.findById(userId).select('-password').lean(),
    Story.find({ authorId: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean(),
    Story.countDocuments({ authorId: userId }),
  ]);

  return {
    user,
    recentStories,
    totalStories,
    subscription: {
      tier: user?.subscriptionTier || 'FREE',
      storyLimit: SubscriptionConfig.getStoryLimit(user?.subscriptionTier || 'FREE'),
      storiesUsed: totalStories,
      storiesRemaining: Math.max(0, SubscriptionConfig.getStoryLimit(user?.subscriptionTier || 'FREE') - totalStories),
    },
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/dashboard');
  }

  const dashboardData = await getDashboardData(session.user._id);

  if (!dashboardData.user) {
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
      <DashboardClient 
        user={dashboardData.user}
        recentStories={dashboardData.recentStories}
        subscription={dashboardData.subscription}
      />
    </Suspense>
  );
}