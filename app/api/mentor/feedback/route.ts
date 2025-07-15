import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import Story from '@models/Story';
import Comment from '@models/Comment';
import { sendEmail } from '@lib/email/sender';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'mentor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { 
      storyId, 
      overallFeedback, 
      strengths, 
      improvements, 
      encouragement,
      rating 
    } = data;

    // Validate required fields
    if (!storyId || !overallFeedback) {
      return NextResponse.json(
        { error: 'Story ID and overall feedback are required' },
        { status: 400 }
      );
    }

    // Verify story exists and mentor can access it
    const story = await Story.findById(storyId).populate('authorId');
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Check if mentor has access to this student
    const mentor = await User.findById(session.user._id);
    if (!mentor?.assignedStudents?.map(String).includes(String(story.authorId._id))) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create comprehensive feedback comment
    const feedbackContent = `
**Overall Feedback:**
${overallFeedback}

${strengths ? `**What I Loved:**
${strengths}

` : ''}${improvements ? `**Areas to Explore:**
${improvements}

` : ''}${encouragement ? `**Keep Going:**
${encouragement}` : ''}
    `.trim();

    // Create feedback comment
    const feedback = await Comment.create({
      storyId,
      authorId: session.user._id,
      authorName: session.user.name,
      authorRole: 'mentor',
      content: feedbackContent,
      type: 'comprehensive_feedback',
      rating: rating || null,
      isPrivate: false,
      status: 'active',
      metadata: {
        strengths,
        improvements,
        encouragement,
        overallRating: rating
      }
    });

    // Update story to mark as reviewed
    await Story.findByIdAndUpdate(storyId, {
      needsMentorReview: false,
      lastReviewedAt: new Date(),
      lastReviewedBy: session.user._id
    });

    // Send notification to student
    await sendEmail({
      to: story.authorId.email,
      subject: `${session.user.name} reviewed your story!`,
      template: 'mentor_feedback',
      data: {
        studentName: story.authorId.firstName ?? story.authorId.name ?? '',
        mentorName: session.user.name,
        storyTitle: story.title,
        feedbackPreview: overallFeedback.slice(0, 150),
        storyUrl: `${process.env.APP_URL}/dashboard/story/${storyId}`,
        hasRating: !!rating,
        rating
      },
    });

    // Award points to mentor for providing feedback
    await User.findByIdAndUpdate(session.user._id, {
      $inc: { mentorPoints: 50 }
    });

    // Track feedback provided
    trackEvent(TRACKING_EVENTS.MENTOR_FEEDBACK, {
      mentorId: session.user._id,
      studentId: story.authorId._id,
      storyId,
      hasRating: !!rating,
      rating,
      feedbackLength: feedbackContent.length
    });

    return NextResponse.json({ 
      feedback,
      success: true,
      message: 'Feedback sent successfully!'
    });

  } catch (error) {
    console.error('Error providing feedback:', error);
    return NextResponse.json(
      { error: 'Failed to provide feedback' }, 
      { status: 500 }
    );
  }
}