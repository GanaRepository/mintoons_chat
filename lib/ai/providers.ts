// lib/ai/providers.ts - Multi-AI provider management
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { VertexAI } from '@google-cloud/aiplatform';
import AIProvider from '@models/AIProvider';
import { connectDB } from '@lib/database/connection';
import { filterAIResponse } from '@utils/age-restrictions';
import { retryWithBackoff } from '@utils/helpers';
import type {
  AIRequest,
  AIResponse,
  AIProvider as AIProviderType,
} from '@types/ai';

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Google AI client would be initialized here
// const googleAI = new VertexAI({...});

interface AIClient {
  generateResponse(request: AIRequest): Promise<string>;
  assessStory(content: string, userAge: number): Promise<any>;
}

class OpenAIClient implements AIClient {
  async generateResponse(request: AIRequest): Promise<string> {
    const prompt = this.buildPrompt(request);

    const response = await openai.chat.completions.create({
      model:
        request.model === 'gpt-4' ? 'gpt-4-turbo-preview' : 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt(request.userAge),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: request.maxTokens || 150,
      temperature: request.temperature || 0.7,
    });

    return response.choices[0]?.message?.content || '';
  }

  async assessStory(content: string, userAge: number): Promise<any> {
    const prompt = `Please assess this story written by a ${userAge}-year-old child. Provide scores (0-100) for grammar, creativity, and overall quality, plus constructive feedback:

Story: "${content}"

Respond in JSON format:
{
  "grammarScore": number,
  "creativityScore": number, 
  "overallScore": number,
  "feedback": "encouraging feedback",
  "suggestions": ["specific suggestion 1", "specific suggestion 2"],
  "strengths": ["strength 1", "strength 2"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.3,
    });

    const content_text = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content_text);
  }

  private buildPrompt(request: AIRequest): string {
    const { storyElements, context } = request;

    return `Continue this story with 2-3 sentences that are appropriate for a ${request.userAge}-year-old:

Genre: ${storyElements.genre}
Setting: ${storyElements.setting}
Character: ${storyElements.character}
Mood: ${storyElements.mood}

Current story: ${context}

User's latest addition: ${request.prompt}

Please continue the story in an encouraging way that builds on what the child wrote.`;
  }

  private getSystemPrompt(userAge: number): string {
    if (userAge <= 6) {
      return 'You are a helpful storytelling assistant for very young children. Keep language simple, positive, and encouraging. Avoid scary or complex themes.';
    } else if (userAge <= 12) {
      return 'You are a creative writing assistant for children. Encourage creativity while keeping content age-appropriate. Use engaging but not frightening scenarios.';
    } else {
      return 'You are a writing mentor for teenagers. Encourage sophisticated storytelling while maintaining appropriate content for young adults.';
    }
  }
}

class AnthropicClient implements AIClient {
  async generateResponse(request: AIRequest): Promise<string> {
    const prompt = this.buildPrompt(request);

    const response = await anthropic.messages.create({
      model:
        request.model === 'claude-3-opus'
          ? 'claude-3-opus-20240229'
          : 'claude-3-sonnet-20240229',
      max_tokens: request.maxTokens || 150,
      temperature: request.temperature || 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return response.content[0]?.type === 'text' ? response.content[0].text : '';
  }

  async assessStory(content: string, userAge: number): Promise<any> {
    const prompt = `Assess this story by a ${userAge}-year-old child:

"${content}"

Provide JSON with grammarScore, creativityScore, overallScore (0-100), feedback, suggestions array, and strengths array.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 500,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    const content_text =
      response.content[0]?.type === 'text' ? response.content[0].text : '{}';
    return JSON.parse(content_text);
  }

  private buildPrompt(request: AIRequest): string {
    return `You are helping a ${request.userAge}-year-old child write a story. Continue their story with 2-3 encouraging sentences.

Story elements: ${JSON.stringify(request.storyElements)}
Current story: ${request.context}
Child's latest writing: ${request.prompt}

Continue the story in a positive, age-appropriate way.`;
  }
}

class GoogleAIClient implements AIClient {
  async generateResponse(request: AIRequest): Promise<string> {
    // Google AI implementation would go here
    // For now, fallback to OpenAI
    const openaiClient = new OpenAIClient();
    return openaiClient.generateResponse(request);
  }

  async assessStory(content: string, userAge: number): Promise<any> {
    // Google AI assessment implementation
    const openaiClient = new OpenAIClient();
    return openaiClient.assessStory(content, userAge);
  }
}

export class AIProviderManager {
  private clients: Map<AIProviderType, AIClient> = new Map([
    ['openai', new OpenAIClient()],
    ['anthropic', new AnthropicClient()],
    ['google', new GoogleAIClient()],
  ]);

