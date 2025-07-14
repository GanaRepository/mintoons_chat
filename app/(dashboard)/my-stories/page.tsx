// app/(dashboard)/my-stories/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { redirect } from 'next/navigation';
import MyStoriesClient from './MyStoriesClient';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import Story from '@models/Story';

export const metadata: Metadata = {
  title: 'My Stories',
  description: 'View and manage all your MINTOONS stories. Read your published stories, continue drafts, and see mentor feedback.',
  openGraph: {
    title: 'My Stories | MINTOONS',
    description: 'Your personal story collection on MINTOONS.',
  },
};

// Sample stories for new users
const sampleStories = [
  {
    id: 'sample-1',
    title: 'The Magic Rainbow Bridge',
    content: 'Luna discovered a shimmering bridge made of rainbow light that connected her backyard to a world where animals could talk and flowers sang melodies. As she stepped onto the first rainbow stripe, her feet tingled with magic, and she heard a gentle voice calling her name from the other side...',
    description: 'A magical adventure about friendship and discovery in an enchanted world where nature comes alive.',
    authorName: 'Emma, age 8',
    authorAge: 8,
    readingTime: 4,
    rating: 4.8,
    genre: 'Fantasy',
    status: 'published' as const,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    isSample: true,
    elements: {
      genre: 'fantasy',
      setting: 'forest',
      character: 'ordinary',
      mood: 'magical',
      conflict: 'mystery',
      theme: 'friendship',
    },
  },
  {
    id: 'sample-2',
    title: 'Mission: Save the Space Station',
    content: 'Commander Jake detected mysterious signals coming from the abandoned space station orbiting Mars. With his robot companion ZETA, he must solve the puzzle before the station crashes into the planet. Time was running out, and the strange beeping sounds were getting louder...',
    description: 'A thrilling space adventure combining technology, problem-solving, and teamwork.',
    authorName: 'Alex, age 12',
    authorAge: 12,
    readingTime: 7,
    rating: 4.9,
    genre: 'Space Adventure',
    status: 'published' as const,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    isSample: true,
    elements: {
      genre: 'space',
      setting: 'space',
      character: 'robot',
      mood: 'exciting',
      conflict: 'rescue',
      theme: 'teamwork',
    },
  },
  {
    id: 'sample-3',
    title: 'Whiskers the Brave Cat',
    content: 'When all the neighborhood pets started disappearing, Whiskers knew she had to be brave and find them. Her adventure led her through secret tunnels under the city, where she discovered the kindest surprise - a lonely old man who just wanted some furry friends to keep him company...',
    description: 'A heartwarming tale about courage, kindness, and understanding others.',
    authorName: 'Lily, age 6',
    authorAge: 6,
    readingTime: 3,
    rating: 4.7,
    genre: 'Animal Tales',
    status: 'published' as const,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    isSample: true,
    elements: {
      genre: 'animal',
      setting: 'village',
      character: 'animal',
      mood: 'brave',
      conflict: 'rescue',
      theme: 'kindness',
    },
  },
  {
    id: 'sample-4',
    title: 'The Time-Traveling Backpack',
    content: 'Maya found an old backpack in her grandmother\'s attic that had a very special secret - it could transport her to any time period she imagined! Her first journey took her to ancient Egypt, where she met a young pharaoh who needed help solving a mystery in the Great Pyramid...',
    description: 'An educational adventure through time, learning about history and making new friends.',
    authorName: 'Sofia, age 10',
    authorAge: 10,
    readingTime: 6,
    rating: 4.6,
    genre: 'Adventure',
    status: 'published' as const,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isSample: true,
    elements: {
      genre: 'adventure',
      setting: 'historical',
      character: 'explorer',
      mood: 'curious',
      conflict: 'mystery',
      theme: 'learning',
    },
  },
];

async function getUserStoriesData(userId: string) {
  await connectDB();

  const [user, stories] = await Promise.all([
    User.findById(userId).select('-password').lean(),
    Story.find({ authorId: userId })
      .sort({ updatedAt: -1 })
      .lean(),
  ]);

  return {
    user,
    stories: stories || [],
    hasStories: (stories || []).length > 0,
    sampleStories: sampleStories,
  };
}

export default async function MyStoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/my-stories');
  }

  const { user, stories, hasStories, sampleStories } = await getUserStoriesData(session.user._id);
  let userDoc = user;
  // Defensive: If userDoc is an array, pick first element; else use as is
  if (Array.isArray(userDoc)) userDoc = userDoc[0];
  if (!userDoc) {
    redirect('/login?error=UserNotFound');
  }

  // Map userDoc to User type (fill all required fields)
  const mappedUser = {
    _id: userDoc._id?.toString?.() ?? '',
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
    storyCount: userDoc.storyCount ?? stories.length,
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

  // Map stories to Story type (fill all required fields)
  const mappedStories = (stories || []).map((story: any) => ({
    _id: story._id?.toString?.() ?? '',
    title: story.title ?? '',
    content: story.content ?? '',
    elements: story.elements ?? {
      genre: '', setting: '', character: '', mood: '', conflict: '', theme: ''
    },
    status: story.status ?? 'draft',
    authorId: story.authorId?.toString?.() ?? '',
    authorName: story.authorName ?? mappedUser.fullName ?? '',
    authorAge: story.authorAge ?? mappedUser.age ?? 0,
    wordCount: story.wordCount ?? (story.content ? story.content.split(/\s+/).length : 0),
    readingTime: story.readingTime ?? 1,
    aiTurns: story.aiTurns ?? [],
    currentTurn: story.currentTurn ?? 0,
    assessment: story.assessment ?? undefined,
    isPublic: story.isPublic ?? true,
    likes: story.likes ?? 0,
    likedBy: story.likedBy ?? [],
    views: story.views ?? 0,
    viewedBy: story.viewedBy ?? [],
    mentorId: story.mentorId ?? '',
    mentorComments: story.mentorComments ?? [],
    hasUnreadComments: story.hasUnreadComments ?? false,
    isModerated: story.isModerated ?? false,
    moderationFlags: story.moderationFlags ?? [],
    excerpt: story.excerpt ?? '',
    ageGroup: story.ageGroup ?? mappedUser.ageGroup ?? '',
    isCompleted: story.isCompleted ?? false,
    createdAt: story.createdAt ?? new Date(),
    updatedAt: story.updatedAt ?? new Date(),
    publishedAt: story.publishedAt ?? undefined,
    completedAt: story.completedAt ?? undefined,
  }));

  return (
    <Suspense 
      fallback={
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingAnimation size="lg" />
        </div>
      }
    >
      <MyStoriesClient 
        user={mappedUser}
        stories={mappedStories}
        hasStories={hasStories}
        sampleStories={sampleStories}
      />
    </Suspense>
  );
}