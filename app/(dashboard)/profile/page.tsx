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

  const [userDoc, subscription] = await Promise.all([
    User.findById(userId).select('-password').lean(),
    Subscription.findOne({ userId }).lean(),
  ]);

  // Defensive mapping: ensure user is a single object and matches User type
  let user = null;
  if (userDoc && !Array.isArray(userDoc)) {
    user = {
      _id: userDoc._id?.toString?.() ?? '',
      firstName: userDoc.firstName ?? '',
      lastName: userDoc.lastName ?? '',
      email: userDoc.email ?? '',
      age: userDoc.age ?? 0,
      role: userDoc.role ?? 'child',
      subscriptionTier: userDoc.subscriptionTier ?? 'FREE',
      isActive: userDoc.isActive ?? true,
      emailVerified: userDoc.emailVerified ?? false,
      avatar: userDoc.avatar,
      bio: userDoc.bio,
      parentEmail: userDoc.parentEmail,
      stripeCustomerId: userDoc.stripeCustomerId,
      subscriptionId: userDoc.subscriptionId,
      subscriptionStatus: userDoc.subscriptionStatus,
      subscriptionExpires: userDoc.subscriptionExpires,
      subscriptionCurrentPeriodEnd: userDoc.subscriptionCurrentPeriodEnd,
      storyCount: userDoc.storyCount ?? 0,
      lastStoryCreated: userDoc.lastStoryCreated,
      totalPoints: userDoc.totalPoints ?? 0,
      level: userDoc.level ?? 1,
      streak: userDoc.streak ?? 0,
      lastActiveDate: userDoc.lastActiveDate,
      assignedStudents: userDoc.assignedStudents ?? [],
      mentoringSince: userDoc.mentoringSince,
      emailPreferences: userDoc.emailPreferences ?? {},
      lastLoginAt: userDoc.lastLoginAt,
      loginAttempts: userDoc.loginAttempts ?? 0,
      lockUntil: userDoc.lockUntil,
      fullName: userDoc.fullName ?? `${userDoc.firstName ?? ''} ${userDoc.lastName ?? ''}`.trim(),
      ageGroup: userDoc.ageGroup ?? '',
      canCreateStory: userDoc.canCreateStory ?? true,
      remainingStories: userDoc.remainingStories ?? 0,
      createdAt: userDoc.createdAt ?? new Date(),
      updatedAt: userDoc.updatedAt ?? new Date(),
    };
  }

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

  const { user, subscription } = await getUserProfileData(session.user._id);

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