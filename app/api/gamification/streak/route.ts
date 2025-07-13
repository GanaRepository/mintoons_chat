import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import { gamificationManager } from '@lib/gamification/manager';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .select('streak lastActiveDate')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      currentStreak: user.streak || 0,
      lastActiveDate: user.lastActiveDate
    });

  } catch (error) {
    console.error('Error fetching streak:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streak' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Update user's writing streak
    const result = await gamificationManager.updateWritingStreak(session.user.id);

    return NextResponse.json({
      streak: result.streak,
      streakBroken: result.streakBroken,
      pointsAwarded: result.pointsAwarded
    });

  } catch (error) {
    console.error('Error updating streak:', error);
    return NextResponse.json(
      { error: 'Failed to update streak' }, 
      { status: 500 }
    );
  }
}