  async generateStoryResponse(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      await connectDB();

      // Get best available provider
      const provider = await this.getBestProvider();

      if (!provider) {
        throw new Error('No AI providers available');
      }

      // Get client for provider
      const client = this.clients.get(provider.provider);
      if (!client) {
        throw new Error(`Client not found for provider: ${provider.provider}`);
      }

      // Generate response with retry logic
      const rawResponse = await retryWithBackoff(
        () => client.generateResponse(request),
        3,
        1000
      );

      // Filter content for age appropriateness
      const filteredResponse = filterAIResponse(rawResponse, request.userAge);

      // Calculate cost and tokens (simplified)
      const tokensUsed = Math.ceil(
        (request.prompt.length + filteredResponse.length) / 4
      );
      const cost = tokensUsed * provider.costPerToken;

      // Update provider usage
      await provider.updateUsage(tokensUsed, cost);

      // Determine response type
      const responseType = this.determineResponseType();

      const response: AIResponse = {
        content: filteredResponse,
        provider: provider.provider,
        model: provider.model,
        tokensUsed,
        cost,
        responseTime: Date.now() - startTime,
        responseType,
        timestamp: new Date(),
      };

      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);

      // Try fallback provider
      return this.generateWithFallback(request, startTime);
    }
  }

  async assessStory(
    content: string,
    userAge: number,
    storyElements: Record<string, string>
  ): Promise<any> {
    try {
      await connectDB();

      const provider = await this.getBestProvider();
      if (!provider) {
        throw new Error('No AI providers available for assessment');
      }

      const client = this.clients.get(provider.provider);
      if (!client) {
        throw new Error(
          `Assessment client not found for provider: ${provider.provider}`
        );
      }

      const assessment = await client.assessStory(content, userAge);

      // Ensure scores are within valid range
      assessment.grammarScore = Math.max(
        0,
        Math.min(100, assessment.grammarScore || 0)
      );
      assessment.creativityScore = Math.max(
        0,
        Math.min(100, assessment.creativityScore || 0)
      );
      assessment.overallScore = Math.max(
        0,
        Math.min(100, assessment.overallScore || 0)
      );

      // Filter feedback for age appropriateness
      if (assessment.feedback) {
        assessment.feedback = filterAIResponse(assessment.feedback, userAge);
      }

      return assessment;
    } catch (error) {
      console.error('Error assessing story:', error);

      // Return fallback assessment
      return {
        grammarScore: 75,
        creativityScore: 80,
        overallScore: 78,
        feedback:
          'Great job on your story! Keep practicing and your writing will continue to improve.',
        suggestions: [
          'Try adding more descriptive words',
          'Think about what happens next',
        ],
        strengths: ['Creative ideas', 'Good story structure'],
      };
    }
  }

  private async getBestProvider(): Promise<any> {
    const providers = await AIProvider.find({ isActive: true }).sort({
      priority: -1,
      'performance.averageResponseTime': 1,
    });

    for (const provider of providers) {
      if (provider.isAvailable) {
        return provider;
      }
    }

    return null;
  }

  private async generateWithFallback(
    request: AIRequest,
    startTime: number
  ): Promise<AIResponse> {
    try {
      // Get fallback providers
      const fallbackProviders = await AIProvider.find({
        isActive: true,
        provider: { $ne: request.provider },
      }).sort({ priority: -1 });

      for (const provider of fallbackProviders) {
        try {
          const client = this.clients.get(provider.provider);
          if (!client) continue;

          const response = await client.generateResponse({
            ...request,
            provider: provider.provider,
            model: provider.model,
          });

          const filteredResponse = filterAIResponse(response, request.userAge);
          const tokensUsed = Math.ceil(
            (request.prompt.length + filteredResponse.length) / 4
          );
          const cost = tokensUsed * provider.costPerToken;

          await provider.updateUsage(tokensUsed, cost);

          return {
            content: filteredResponse,
            provider: provider.provider,
            model: provider.model,
            tokensUsed,
            cost,
            responseTime: Date.now() - startTime,
            responseType: this.determineResponseType(),
            timestamp: new Date(),
          };
        } catch (error) {
          console.error(
            `Fallback provider ${provider.provider} failed:`,
            error
          );
          continue;
        }
      }

      // All providers failed - return static response
      return this.getStaticFallbackResponse(request, startTime);
    } catch (error) {
      console.error('All AI providers failed:', error);
      return this.getStaticFallbackResponse(request, startTime);
    }
  }

  private getStaticFallbackResponse(
    request: AIRequest,
    startTime: number
  ): AIResponse {
    const staticResponses = [
      "That's a great addition to your story! What happens next in your adventure?",
      "I love how creative you're being! Can you tell me more about what your character does?",
      'Wonderful storytelling! What do you think your character is feeling right now?',
      "That's an interesting twist! How do you think your character will solve this problem?",
    ];

    const response =
      staticResponses[Math.floor(Math.random() * staticResponses.length)];

    return {
      content: response,
      provider: 'fallback' as AIProviderType,
      model: 'static' as any,
      tokensUsed: 0,
      cost: 0,
      responseTime: Date.now() - startTime,
      responseType: 'continue',
      timestamp: new Date(),
    };
  }

  private determineResponseType():
    | 'continue'
    | 'plot_twist'
    | 'new_character'
    | 'challenge' {
    const types = [
      'continue',
      'plot_twist',
      'new_character',
      'challenge',
    ] as const;
    const weights = [30, 25, 25, 20]; // Percentages

    const random = Math.random() * 100;
    let cumulative = 0;

    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return types[i];
      }
    }

    return 'continue';
  }
}

// Export singleton instance
export const aiProviderManager = new AIProviderManager();
