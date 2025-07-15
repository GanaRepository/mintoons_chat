import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import Analytics from '@models/Analytics';
import Story from '@models/Story';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '30days';
    const userId = session.user._id;

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get user analytics data
    const [analyticsData, storyData] = await Promise.all([
      Analytics.find({
        userId,
        date: { $gte: startDate }
      }).sort({ date: 1 }).lean(),

      Story.aggregate([
        {
          $match: {
            authorId: userId,
            createdAt: { $gte: startDate },
            isDeleted: { $ne: true }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 },
            totalWords: { $sum: '$wordCount' },
            avgScore: { $avg: '$aiAssessment.overallScore' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ])
    ]);

    // Format data for charts
    const activityData = analyticsData.map(item => ({
      date: item.date.toISOString().split('T')[0],
      storiesCreated: item.storiesCreated || 0,
      timeSpent: item.timeSpentMinutes || 0,
      wordsWritten: item.wordsWritten || 0
    }));

    const storyProgress = storyData.map(item => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      stories: item.count,
      words: item.totalWords,
      avgScore: Math.round(item.avgScore || 0)
    }));

    // Calculate summary stats
    const totalStories = storyData.reduce((sum, item) => sum + item.count, 0);
    const totalWords = storyData.reduce((sum, item) => sum + item.totalWords, 0);
    const avgScore = storyData.length > 0
      ? Math.round(storyData.reduce((sum, item) => sum + (item.avgScore || 0), 0) / storyData.length)
      : 0;

    return NextResponse.json({
      timeRange,
      summary: {
        totalStories,
        totalWords,
        avgScore,
        daysActive: analyticsData.length
      },
      activityData,
      storyProgress
    });

  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}