import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
export const dynamic = 'force-dynamic';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import Achievement from '@models/Achievement';
import { UserAchievement, UserAchievementDocument } from '@models/Achievement';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    // Get all available achievements
    let query: any = { isActive: true };
    if (category) {
      query.category = category;
    }

    const achievements = await Achievement.find(query)
      .sort({ sortOrder: 1 })
      .lean();

    // Get user's unlocked achievements
    const userAchievements = await UserAchievement.find({
      userId: session.user._id
    }).lean();

    const unlockedIds = new Set(userAchievements.map((ua: any) => ua.achievementId.toString()));

    // Combine data
    const achievementsWithStatus = achievements.map(achievement => ({
      ...achievement,
      isUnlocked: unlockedIds.has(achievement.id.toString()),
      unlockedAt: (userAchievements.find((ua: any) =>
        ua.achievementId.toString() === achievement.id.toString()
      )?.unlockedAt) || null
    }));

    return NextResponse.json({
      achievements: achievementsWithStatus,
      totalAchievements: achievements.length,
      unlockedCount: userAchievements.length
    });

  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}