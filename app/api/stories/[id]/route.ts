import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import Story from '@models/Story';
import User from '@models/User';
import Comment from '@models/Comment';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';
import { contentModerationSystem } from '@lib/security/content-moderator';

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

    const story = await Story.findById(params.id)
      .populate('authorId', 'firstName lastName age')
      .lean();

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Check access permissions
    const storyAuthorId = typeof (story as any).authorId === 'object' && (story as any).authorId !== null && '_id' in (story as any).authorId
      ? String((story as any).authorId._id)
      : String((story as any).authorId);
    const canAccess = 
      storyAuthorId === String(session.user._id) ||
      session.user.role === 'admin' ||
      (session.user.role === 'mentor' && await canMentorAccessStory(String(session.user._id), storyAuthorId));

    if (!canAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get comments if user can access them
    const comments = await Comment.find({ storyId: params.id })
      .populate('authorId', 'firstName lastName role')
      .sort({ createdAt: 1 })
      .lean();

    // Track story view
    trackEvent(TRACKING_EVENTS.STORY_VIEW, {
      storyId: params.id,
      viewerId: session.user._id,
      authorId: storyAuthorId
    });

    return NextResponse.json({
      story,
      comments
    });

  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story' }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const story = await Story.findById(params.id);
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Check permissions
    if (String((story as any).authorId) !== String(session.user._id) && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const data = await request.json();
    const { title, content, genre, storyElements, status } = data;

    // Content moderation if publishing
    let moderationResult = null;
    if (status === 'published' && story.status !== 'published') {
      const user = await User.findById(session.user._id);
      moderationResult = await contentModerationSystem.moderateStory(
        content || story.content,
        user?.age || 18
      );

      if (moderationResult.isFlagged) {
        return NextResponse.json({
          error: 'Content needs review before publishing',
          reasons: moderationResult.reasons
        }, { status: 400 });
      }
    }

    // Update story
    const updateData: any = {
      updatedAt: new Date()
    };

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) {
      updateData.content = moderationResult?.moderatedContent || content;
      updateData.wordCount = content.split(/\s+/).length;
      updateData.readingTime = Math.ceil(content.split(/\s+/).length / 200);
    }
    if (genre !== undefined) updateData.genre = genre;
    if (storyElements !== undefined) updateData.storyElements = storyElements;
    if (status !== undefined) updateData.status = status;

    const updatedStory = await Story.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    // Track story update
    trackEvent(TRACKING_EVENTS.STORY_EDIT, {
      storyId: params.id,
      userId: session.user._id,
      changes: Object.keys(updateData)
    });

    return NextResponse.json({ story: updatedStory });

  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json(
      { error: 'Failed to update story' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const story = await Story.findById(params.id);
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Check permissions
    if (String(story.authorId) !== String(session.user._id) && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Soft delete
    await Story.findByIdAndUpdate(params.id, {
      isDeleted: true,
      deletedAt: new Date()
    });

    // Update user story count
    await User.findByIdAndUpdate((story as any).authorId, {
      $inc: { storyCount: -1 }
    });

    // Track story deletion
    trackEvent(TRACKING_EVENTS.STORY_DELETE, {
      storyId: params.id,
      userId: session.user._id
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      { error: 'Failed to delete story' }, 
      { status: 500 }
    );
  }
}

// Helper function to check if mentor can access student story
async function canMentorAccessStory(mentorId: string, studentId: string): Promise<boolean> {
  const mentor = await User.findById(mentorId).select('assignedStudents').lean();
  const assigned = (mentor && (mentor as any).assignedStudents) || [];
  return assigned.map((id: any) => String(id)).includes(String(studentId));
}