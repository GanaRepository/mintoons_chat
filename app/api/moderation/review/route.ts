import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import { contentModerationSystem } from '@lib/security/content-moderator';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { contentType, contentId, action, message } = data;

    if (!contentType || !contentId || !action) {
      return NextResponse.json(
        { error: 'Content type, ID, and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be approve or reject' },
        { status: 400 }
      );
    }

    const result = await contentModerationSystem.reviewFlaggedContent(
      contentType,
      contentId,
      action,
      session.user._id,
      message
    );

    if (result) {
      return NextResponse.json({
        success: true,
        message: `Content ${action}d successfully`,
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to review content' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error reviewing content:', error);
    return NextResponse.json(
      { error: 'Failed to review content' },
      { status: 500 }
    );
  }
}
