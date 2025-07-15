import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get('timeframe') || 'all'; // 'week', 'month', 'all'
    const ageGroup = searchParams.get('ageGroup'); // Optional age filtering
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query for age-appropriate leaderboard
    let query: any = {
      role: 'child',
      isActive: true
    };

    // Age group filtering for privacy
    if (ageGroup) {
      const [minAge, maxAge] = ageGroup.split('-').map(Number);
      query.age = { $gte: minAge, $lte: maxAge };
    } else {
      // Default: only show users within 2 years of current user's age
      const userAge = session.user.age || 10;
      query.age = {
        $gte: Math.max(2, userAge - 2),
        $lte: Math.min(18, userAge + 2)
      };
    }

    // Time-based filtering
    if (timeframe !== 'all') {
      const now = new Date();
      let startDate: Date;

      if (timeframe === 'week') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (timeframe === 'month') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else {
        startDate = new Date(0); // All time
      }

      // For time-based leaderboards, we'd need to track points by date
      // For now, we'll use total points but could enhance with time-based scoring
    }

    const leaderboard = await User.find(query)
      .select('firstName lastName age level totalPoints streak storyCount')
      .sort({ totalPoints: -1, level: -1, storyCount: -1 })
      .limit(limit)
      .lean();

    // Add rank and anonymize data for privacy
    const leaderboardWithRank = leaderboard.map((user, index) => ({
      rank: index + 1,
      // Only show first name + last initial for privacy
      displayName: `${user.firstName} ${user.lastName?.charAt(0) || ''}.`,
      age: user.age,
      level: user.level || 1,
      points: user.totalPoints || 0,
      storyCount: user.storyCount || 0,
      streak: user.streak || 0,
      isCurrentUser: String(user._id) === session.user._id
    }));

    // Find current user's position if not in top results
    let currentUserRank = null;
    const currentUserIndex = leaderboard.findIndex(
      user => String(user._id) === session.user._id
    );

    if (currentUserIndex === -1) {
      // User not in top results, find their actual rank
      const usersAbove = await User.countDocuments({
        ...query,
        $or: [
          { totalPoints: { $gt: session.user.totalPoints || 0 } },
          {
            totalPoints: session.user.totalPoints || 0,
            level: { $gt: session.user.level || 1 }
          },
          {
            totalPoints: session.user.totalPoints || 0,
            level: session.user.level || 1,
            storyCount: { $gt: session.user.storyCount || 0 }
          }
        ]
      });

      currentUserRank = usersAbove + 1;
    }

    return NextResponse.json({
      leaderboard: leaderboardWithRank,
      currentUserRank: currentUserRank || (currentUserIndex + 1),
      timeframe,
      ageGroup: ageGroup || `${Math.max(2, (session.user.age || 10) - 2)}-${Math.min(18, (session.user.age || 10) + 2)}`
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}