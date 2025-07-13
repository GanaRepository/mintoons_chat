import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import Story from '@models/Story';
import Comment from '@models/Comment';
import User from '@models/User';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';
import { sendEmail } from '@lib/email/sender';

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const comments = await Comment.find({ 
      storyId: params.id,
      status: 'active'
    })
      .populate('authorId', 'firstName lastName role')
      .populate('replies.authorId', 'firstName lastName role')
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ comments });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' }, 
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { 
      content, 
      type = 'suggestion', 
      highlightedText, 
      highlightPosition,
      parentCommentId,
      isPrivate = false
    } = data;

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Verify story exists and user can comment
    const story = await Story.findById(params.id).populate('authorId');
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Check permissions (mentors and admins can comment, authors can reply)
    const canComment = 
      session.user.role === 'admin' ||
      session.user.role === 'mentor' ||
      (story.authorId._id.toString() === session.user.id && parentCommentId); // Authors can only reply

    if (!canComment) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Create comment
    const comment = await Comment.create({
      storyId: params.id,
      authorId: session.user.id,
      authorName: `${session.user.firstName} ${session.user.lastName}`,
      authorRole: session.user.role,
      content,
      type,
      highlightedText,
      highlightPosition,
      parentCommentId,
      isPrivate,
      status: 'active'
    });

    // Populate author info
    await comment.populate('authorId', 'firstName lastName role');

    // Send notification to story author (if not commenting on own story)
    if (story.authorId._id.toString() !== session.user.id) {
      await sendEmail({
        to: story.authorId.email,
        subject: 'New comment on your story',
        template: 'new_comment',
        data: {
          studentName: story.authorId.firstName,
          storyTitle: story.title,
          mentorName: comment.authorName,
          commentPreview: content.slice(0, 100),
          storyUrl: `${process.env.APP_URL}/dashboard/story/${params.id}`,
        },
      });
    }

    // Track comment creation
    trackEvent(TRACKING_EVENTS.COMMENT_CREATED, {
      commentId: comment._id,
      storyId: params.id,
      authorId: session.user.id,
      type,
      isReply: !!parentCommentId
    });

    return NextResponse.json({ comment }, { status: 201 });

  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' }, 
      { status: 500 }
    );
  }
}