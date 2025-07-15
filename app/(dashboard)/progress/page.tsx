// app/(dashboard)/progress/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { redirect } from 'next/navigation';
import ProgressClient from './ProgressClient';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import Story from '@models/Story';
import Analytics from '@models/Analytics';

export const metadata: Metadata = {
  title: 'Writing Progress',
  description: 'Track your writing progress, achievements, and statistics. See how your storytelling skills are improving over time.',
  openGraph: {
    title: 'Writing Progress | MINTOONS',
    description: 'Track your writing journey and achievements on MINTOONS.',
  },
};

async function getProgressData(userId: string) {
  await connectDB();

  const [userDoc, storiesDocs, analytics] = await Promise.all([
    User.findById(userId).select('-password').lean(),
    Story.find({ authorId: userId })
      .select('title status wordCount aiAssessment createdAt elements content')
      .sort({ createdAt: -1 })
      .lean(),
    Analytics.find({ userId })
      .sort({ date: -1 })
      .limit(30)
      .lean(),
  ]);

  // Defensive: ensure userDoc is a single object, not array
  const userObj = Array.isArray(userDoc) ? userDoc[0] : userDoc;
  if (!userObj || !storiesDocs) {
    return null;
  }

  // Defensive mapping for user (full User type)
  const user = {
    _id: userObj._id?.toString?.() ?? '',
    firstName: userObj.firstName ?? '',
    lastName: userObj.lastName ?? '',
    email: userObj.email ?? '',
    age: userObj.age ?? 0,
    role: userObj.role ?? 'child',
    subscriptionTier: userObj.subscriptionTier ?? 'FREE',
    isActive: userObj.isActive ?? true,
    emailVerified: userObj.emailVerified ?? false,
    avatar: userObj.avatar,
    bio: userObj.bio,
    parentEmail: userObj.parentEmail,
    stripeCustomerId: userObj.stripeCustomerId,
    subscriptionId: userObj.subscriptionId,
    subscriptionStatus: userObj.subscriptionStatus,
    subscriptionExpires: userObj.subscriptionExpires,
    subscriptionCurrentPeriodEnd: userObj.subscriptionCurrentPeriodEnd,
    storyCount: userObj.storyCount ?? 0,
    lastStoryCreated: userObj.lastStoryCreated,
    totalPoints: userObj.totalPoints ?? 0,
    level: userObj.level ?? 1,
    streak: userObj.streak ?? 0,
    lastActiveDate: userObj.lastActiveDate,
    assignedStudents: userObj.assignedStudents ?? [],
    mentoringSince: userObj.mentoringSince,
    emailPreferences: userObj.emailPreferences ?? {
      notifications: true,
      mentorFeedback: true,
      achievements: true,
      weeklyReports: true,
      marketing: false,
    },
    lastLoginAt: userObj.lastLoginAt,
    loginAttempts: userObj.loginAttempts ?? 0,
    lockUntil: userObj.lockUntil,
    fullName: userObj.fullName ?? `${userObj.firstName ?? ''} ${userObj.lastName ?? ''}`.trim(),
    ageGroup: userObj.ageGroup ?? '',
    canCreateStory: userObj.canCreateStory ?? true,
    remainingStories: userObj.remainingStories ?? 0,
    createdAt: userObj.createdAt ?? new Date(),
    updatedAt: userObj.updatedAt ?? new Date(),
  };

  // Defensive mapping for stories
  const stories = Array.isArray(storiesDocs)
    ? storiesDocs.map(story => ({
        _id: story._id?.toString?.() ?? '',
        title: story.title ?? '',
        content: story.content ?? '',
        elements: story.elements ?? {
          genre: '',
          setting: '',
          character: '',
          mood: '',
          conflict: '',
          theme: '',
        },
        status: story.status ?? 'draft',
        wordCount: story.wordCount ?? 0,
        aiAssessment: story.aiAssessment ?? null,
        createdAt: story.createdAt ?? new Date(),
        updatedAt: story.updatedAt ?? new Date(),
        authorId: story.authorId?.toString?.() ?? user._id,
        authorName: story.authorName ?? user.fullName,
        authorAge: story.authorAge ?? user.age,
        readingTime: story.readingTime ?? 0,
        aiTurns: story.aiTurns ?? [],
        currentTurn: story.currentTurn ?? 0,
        assessment: story.assessment,
        isPublic: story.isPublic ?? false,
        likes: story.likes ?? 0,
        likedBy: story.likedBy ?? [],
        views: story.views ?? 0,
        viewedBy: story.viewedBy ?? [],
        mentorId: story.mentorId,
        mentorComments: story.mentorComments ?? [],
        hasUnreadComments: story.hasUnreadComments ?? false,
        isModerated: story.isModerated ?? false,
        moderationFlags: story.moderationFlags ?? [],
        excerpt: story.excerpt ?? '',
        ageGroup: story.ageGroup ?? '',
        isCompleted: story.isCompleted ?? false,
        publishedAt: story.publishedAt,
        completedAt: story.completedAt,
      }))
    : [];

  // Calculate statistics
  const totalStories = stories.length;
  const publishedStories = stories.filter(s => s.status === 'published').length;
  const draftStories = stories.filter(s => s.status === 'draft').length;
  const totalWords = stories.reduce((sum, story) => sum + (story.wordCount || 0), 0);
  const averageWordsPerStory = totalStories > 0 ? Math.round(totalWords / totalStories) : 0;

  // Calculate average assessment scores
  const storiesWithAssessment = stories.filter(s => s.aiAssessment);
  const avgGrammarScore = storiesWithAssessment.length > 0 
    ? Math.round(storiesWithAssessment.reduce((sum, s) => sum + (s.aiAssessment?.grammarScore || 0), 0) / storiesWithAssessment.length)
    : 0;
  const avgCreativityScore = storiesWithAssessment.length > 0 
    ? Math.round(storiesWithAssessment.reduce((sum, s) => sum + (s.aiAssessment?.creativityScore || 0), 0) / storiesWithAssessment.length)
    : 0;
  const avgOverallScore = storiesWithAssessment.length > 0 
    ? Math.round(storiesWithAssessment.reduce((sum, s) => sum + (s.aiAssessment?.overallScore || 0), 0) / storiesWithAssessment.length)
    : 0;

  // Calculate genre preferences
  const genreStats = stories.reduce((acc, story) => {
    const genre = story.elements?.genre || 'unknown';
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Recent writing activity (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentStories = stories.filter(s => new Date(s.createdAt) >= thirtyDaysAgo);

  return {
    user,
    stories,
    analytics: analytics || [],
    statistics: {
      totalStories,
      publishedStories,
      draftStories,
      totalWords,
      averageWordsPerStory,
      avgGrammarScore,
      avgCreativityScore,
      avgOverallScore,
      genreStats,
      recentStories: recentStories.length,
      writingDays: new Set(stories.map(s => new Date(s.createdAt).toDateString())).size,
    },
  };
}

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/progress');
  }

  const progressData = await getProgressData(session.user._id);

  if (!progressData) {
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
      <ProgressClient 
        user={progressData.user}
        stories={progressData.stories}
        analytics={progressData.analytics}
        statistics={progressData.statistics}
      />
    </Suspense>
  );
}