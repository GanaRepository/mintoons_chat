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

    // Use session.user._id and fetch points from User model
    const user = await User.findById(session.user._id).select('totalPoints');
    const points = user?.totalPoints || 0;

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

    // Find user and add points
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const oldLevel = user.level;
    await user.addPoints(points);
    const newLevel = user.level;
    return NextResponse.json({
      success: true,
      newTotal: user.totalPoints,
      levelUp: newLevel > oldLevel,
      newLevel
    });

  } catch (error) {
    console.error('Error awarding points:', error);
    return NextResponse.json(
      { error: 'Failed to award points' }, 
      { status: 500 }
    );
  }
}