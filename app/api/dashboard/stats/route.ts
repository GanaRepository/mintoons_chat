import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import Story from '@models/Story';
import User from '@models/User';
import Achievement from '@models/Achievement';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const userId = session.user.id;
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalStories,
      publishedStories,
      draftStories,
      storiesThisWeek,
      storiesThisMonth,
      totalWords,
      userAchievements,
      recentStories
    ] = await Promise.all([
      Story.countDocuments({ authorId: userId, isDeleted: { $ne: true } }),
      Story.countDocuments({ authorId: userId, status: 'published', isDeleted: { $ne: true } }),
      Story.countDocuments({ authorId: userId, status: 'draft', isDeleted: { $ne: true } }),
      Story.countDocuments({ authorId: userId, createdAt: { $gte: last7Days }, isDeleted: { $ne: true } }),
      Story.countDocuments({ authorId: userId, createdAt: { $gte: last30Days }, isDeleted: { $ne: true } }),
      Story.aggregate([
        { $match: { authorId: userId, isDeleted: { $ne: true } } },
        { $group: { _id: null, totalWords: { $sum: '$wordCount' } } }
      ]),
      Achievement.find({ userId, unlockedAt: { $exists: true } }).countDocuments(),
      Story.find({ authorId: userId, isDeleted: { $ne: true } })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('title status createdAt updatedAt wordCount aiAssessment')
        .lean()
    ]);

    // Get writing streak
    const user = await User.findById(userId).select('streak level points');
    
    // Calculate average scores
    const storiesWithScores = await Story.find({ 
      authorId: userId, 
      'aiAssessment.overallScore': { $exists: true },
      isDeleted: { $ne: true }
    }).select('aiAssessment');

    const avgOverallScore = storiesWithScores.length > 0 
      ? Math.round(storiesWithScores.reduce((sum, story) => sum + (story.aiAssessment?.overallScore || 0), 0) / storiesWithScores.length)
      : 0;

    const avgGrammarScore = storiesWithScores.length > 0 
      ? Math.round(storiesWithScores.reduce((sum, story) => sum + (story.aiAssessment?.grammarScore || 0), 0) / storiesWithScores.length)
      : 0;

    const avgCreativityScore = storiesWithScores.length > 0 
      ? Math.round(storiesWithScores.reduce((sum, story) => sum + (story.aiAssessment?.creativityScore || 0), 0) / storiesWithScores.length)
      : 0;

    const stats = {
      stories: {
        total: totalStories,
        published: publishedStories,
        drafts: draftStories,
        thisWeek: storiesThisWeek,
        thisMonth: storiesThisMonth,
        recent: recentStories
      },
      writing: {
        totalWords: totalWords[0]?.totalWords || 0,
        avgWordsPerStory: totalStories > 0 ? Math.round((totalWords[0]?.totalWords || 0) / totalStories) : 0,
        streak: user?.streak || 0,
        avgOverallScore,
        avgGrammarScore,
        avgCreativityScore
      },
      gamification: {
        level: user?.level || 1,
        points: user?.points || 0,
        achievements: userAchievements,
        pointsToNextLevel: Math.max(0, (user?.level || 1) * 1000 - (user?.points || 0))
      }
    };

    // Track dashboard view
    trackEvent(TRACKING_EVENTS.DASHBOARD_VIEWED, {
      userId,
      totalStories: stats.stories.total,
      level: stats.gamification.level
    });

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' }, 
      { status: 500 }
    );
  }
}