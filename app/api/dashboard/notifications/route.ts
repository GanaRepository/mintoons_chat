import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import Notification from '@models/Notification';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unread') === 'true';

    let query: any = { userId: session.user.id };
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: session.user.id,
      isRead: false
    });

    return NextResponse.json({
      notifications,
      unreadCount
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' }, 
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

    const data = await request.json();
    const { notificationIds, markAsRead = true } = data;

    if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications
      await Notification.updateMany(
        { 
          _id: { $in: notificationIds },
          userId: session.user.id 
        },
        { isRead: markAsRead }
      );
    } else {
      // Mark all notifications
      await Notification.updateMany(
        { userId: session.user.id },
        { isRead: markAsRead }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' }, 
      { status: 500 }
    );
  }
}