import { NextRequest, NextResponse } from 'next/server';
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


    // Use session.user._id and fetch streak info
    const user = await User.findById(session.user._id)
      .select('streak lastActiveDate')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      currentStreak: (user as any).streak || 0,
      lastActiveDate: (user as any).lastActiveDate
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


    // Update user's writing streak using User model
    const user = await User.findById(session.user._id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const oldStreak = user.streak;
    await user.updateStreak();
    const newStreak = user.streak;
    // For demonstration, assume streakBroken if streak reset to 1
    const streakBroken = newStreak === 1 && oldStreak > 1;
    // Optionally award points for streak update
    // await user.addPoints(10); // Uncomment if you want to award points
    return NextResponse.json({
      streak: newStreak,
      streakBroken,
      pointsAwarded: 0 // Set to actual points if awarding
    });

  } catch (error) {
    console.error('Error updating streak:', error);
    return NextResponse.json(
      { error: 'Failed to update streak' }, 
      { status: 500 }
    );
  }
}