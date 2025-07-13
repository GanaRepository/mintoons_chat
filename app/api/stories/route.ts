import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import Story from '@models/Story';
import User from '@models/User';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';
import { contentModerationSystem } from '@lib/security/content-moderator';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const genre = searchParams.get('genre');

    // Build query based on user role
    let query: any = {};
    
    if (session.user.role === 'child') {
      query.authorId = session.user.id;
    } else if (session.user.role === 'mentor') {
      // Get mentor's assigned students
      const mentor = await User.findById(session.user.id).select('assignedStudents');
      query.authorId = { $in: mentor?.assignedStudents || [] };
    }
    // Admin can see all stories

    // Apply filters
    if (status && status !== 'all') {
      query.status = status;
    }

    if (genre && genre !== 'all') {
      query.genre = genre;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const [stories, total] = await Promise.all([
      Story.find(query)
        .populate('authorId', 'firstName lastName age')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Story.countDocuments(query)
    ]);

    return NextResponse.json({
      stories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { title, content, genre, storyElements, status = 'draft' } = data;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Check subscription limits
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Content moderation for published stories
    let moderationResult = null;
    if (status === 'published') {
      moderationResult = await contentModerationSystem.moderateStory(
        content,
        user.age || 18
      );

      if (moderationResult.isFlagged) {
        return NextResponse.json({
          error: 'Content needs review before publishing',
          reasons: moderationResult.reasons
        }, { status: 400 });
      }
    }

    // Create story
    const story = await Story.create({
      title,
      content: moderationResult?.moderatedContent || content,
      genre: genre || 'adventure',
      authorId: session.user.id,
      storyElements: storyElements || {},
      status,
      wordCount: content.split(/\s+/).length,
      readingTime: Math.ceil(content.split(/\s+/).length / 200), // 200 WPM
      isModerated: !!moderationResult,
      moderationFlags: moderationResult?.isFlagged ? [{
        type: 'auto_review',
        reason: 'Content flagged during creation',
        flaggedBy: 'system',
        flaggedAt: new Date()
      }] : []
    });

    // Update user story count
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { storyCount: 1 },
      lastStoryCreated: new Date()
    });

    // Track story creation
    trackEvent(TRACKING_EVENTS.STORY_CREATED, {
      storyId: story._id,
      userId: session.user.id,
      genre,
      wordCount: story.wordCount,
      status
    });

    return NextResponse.json({
      story: {
        _id: story._id,
        title: story.title,
        status: story.status,
        createdAt: story.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json(
      { error: 'Failed to create story' }, 
      { status: 500 }
    );
  }
}