import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import { gamificationManager } from '@lib/gamification/manager';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { achievementId, context } = data;

    if (!achievementId) {
      return NextResponse.json(
        { error: 'Achievement ID is required' },
        { status: 400 }
      );
    }

    // Unlock achievement
    const result = await gamificationManager.unlockAchievement(
      session.user.id,
      achievementId,
      context
    );

    if (result.success) {
      // Track achievement unlock
      trackEvent(TRACKING_EVENTS.ACHIEVEMENT_UNLOCKED, {
        userId: session.user.id,
        achievementId,
        pointsAwarded: result.pointsAwarded
      });

      return NextResponse.json({
        success: true,
        achievement: result.achievement,
        pointsAwarded: result.pointsAwarded,
        newLevel: result.newLevel
      });
    } else {
      return NextResponse.json(
        { error: result.message || 'Failed to unlock achievement' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return NextResponse.json(
      { error: 'Failed to unlock achievement' }, 
      { status: 500 }
    );
  }
}