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

  const [user, stories, analytics] = await Promise.all([
    User.findById(userId).select('-password').lean(),
    Story.find({ authorId: userId })
      .select('title status wordCount aiAssessment createdAt elements')
      .sort({ createdAt: -1 })
      .lean(),
    Analytics.find({ userId })
      .sort({ date: -1 })
      .limit(30)
      .lean(),
  ]);

  if (!user || !stories) {
    return null;
  }

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