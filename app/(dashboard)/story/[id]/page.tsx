// app/(dashboard)/story/[id]/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { redirect, notFound } from 'next/navigation';
import StoryViewClient from './StoryViewClient';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import Story from '@models/Story';
import Comment from '@models/Comment';
import type { Story as StoryType } from '@/types/story';
import type { User as UserType } from '@/types/user';
import type { Comment as CommentType } from '@/types/comment';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connectDB();
  
  const storyRaw = await Story.findById(params.id)
    .select('title content description')
    .lean();
  const story = storyRaw as import('@/types/story').Story | null;

  if (!story) {
    return {
      title: 'Story Not Found | MINTOONS',
      description: 'The requested story could not be found.',
    };
  }

  return {
    title: `${story.title} | My Stories - MINTOONS`,
    description: story.excerpt || `Read "${story.title}" - a story created on MINTOONS.`,
    openGraph: {
      title: story.title,
      description: story.excerpt || story.content?.slice(0, 150) + '...',
      type: 'article',
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

async function getStoryData(storyId: string, userId: string) {
  await connectDB();

  const [storyRaw, userRaw, commentsRaw] = await Promise.all([
    Story.findById(storyId).lean(),
    User.findById(userId).select('-password').lean(),
    Comment.find({ storyId })
      .populate('commenterId', 'name role')
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  const story = storyRaw as StoryType | null;
  const user = userRaw as UserType | null;
  const comments = (commentsRaw as unknown as CommentType[]) || [];

  if (!story || !user) {
    return null;
  }

  // Check if user has access to this story
  const hasAccess = story.authorId === userId ||
    user.role === 'admin' ||
    (user.role === 'mentor' && user.assignedStudents?.includes(userId));

  if (!hasAccess) {
    return null;
  }

  return {
    story,
    user,
    comments,
    isOwner: story.authorId === userId,
    canComment: user.role === 'mentor' || user.role === 'admin',
  };
}

export default async function StoryViewPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/story/' + params.id);
  }

  const storyData = await getStoryData(params.id, session.user._id);

  if (!storyData) {
    notFound();
  }

  return (
    <Suspense 
      fallback={
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingAnimation size="lg" />
        </div>
      }
    >
      <StoryViewClient 
        story={storyData.story}
        user={storyData.user}
        comments={storyData.comments}
        isOwner={storyData.isOwner}
        canComment={storyData.canComment}
      />
    </Suspense>
  );
}