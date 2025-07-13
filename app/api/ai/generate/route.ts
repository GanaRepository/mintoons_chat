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
    const { 
      prompt, 
      storyElements, 
      context, 
      maxTokens = 150,
      temperature = 0.7 
    } = data;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate story content
    const response = await aiProviderManager.generateStoryResponse({
      prompt,
      storyElements,
      context,
      maxTokens,
      temperature,
      userAge: session.user.age || 8
    });

    // Track AI generation
    trackEvent(TRACKING_EVENTS.AI_GENERATION, {
      userId: session.user.id,
      promptLength: prompt.length,
      responseLength: response.content.length,
      provider: response.provider,
      tokensUsed: response.tokensUsed
    });

    return NextResponse.json({
      content: response.content,
      provider: response.provider,
      tokensUsed: response.tokensUsed
    });

  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' }, 
      { status: 500 }
    );
  }
}