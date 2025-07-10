// lib/ai/cost-optimizer.ts - AI cost optimization strategies
import { aiProviderManager } from './providers';
import AIProvider from '@models/AIProvider';
import { connectDB } from '@lib/database/connection';

// Define types locally since import is failing
export type AIProvider = 'openai' | 'anthropic' | 'google';
export type AIModel =
  | 'gpt-4o-mini'
  | 'gpt-4o'
  | 'gpt-4-turbo'
  | 'gpt-3.5-turbo'
  | 'claude-3-opus'
  | 'claude-3-sonnet'
  | 'claude-3-haiku'
  | 'gemini-pro'
  | 'gemini-1.5-pro';

export interface AIRequest {
  provider: AIProvider;
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
  provider: AIProvider;
  model: AIModel;
  tokensUsed: number;
  cost: number;
  responseTime: number;
  responseType: 'continue' | 'plot_twist' | 'new_character' | 'challenge';
  timestamp: Date;
}

// Define AIProviderDocument interface for better type safety
interface AIProviderDocument {
  provider: string;
  model: string;
  isActive: boolean;
  costPerToken: number;
  performance: {
    averageResponseTime: number;
  };
}

interface StoryPlan {
  opening: string;
  prompts: string[];
  assessmentCriteria: string;
  estimatedTurns: number;
}

interface CostEstimate {
  singleCallCost: number;
  multiCallCost: number;
  savings: number;
  savingsPercentage: number;
}

export class AICostOptimizer {
  /**
   * Generate complete story plan in single API call
   * This is the main cost optimization strategy
   */
  async generateStoryPlan(
    elements: Record<string, string>,
    userAge: number
  ): Promise<StoryPlan> {
    try {
      await connectDB();

      const request: AIRequest = {
        provider: 'openai',
        model: 'gpt-4o',
        prompt: this.buildStoryPlanPrompt(elements, userAge),
        maxTokens: 800,
        temperature: 0.7,
        userAge,
        storyElements: elements,
      };

      const response = await aiProviderManager.generateStoryResponse(request);

      // Parse the response to extract story plan
      const plan = this.parseStoryPlan(response.content, userAge);

      console.log(
        `Story plan generated for ${plan.estimatedTurns} turns, cost: $${response.cost.toFixed(4)}`
      );

      return plan;
    } catch (error) {
      console.error('Error generating story plan:', error);

      // Return fallback plan
      return this.getFallbackStoryPlan(elements, userAge);
    }
  }

  /**
   * Calculate cost savings between single call vs multiple calls
   */
  calculateCostSavings(turns: number = 6): CostEstimate {
    // Average cost per API call (in dollars)
    const avgCostPerCall = 0.02;

    // Single call cost (larger prompt, more tokens)
    const singleCallCost = avgCostPerCall * 1.5; // 50% more tokens for comprehensive plan

    // Multiple call cost (6-7 calls during collaboration)
    const multiCallCost = avgCostPerCall * turns;

    const savings = multiCallCost - singleCallCost;
    const savingsPercentage = (savings / multiCallCost) * 100;

    return {
      singleCallCost,
      multiCallCost,
      savings,
      savingsPercentage,
    };
  }

  /**
   * Get pre-generated response for user input
   */
  getPreGeneratedResponse(storyPlan: StoryPlan, turnNumber: number): string {
    const promptIndex = Math.min(turnNumber - 1, storyPlan.prompts.length - 1);
    return storyPlan.prompts[promptIndex] || this.getGenericPrompt();
  }

  /**
   * Check if we should use cached response or generate new one
   */
  shouldUseCachedResponse(userInput: string, expectedInput: string): boolean {
    // Simple similarity check - could be enhanced with more sophisticated matching
    const similarity = this.calculateSimilarity(userInput, expectedInput);
    return similarity > 0.6; // 60% similarity threshold
  }

  /**
   * Optimize provider selection based on cost and performance
   */
  async optimizeProviderSelection(
    requestType: 'generation' | 'assessment'
  ): Promise<string> {
    try {
      await connectDB();

      // Fix: Use proper typing and method chaining
      const providers = await (AIProvider as any)
        .find({
          isActive: true,
        })
        .sort({
          costPerToken: 1, // Cheapest first
          'performance.averageResponseTime': 1, // Fastest first
        })
        .lean()
        .exec();

      // Cast to proper type after querying
      const typedProviders = providers as AIProviderDocument[];

      if (requestType === 'generation') {
        // For generation, prioritize speed and cost
        const nanoProvider = typedProviders.find(
          (p: AIProviderDocument) =>
            p.provider === 'openai' && p.model.includes('nano')
        );
        const haikuProvider = typedProviders.find(
          (p: AIProviderDocument) =>
            p.provider === 'anthropic' && p.model.includes('haiku')
        );

        return (
          nanoProvider?.provider ||
          haikuProvider?.provider ||
          typedProviders[0]?.provider ||
          'openai'
        );
      } else {
        // For assessment, prioritize quality
        const opusProvider = typedProviders.find(
          (p: AIProviderDocument) =>
            p.provider === 'anthropic' && p.model.includes('opus')
        );
        const gpt4Provider = typedProviders.find(
          (p: AIProviderDocument) =>
            p.provider === 'openai' && p.model.includes('gpt-4')
        );

        return (
          opusProvider?.provider ||
          gpt4Provider?.provider ||
          typedProviders[0]?.provider ||
          'openai'
        );
      }
    } catch (error) {
      console.error('Error optimizing provider selection:', error);
      return 'openai'; // Default fallback
    }
  }

