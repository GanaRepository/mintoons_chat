// lib/ai/providers.ts - Practical AI provider management
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
// Google AI import - only load when needed
// import { GoogleGenerativeAI } from '@google/generative-ai';

import AIProvider from '@models/AIProvider';
import { connectDB } from '@lib/database/connection';
import { filterAIResponse } from '@utils/age-restrictions';
import { retryWithBackoff } from '@utils/helpers';

// Define types locally
export type AIProviderType = 'openai' | 'anthropic' | 'google';
export type AIModel =
  | 'gpt-4o-mini' // Primary - cheapest and fast
  | 'gpt-4o' // Premium option
  | 'gpt-4-turbo' // Legacy
  | 'gpt-3.5-turbo' // Fallback
  | 'claude-3-opus' // Premium Anthropic
  | 'claude-3-sonnet' // Mid-tier Anthropic
  | 'claude-3-haiku' // Cheap Anthropic
  | 'gemini-pro' // Google option
  | 'gemini-1.5-pro'; // Google premium

export interface AIRequest {
  provider: AIProviderType;
  model: AIModel;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  context?: string;
  userAge: number;
  storyElements: Record<string, string>;
}

export interface AIResponse {
  content: string;
  provider: AIProviderType;
  model: AIModel;
  tokensUsed: number;
  cost: number;
  responseTime: number;
  responseType: 'continue' | 'plot_twist' | 'new_character' | 'challenge';
  timestamp: Date;
}

interface AIProviderDocument {
  _id?: string;
  provider: AIProviderType;
  model: string;
  isActive: boolean;
  costPerToken: number;
  priority: number;
  isAvailable: boolean;
  performance: {
    averageResponseTime: number;
  };
  updateUsage: (tokens: number, cost: number) => Promise<void>;
  createdAt?: Date;
  updatedAt?: Date;
}

// AI Configuration - Easy to change primary provider
const AI_CONFIG = {
  // PRIMARY PROVIDER - Change this to switch entire system
  primaryProvider: 'openai' as AIProviderType,
  primaryModel: 'gpt-4o-mini' as AIModel,

  // FALLBACK PROVIDER - Only used if primary fails
  fallbackProvider: 'openai' as AIProviderType,
  fallbackModel: 'gpt-3.5-turbo' as AIModel,

  // ASSESSMENT PROVIDER - For story evaluation (can be different)
  assessmentProvider: 'openai' as AIProviderType,
  assessmentModel: 'gpt-4o-mini' as AIModel,

  // Enable/disable providers
  enabledProviders: {
    openai: true,
    anthropic: false, // Set to true when client wants to use
    google: false, // Set to true when client wants to use
  },
};

// Initialize only enabled clients
const openai = AI_CONFIG.enabledProviders.openai
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

const anthropic = AI_CONFIG.enabledProviders.anthropic
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  : null;

// Google AI - dynamically import only when needed
let googleAI: any = null;

interface AIClient {
  generateResponse(request: AIRequest): Promise<string>;
  assessStory(content: string, userAge: number): Promise<any>;
}

class OpenAIClient implements AIClient {
  async generateResponse(request: AIRequest): Promise<string> {
    if (!openai) throw new Error('OpenAI client not initialized');

    const prompt = this.buildPrompt(request);

    const response = await openai.chat.completions.create({
      model: this.getOpenAIModel(request.model),
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

    return (
      response.choices[0]?.message?.content ||
      'Please tell me more about your story!'
    );
  }

  async assessStory(content: string, userAge: number): Promise<any> {
    if (!openai) throw new Error('OpenAI client not initialized');

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
      model: this.getOpenAIModel(AI_CONFIG.assessmentModel),
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.3,
    });

    const content_text = response.choices[0]?.message?.content || '{}';

    try {
      return JSON.parse(content_text);
    } catch (error) {
      console.error('Error parsing OpenAI assessment response:', error);
      return this.getFallbackAssessment();
    }
  }

