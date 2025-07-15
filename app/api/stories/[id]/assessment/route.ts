import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import Story from '@models/Story';
import { aiProviderManager } from '@lib/ai/providers';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';

interface Params {
  id: string;
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

    const story = await Story.findById(params.id).populate('authorId');
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Check permissions
    if (story.authorId._id.toString() !== session.user._id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get AI assessment
    const assessment = await aiProviderManager.assessStory(
      story.content,
      story.authorId.age || 8
    );

    // Update story with assessment
    const updatedStory = await Story.findByIdAndUpdate(
      params.id,
      {
        aiAssessment: {
          grammarScore: assessment.grammarScore,
          creativityScore: assessment.creativityScore,
          overallScore: assessment.overallScore,
          feedback: assessment.feedback,
          suggestions: assessment.suggestions,
          strengths: assessment.strengths,
          assessedAt: new Date(),
          version: '1.0'
        }
      },
      { new: true }
    );

    // Track assessment
    trackEvent(TRACKING_EVENTS.STORY_ASSESSED, {
      storyId: params.id,
      userId: session.user._id,
      grammarScore: assessment.grammarScore,
      creativityScore: assessment.creativityScore,
      overallScore: assessment.overallScore
    });

    return NextResponse.json({ 
      assessment: updatedStory?.aiAssessment 
    });

  } catch (error) {
    console.error('Error assessing story:', error);
    return NextResponse.json(
      { error: 'Failed to assess story' }, 
      { status: 500 }
    );
  }
}