  /**
   * Track and analyze cost patterns
   */
  async trackCostMetrics(
    userId: string,
    cost: number,
    requestType: string
  ): Promise<void> {
    try {
      // Could store in Analytics model or separate cost tracking
      const Analytics = (await import('@models/Analytics')).default;

      // Update daily AI cost metrics
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fix: Use proper method call with type assertion
      await (Analytics as any)
        .findOneAndUpdate(
          { date: today, type: 'daily' },
          {
            $inc: {
              'metrics.aiRequests': 1,
              'metrics.aiCost': cost,
            },
          },
          { upsert: true }
        )
        .exec();
    } catch (error) {
      console.error('Error tracking cost metrics:', error);
    }
  }

  private buildStoryPlanPrompt(
    elements: Record<string, string>,
    userAge: number
  ): string {
    // Fix: Add null checks and default values
    const genre = elements.genre || 'adventure';
    const setting = elements.setting || 'magical forest';
    const character = elements.character || 'brave hero';
    const mood = elements.mood || 'exciting';
    const conflict = elements.conflict || 'mysterious challenge';
    const theme = elements.theme || 'friendship';

    return `Create a complete story collaboration plan for a ${userAge}-year-old child:

Story Elements:
- Genre: ${genre}
- Setting: ${setting}
- Character: ${character}
- Mood: ${mood}
- Conflict: ${conflict}
- Theme: ${theme}

Generate:
1. Opening (2-3 sentences to start the story)
2. Six prompts for different turns that will guide the child's writing
3. Assessment criteria specific to this age group

Format as JSON:
{
  "opening": "story opening text",
  "prompts": [
    "prompt for turn 1",
    "prompt for turn 2", 
    "prompt for turn 3",
    "prompt for turn 4",
    "prompt for turn 5",
    "prompt for turn 6"
  ],
  "assessmentCriteria": "what to focus on when assessing",
  "estimatedTurns": 6
}

Make it engaging and age-appropriate for a ${userAge}-year-old.`;
  }

  private parseStoryPlan(response: string, userAge: number): StoryPlan {
    try {
      // Try to parse JSON response
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanResponse);

      return {
        opening: parsed.opening || this.getDefaultOpening(userAge),
        prompts: parsed.prompts || this.getDefaultPrompts(userAge),
        assessmentCriteria:
          parsed.assessmentCriteria ||
          this.getDefaultAssessmentCriteria(userAge),
        estimatedTurns: parsed.estimatedTurns || 6,
      };
    } catch (error) {
      console.error('Error parsing story plan:', error);
      return this.getFallbackStoryPlan({}, userAge);
    }
  }

  private getFallbackStoryPlan(
    elements: Record<string, string>,
    userAge: number
  ): StoryPlan {
    return {
      opening: this.getDefaultOpening(userAge),
      prompts: this.getDefaultPrompts(userAge),
      assessmentCriteria: this.getDefaultAssessmentCriteria(userAge),
      estimatedTurns: 6,
    };
  }

  private getDefaultOpening(userAge: number): string {
    if (userAge <= 6) {
      return 'Once upon a time, there was a brave little character who went on a wonderful adventure. They were very excited to explore new places and meet new friends.';
    } else if (userAge <= 12) {
      return 'The adventure began on a bright morning when our hero discovered something extraordinary that would change everything. Little did they know, this was just the beginning of an amazing journey.';
    } else {
      return 'In a world where anything was possible, a young protagonist stood at the threshold of an incredible adventure. The choices they made next would determine the fate of their quest.';
    }
  }

  private getDefaultPrompts(userAge: number): string[] {
    if (userAge <= 6) {
      return [
        'What does your character see first on their adventure?',
        'Who is the first friend your character meets?',
        'What fun activity do they do together?',
        'What small problem do they need to solve?',
        'How do they help each other?',
        'How does your story end happily?',
      ];
    } else if (userAge <= 12) {
      return [
        'Describe what your character discovers and how they react.',
        'What challenge or obstacle appears in their path?',
        'How does your character show courage or creativity?',
        'What unexpected help or surprise do they encounter?',
        'How do they use teamwork or clever thinking to succeed?',
        'What important lesson do they learn from their adventure?',
      ];
    } else {
      return [
        "Develop your character's motivation and initial conflict.",
        "Introduce a complication that tests your character's resolve.",
        'Show how your character adapts and grows from challenges.',
        'Create a moment of tension or important decision.',
        "Demonstrate your character's growth through their actions.",
        "Conclude with a resolution that reflects your character's journey.",
      ];
    }
  }

  private getDefaultAssessmentCriteria(userAge: number): string {
    if (userAge <= 6) {
      return 'Focus on creativity, basic sentence structure, and positive storytelling.';
    } else if (userAge <= 12) {
      return 'Evaluate story structure, character development, descriptive language, and problem-solving elements.';
    } else {
      return 'Assess plot complexity, character depth, thematic development, and sophisticated writing techniques.';
    }
  }

  private getGenericPrompt(): string {
    const prompts = [
      'What happens next in your story?',
      'How does your character feel about this situation?',
      'What does your character decide to do?',
      'What surprise or challenge appears?',
      'How does your character solve this problem?',
    ];

    return (
      prompts[Math.floor(Math.random() * prompts.length)] || 'Default prompt'
    );
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple word-based similarity calculation
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);

    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;

    return commonWords.length / totalWords;
  }
}

// Export singleton instance
export const aiCostOptimizer = new AICostOptimizer();
