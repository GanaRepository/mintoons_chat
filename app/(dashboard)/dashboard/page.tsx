// app/(dashboard)/dashboard/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';
import { connectDB } from '@lib/database/connection';
import type { User as UserType } from '@/types/user';
import type { Story as StoryType } from '@/types/story';
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

  const [userDoc, recentStoriesDocs, totalStories] = await Promise.all([
    User.findById(userId).select('-password').lean(),
    Story.find({ authorId: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean(),
    Story.countDocuments({ authorId: userId }),
  ]);

  if (!userDoc) return null;

  // Map userDoc to UserType (fill all required fields)
  const user: UserType = {
    _id: userDoc._id.toString(),
    firstName: userDoc.firstName ?? '',
    lastName: userDoc.lastName ?? '',
    fullName: userDoc.fullName ?? `${userDoc.firstName ?? ''} ${userDoc.lastName ?? ''}`,
    email: userDoc.email ?? '',
    age: userDoc.age ?? 0,
    ageGroup: userDoc.ageGroup ?? '',
    role: userDoc.role ?? 'child',
    subscriptionTier: userDoc.subscriptionTier ?? 'FREE',
    isActive: userDoc.isActive ?? true,
    emailVerified: userDoc.emailVerified ?? false,
    avatar: userDoc.avatar ?? '',
    bio: userDoc.bio ?? '',
    parentEmail: userDoc.parentEmail ?? '',
    stripeCustomerId: userDoc.stripeCustomerId ?? '',
    subscriptionId: userDoc.subscriptionId ?? '',
    subscriptionStatus: userDoc.subscriptionStatus ?? '',
    subscriptionExpires: userDoc.subscriptionExpires ?? null,
    subscriptionCurrentPeriodEnd: userDoc.subscriptionCurrentPeriodEnd ?? null,
    storyCount: userDoc.storyCount ?? totalStories,
    lastStoryCreated: userDoc.lastStoryCreated ?? null,
    canCreateStory: userDoc.canCreateStory ?? true,
    remainingStories: userDoc.remainingStories ?? 0,
    totalPoints: userDoc.totalPoints ?? 0,
    level: userDoc.level ?? 1,
    streak: userDoc.streak ?? 0,
    lastActiveDate: userDoc.lastActiveDate ?? null,
    assignedStudents: (userDoc.assignedStudents ?? []).map((s: any) => typeof s === 'string' ? s : s?._id?.toString?.() ?? ''),
    mentoringSince: userDoc.mentoringSince ?? null,
    emailPreferences: userDoc.emailPreferences ?? {
      notifications: true,
      mentorFeedback: true,
      achievements: true,
      weeklyReports: true,
      marketing: false,
    },
    lastLoginAt: userDoc.lastLoginAt ?? null,
    loginAttempts: userDoc.loginAttempts ?? 0,
    lockUntil: userDoc.lockUntil ?? null,
    createdAt: userDoc.createdAt ?? new Date(),
    updatedAt: userDoc.updatedAt ?? new Date(),
  };

  // Map stories to your StoryType (fill all required fields)
  const recentStories: StoryType[] = recentStoriesDocs.map((story: any) => ({
    _id: story._id.toString(),
    title: story.title ?? '',
    content: story.content ?? '',
    elements: story.elements ?? [],
    status: story.status ?? '',
    authorId: story.authorId?.toString?.() ?? '',
    createdAt: story.createdAt ?? new Date(),
    updatedAt: story.updatedAt ?? new Date(),
    // add any other required fields from your StoryType here
  }));

  return {
    user,
    recentStories,
    totalStories,
    subscription: {
      tier: user.subscriptionTier,
      storyLimit: SubscriptionConfig.getStoryLimit(user.subscriptionTier),
      storiesUsed: totalStories,
      storiesRemaining: Math.max(
        0,
        SubscriptionConfig.getStoryLimit(user.subscriptionTier) - totalStories
      ),
    },
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/dashboard');
  }

  const dashboardData = await getDashboardData(session.user._id);

  if (!dashboardData) {
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