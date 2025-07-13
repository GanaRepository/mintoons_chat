// app/(dashboard)/create-stories/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { redirect } from 'next/navigation';
import CreateStoriesClient from './CreateStoriesClient';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import Story from '@models/Story';
import { SubscriptionConfig } from '@config/subscription';

export const metadata: Metadata = {
  title: 'Create New Story',
  description: 'Create amazing stories with AI guidance. Choose your story elements and start your collaborative writing journey.',
  openGraph: {
    title: 'Create New Story | MINTOONS',
    description: 'Start writing your next amazing story with AI guidance on MINTOONS.',
  },
};

async function getUserAndStoryData(userId: string) {
  await connectDB();

  const [user, storyCount] = await Promise.all([
    User.findById(userId).select('-password').lean(),
    Story.countDocuments({ authorId: userId }),
  ]);

  if (!user) {
    return null;
  }

  const storyLimit = SubscriptionConfig.getStoryLimit(user.subscriptionTier);
  const canCreateStory = storyCount < storyLimit;

  return {
    user,
    storyCount,
    storyLimit,
    canCreateStory,
    storiesRemaining: Math.max(0, storyLimit - storyCount),
  };
}

export default async function CreateStoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/create-stories');
  }

  const userData = await getUserAndStoryData(session.user.id);

  if (!userData || !userData.user) {
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
      <CreateStoriesClient 
        user={userData.user}
        storyCount={userData.storyCount}
        storyLimit={userData.storyLimit}
        canCreateStory={userData.canCreateStory}
        storiesRemaining={userData.storiesRemaining}
      />
    </Suspense>
  );
}