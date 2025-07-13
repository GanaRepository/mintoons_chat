import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import { gamificationManager } from '@lib/gamification/manager';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const points = await gamificationManager.getUserPoints(session.user.id);

    return NextResponse.json({ points });

  } catch (error) {
    console.error('Error fetching points:', error);
    return NextResponse.json(
      { error: 'Failed to fetch points' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { userId, points, reason } = data;

    if (!userId || !points || !reason) {
      return NextResponse.json(
        { error: 'User ID, points, and reason are required' },
        { status: 400 }
      );
    }

    const result = await gamificationManager.awardPoints(userId, points, reason);

    return NextResponse.json({
      success: true,
      newTotal: result.newTotal,
      levelUp: result.levelUp,
      newLevel: result.newLevel
    });

  } catch (error) {
    console.error('Error awarding points:', error);
    return NextResponse.json(
      { error: 'Failed to award points' }, 
      { status: 500 }
    );
  }
}