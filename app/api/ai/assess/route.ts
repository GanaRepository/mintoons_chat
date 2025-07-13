import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { aiProviderManager } from '@lib/ai/providers';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { content, storyElements } = data;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Assess story content
    const assessment = await aiProviderManager.assessStory({
      content,
      storyElements,
      userAge: session.user.age || 8
    });

    // Track assessment
    trackEvent(TRACKING_EVENTS.AI_ASSESSMENT, {
      userId: session.user.id,
      contentLength: content.length,
      grammarScore: assessment.grammarScore,
      creativityScore: assessment.creativityScore,
      overallScore: assessment.overallScore
    });

    return NextResponse.json({ assessment });

  } catch (error) {
    console.error('Error assessing content:', error);
    return NextResponse.json(
      { error: 'Failed to assess content' }, 
      { status: 500 }
    );
  }
}