  private getOpenAIModel(model: AIModel): string {
    switch (model) {
      case 'gpt-4o-mini':
        return 'gpt-4o-mini'; // Cheapest option
      case 'gpt-4o':
        return 'gpt-4o'; // Best option
      case 'gpt-4-turbo':
        return 'gpt-4-turbo-preview';
      case 'gpt-3.5-turbo':
        return 'gpt-3.5-turbo';
      default:
        return 'gpt-4o-mini'; // Default to cheapest
    }
  }

  private buildPrompt(request: AIRequest): string {
    const { storyElements, context } = request;

    return `Continue this story with 2-3 sentences that are appropriate for a ${request.userAge}-year-old:

Genre: ${storyElements.genre || 'adventure'}
Setting: ${storyElements.setting || 'magical place'}
Character: ${storyElements.character || 'brave hero'}
Mood: ${storyElements.mood || 'exciting'}

Current story: ${context || ''}

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

  private getFallbackAssessment(): any {
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

class AnthropicClient implements AIClient {
  async generateResponse(request: AIRequest): Promise<string> {
    if (!anthropic) throw new Error('Anthropic client not initialized');

    const prompt = this.buildPrompt(request);

    const response = await anthropic.messages.create({
      model: this.getAnthropicModel(request.model),
      max_tokens: request.maxTokens || 150,
      temperature: request.temperature || 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return response.content[0]?.type === 'text'
      ? response.content[0].text
      : 'Please continue your story!';
  }

  async assessStory(content: string, userAge: number): Promise<any> {
    if (!anthropic) throw new Error('Anthropic client not initialized');

    const prompt = `Assess this story by a ${userAge}-year-old child:

"${content}"

Provide JSON with grammarScore, creativityScore, overallScore (0-100), feedback, suggestions array, and strengths array.`;

    const response = await anthropic.messages.create({
      model: this.getAnthropicModel(AI_CONFIG.assessmentModel),
      max_tokens: 500,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    const content_text =
      response.content[0]?.type === 'text' ? response.content[0].text : '{}';

    try {
      return JSON.parse(content_text);
    } catch (error) {
      console.error('Error parsing Anthropic assessment response:', error);
      return this.getFallbackAssessment();
    }
  }

  private getAnthropicModel(model: AIModel): string {
    switch (model) {
      case 'claude-3-opus':
        return 'claude-3-opus-20240229';
      case 'claude-3-sonnet':
        return 'claude-3-sonnet-20240229';
      case 'claude-3-haiku':
        return 'claude-3-haiku-20240307';
      default:
        return 'claude-3-haiku-20240307'; // Default to cheapest
    }
  }

  private buildPrompt(request: AIRequest): string {
    return `You are helping a ${request.userAge}-year-old child write a story. Continue their story with 2-3 encouraging sentences.

Story elements: ${JSON.stringify(request.storyElements)}
Current story: ${request.context || ''}
Child's latest writing: ${request.prompt}

Continue the story in a positive, age-appropriate way.`;
  }

  private getFallbackAssessment(): any {
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

class GoogleAIClient implements AIClient {
  async generateResponse(request: AIRequest): Promise<string> {
    try {
      // Dynamically import Google AI only when needed
      if (!googleAI) {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        googleAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
      }

      const model = googleAI.getGenerativeModel({
        model: this.getGoogleModel(request.model),
        generationConfig: {
          maxOutputTokens: request.maxTokens || 150,
          temperature: request.temperature || 0.7,
        },
      });

      const prompt = this.buildPrompt(request);
      const result = await model.generateContent(prompt);
      const response = await result.response;

      return response.text() || 'What happens next in your story?';
    } catch (error) {
      console.error('Google AI generation error:', error);
      throw error; // Don't fallback to other providers, let main handler decide
    }
  }

  async assessStory(content: string, userAge: number): Promise<any> {
    try {
      if (!googleAI) {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        googleAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
      }

      const model = googleAI.getGenerativeModel({
        model: 'gemini-pro',
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.3,
        },
      });

      const prompt = `Assess this story by a ${userAge}-year-old child:

"${content}"

Provide JSON with grammarScore, creativityScore, overallScore (0-100), feedback, suggestions array, and strengths array.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content_text = response.text() || '{}';

      try {
        return JSON.parse(content_text);
      } catch (parseError) {
        return this.getFallbackAssessment();
      }
    } catch (error) {
      console.error('Google AI assessment error:', error);
      return this.getFallbackAssessment();
    }
  }

  private getGoogleModel(model: AIModel): string {
    switch (model) {
      case 'gemini-pro':
        return 'gemini-pro';
      case 'gemini-1.5-pro':
        return 'gemini-1.5-pro-latest';
      default:
        return 'gemini-pro';
    }
  }

  private buildPrompt(request: AIRequest): string {
    const systemContext = this.getSystemPrompt(request.userAge);
    const storyContext = `
Story elements: ${JSON.stringify(request.storyElements)}
Current story: ${request.context || ''}
Child's latest writing: ${request.prompt}
`;

    return `${systemContext}

${storyContext}

Continue the story with 2-3 encouraging sentences that are appropriate for a ${request.userAge}-year-old child.`;
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

  private getFallbackAssessment(): any {
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

export class AIProviderManager {
  private clients: Map<AIProviderType, AIClient> = new Map();

  constructor() {
    // Only initialize enabled clients
    if (AI_CONFIG.enabledProviders.openai) {
      this.clients.set('openai', new OpenAIClient());
    }
    if (AI_CONFIG.enabledProviders.anthropic) {
      this.clients.set('anthropic', new AnthropicClient());
    }
    if (AI_CONFIG.enabledProviders.google) {
      this.clients.set('google', new GoogleAIClient());
    }
  }

  async generateStoryResponse(
    request?: Partial<AIRequest>
  ): Promise<AIResponse> {
    const startTime = Date.now();

    // Use primary provider by default
    const finalRequest: AIRequest = {
      provider: AI_CONFIG.primaryProvider,
      model: AI_CONFIG.primaryModel,
      prompt: request?.prompt || '',
      maxTokens: request?.maxTokens || 150,
      temperature: request?.temperature || 0.7,
      context: request?.context || '',
      userAge: request?.userAge || 8,
      storyElements: request?.storyElements || {},
    };

    try {
      const client = this.clients.get(finalRequest.provider);
      if (!client) {
        throw new Error(
          `Client not found for provider: ${finalRequest.provider}`
        );
      }

      // Generate response with retry logic
      const rawResponse = await retryWithBackoff(
        () => client.generateResponse(finalRequest),
        3,
        1000
      );

      const safeRawResponse = rawResponse || 'Tell me more about your story!';

      // Filter content for age appropriateness
      const filteredResponse = filterAIResponse(
        safeRawResponse,
        finalRequest.userAge
      );

      // Calculate cost and tokens (simplified - can be made more accurate)
      const tokensUsed = Math.ceil(
        (finalRequest.prompt.length + filteredResponse.length) / 4
      );
      const estimatedCost = this.calculateCost(
        finalRequest.provider,
        finalRequest.model,
        tokensUsed
      );

      const response: AIResponse = {
        content: filteredResponse,
        provider: finalRequest.provider,
        model: finalRequest.model,
        tokensUsed,
        cost: estimatedCost,
        responseTime: Date.now() - startTime,
        responseType: this.determineResponseType(),
        timestamp: new Date(),
      };

      // Log usage for cost tracking
      console.log(
        `AI Response - Provider: ${response.provider}, Model: ${response.model}, Cost: $${response.cost.toFixed(4)}, Tokens: ${response.tokensUsed}`
      );

      return response;
    } catch (error) {
      console.error('Primary AI provider failed:', error);

      // Try fallback only if it's different from primary
      if (
        AI_CONFIG.fallbackProvider !== AI_CONFIG.primaryProvider ||
        AI_CONFIG.fallbackModel !== AI_CONFIG.primaryModel
      ) {
        return this.generateWithFallback(finalRequest, startTime);
      }

      // Return static response if no fallback available
      return this.getStaticFallbackResponse(finalRequest, startTime);
    }
  }

  async assessStory(content: string, userAge: number): Promise<any> {
    try {
      const provider = AI_CONFIG.assessmentProvider;
      const client = this.clients.get(provider);

      if (!client) {
        console.error(`Assessment client not found for provider: ${provider}`);
        return this.getFallbackAssessment();
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
      return this.getFallbackAssessment();
    }
  }

  private async generateWithFallback(
    request: AIRequest,
    startTime: number
  ): Promise<AIResponse> {
    try {
      const fallbackRequest = {
        ...request,
        provider: AI_CONFIG.fallbackProvider,
        model: AI_CONFIG.fallbackModel,
      };

      const client = this.clients.get(fallbackRequest.provider);
      if (!client) {
        throw new Error(
          `Fallback client not found for provider: ${fallbackRequest.provider}`
        );
      }

      const response = await client.generateResponse(fallbackRequest);
      const safeResponse = response || 'Tell me more about your story!';
      const filteredResponse = filterAIResponse(safeResponse, request.userAge);

      const tokensUsed = Math.ceil(
        (request.prompt.length + filteredResponse.length) / 4
      );
      const cost = this.calculateCost(
        fallbackRequest.provider,
        fallbackRequest.model,
        tokensUsed
      );

      console.log(
        `AI Fallback Used - Provider: ${fallbackRequest.provider}, Model: ${fallbackRequest.model}`
      );

      return {
        content: filteredResponse,
        provider: fallbackRequest.provider,
        model: fallbackRequest.model,
        tokensUsed,
        cost,
        responseTime: Date.now() - startTime,
        responseType: this.determineResponseType(),
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Fallback provider also failed:', error);
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

    console.log('Using static fallback response - all AI providers failed');

    return {
      content: response || 'Default response content',
      provider: 'openai' as AIProviderType,
      model: 'gpt-4o-mini' as AIModel,
      tokensUsed: 0,
      cost: 0,
      responseTime: Date.now() - startTime,
      responseType: 'continue',
      timestamp: new Date(),
    };
  }

  private calculateCost(
    provider: AIProviderType,
    model: AIModel,
    tokens: number
  ): number {
    // Approximate costs per 1K tokens (input + output combined estimate)
    const costPerK = {
      openai: {
        'gpt-4o-mini': 0.0002, // Very cheap!
        'gpt-4o': 0.005, // Mid-range
        'gpt-4-turbo': 0.01, // Expensive
        'gpt-3.5-turbo': 0.0015, // Cheap fallback
      },
      anthropic: {
        'claude-3-haiku': 0.0005, // Cheapest Claude
        'claude-3-sonnet': 0.003, // Mid Claude
        'claude-3-opus': 0.015, // Most expensive
      },
      google: {
        'gemini-pro': 0.001, // Google pricing
        'gemini-1.5-pro': 0.002, // Premium Google
      },
    };

    const providerCosts = costPerK[provider] as any;
    const modelCost = providerCosts?.[model] || 0.001;

    return (tokens / 1000) * modelCost;
  }

  private determineResponseType():
    | 'continue'
    | 'plot_twist'
    | 'new_character'
    | 'challenge' {
    const types: ('continue' | 'plot_twist' | 'new_character' | 'challenge')[] =
      ['continue', 'plot_twist', 'new_character', 'challenge'];
    const weights: number[] = [30, 25, 25, 20];

    const random = Math.random() * 100;
    let cumulative = 0;

    for (let i = 0; i < types.length; i++) {
      const weight = weights[i];
      const type = types[i];

      if (weight !== undefined && type !== undefined) {
        cumulative += weight;
        if (random <= cumulative) {
          return type;
        }
      }
    }

    return 'continue';
  }

  private getFallbackAssessment(): any {
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

  // Utility method to change providers easily
  static updateProviderConfig(config: Partial<typeof AI_CONFIG>): void {
    Object.assign(AI_CONFIG, config);
    console.log('AI Provider configuration updated:', AI_CONFIG);
  }
}

export const aiProviderManager = new AIProviderManager();

// Export config for easy updates
export { AI_CONFIG };
