import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import { contentModerationSystem } from '@lib/security/content-moderator';
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
    const { contentType, contentId, reason, description } = data;

    if (!contentType || !contentId || !reason) {
      return NextResponse.json(
        { error: 'Content type, ID, and reason are required' },
        { status: 400 }
      );
    }

    let result = false;

    if (contentType === 'story') {
      result = await contentModerationSystem.flagStoryForReview(
        contentId,
        session.user._id,
        `${reason}: ${description || ''}`
      );
    } else if (contentType === 'comment') {
      result = await contentModerationSystem.flagCommentForReview(
        contentId,
        session.user._id,
        `${reason}: ${description || ''}`
      );
    }

    if (result) {
      // Track content report
      trackEvent(TRACKING_EVENTS.CONTENT_REPORTED, {
        contentType,
        contentId,
        reporterId: session.user._id,
        reason
      });

      return NextResponse.json({ 
        success: true,
        message: 'Content reported successfully. Thank you for helping keep our platform safe.'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to report content' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error reporting content:', error);
    return NextResponse.json(
      { error: 'Failed to report content' }, 
      { status: 500 }
    );
  }
}