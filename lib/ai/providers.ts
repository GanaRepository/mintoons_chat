// lib/ai/providers.ts                         last fix: 16 Jul 2025
// ──────────────────────────────────────────────────────────────
// • Exactly ONE provider key in env at any time.
// • Cheapest three text‑generation models per vendor only.
// • Swap env key + restart to change providers.
// ──────────────────────────────────────────────────────────────

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { retryWithBackoff } from '@utils/helpers';
import { filterAIResponse } from '@utils/age-restrictions';

/*───────────────── 1. Detect keys ─────────────────*/
const HAS = {
  openai: !!process.env.OPENAI_API_KEY,
  anthropic: !!process.env.ANTHROPIC_API_KEY,
  google: !!process.env.GOOGLE_AI_API_KEY,
} as const;

type Provider = keyof typeof HAS; // 'openai' | 'anthropic' | 'google'

const primaryProvider: Provider =
  HAS.openai ? 'openai'
    : HAS.anthropic ? 'anthropic'
      : 'google';

const primaryModel =
  primaryProvider === 'openai'
    ? 'gpt-4.1-mini'
    : primaryProvider === 'anthropic'
      ? 'claude-3-haiku-20240307'
      : 'gemini-2.0-flash-lite';

/*───────────────── 2. Types ───────────────────────*/
export type AIProviderType = Provider;

export type AIModel =
  // OpenAI
  | 'gpt-4o-mini'
  | 'gpt-4.1-nano'
  | 'gpt-4.1-mini'
  // Gemini
  | 'gemini-2.5-flash-lite-preview-06-17'
  | 'gemini-2.0-flash-lite'
  | 'gemini-1.5-flash'
  // Claude
  | 'claude-3-haiku-20240307'
  | 'claude-3-5-haiku-20241022';

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

/*───────────────── 3. Config ──────────────────────*/
export const AI_CONFIG = {
  primaryProvider: primaryProvider as AIProviderType,
  primaryModel: primaryModel as AIModel,
  fallbackProvider: primaryProvider as AIProviderType,
  fallbackModel: primaryModel as AIModel,
  assessmentProvider: primaryProvider as AIProviderType,
  assessmentModel: primaryModel as AIModel,
  enabledProviders: HAS,
} as const;

/*───────────────── 4. SDK singletons ──────────────*/
const openai =
  HAS.openai ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY! }) : null;
const anthropic =
  HAS.anthropic ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }) : null;
let googleAI: any = null; // lazy load later

/*───────────────── 5. Internal interface ──────────*/
interface AIClient {
  generateResponse(req: AIRequest): Promise<string>;
  assessStory(text: string, age: number): Promise<any>;
}

/*───────────────── 6‑A. OpenAI client ─────────────*/
class OpenAIClient implements AIClient {
  async generateResponse(r: AIRequest) {
    if (!openai) throw new Error('OpenAI not configured');
    const res = await openai.chat.completions.create({
      model: r.model,
      messages: [
        { role: 'system', content: this.sys(r.userAge) },
        { role: 'user', content: this.buildPrompt(r) },
      ],
      max_tokens: r.maxTokens ?? 150,
      temperature: r.temperature ?? 0.7,
    });
    return res.choices[0]?.message?.content ?? 'Tell me more about your story!';
  }
  async assessStory(text: string) {
    if (!openai) throw new Error('OpenAI not configured');
    const res = await openai.chat.completions.create({
      model: AI_CONFIG.assessmentModel,
      messages: [
        {
          role: 'user',
          content:
            'Assess this story and return JSON {grammarScore,creativityScore,overallScore}',
        },
        { role: 'assistant', content: text },
      ],
      max_tokens: 200,
      temperature: 0.3,
    });
    try {
      return JSON.parse(res.choices[0]?.message?.content ?? '{}');
    } catch {
      return { grammarScore: 70, creativityScore: 75, overallScore: 73 };
    }
  }
  private sys(age: number) {
    if (age <= 6)
      return 'You are a gentle storytelling assistant for very young children.';
    if (age <= 12)
      return 'You are a creative writing assistant for children.';
    return 'You are a writing mentor for teenagers.';
  }
  private buildPrompt(r: AIRequest) {
    const e = r.storyElements;
    return `Continue this story with 2‑3 sentences appropriate for a ${r.userAge}-year‑old:

Genre: ${e.genre ?? 'adventure'}
Setting: ${e.setting ?? 'a magical land'}
Character: ${e.character ?? 'a brave hero'}
Mood: ${e.mood ?? 'exciting'}

Current story: ${r.context ?? ''}
Child's latest addition: ${r.prompt}

Continue the story.`;
  }
}

/*───────────────── 6‑B. Claude client ─────────────*/
class AnthropicClient implements AIClient {
  async generateResponse(r: AIRequest) {
    if (!anthropic) throw new Error('Anthropic not configured');
    const res = await anthropic.messages.create({
      model: r.model,
      max_tokens: r.maxTokens ?? 150,
      temperature: r.temperature ?? 0.7,
      messages: [{ role: 'user', content: r.prompt }],
    });
    const part = res.content[0];
    return part?.type === 'text' ? part.text : 'Continue your story!';
  }
  async assessStory() {
    if (!anthropic) throw new Error('Anthropic not configured');
    return { grammarScore: 75, creativityScore: 80, overallScore: 78 };
  }
}

/*───────────────── 6‑C. Gemini client ─────────────*/
class GoogleAIClient implements AIClient {
  private async ensure() {
    if (!googleAI) {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      googleAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY ?? '');
    }
  }
  async generateResponse(r: AIRequest) {
    await this.ensure();
    const model = googleAI.getGenerativeModel({
      model: r.model,
      generationConfig: {
        maxOutputTokens: r.maxTokens ?? 150,
        temperature: r.temperature ?? 0.7,
      },
    });
    const res = await model.generateContent(r.prompt);
    return (await res.response.text()) || 'What happens next?';
  }
  async assessStory() {
    await this.ensure();
    return { grammarScore: 74, creativityScore: 79, overallScore: 77 };
  }
}

/*───────────────── 7. Provider manager ────────────*/
export class AIProviderManager {
  private clients = new Map<AIProviderType, AIClient>();
  constructor() {
    if (HAS.openai) this.clients.set('openai', new OpenAIClient());
    if (HAS.anthropic) this.clients.set('anthropic', new AnthropicClient());
    if (HAS.google) this.clients.set('google', new GoogleAIClient());
  }
  private c(p: AIProviderType) {
    const cl = this.clients.get(p);
    if (!cl) throw new Error(`${p} provider not initialised`);
    return cl;
  }

  async generateStoryResponse(partial: Partial<AIRequest>): Promise<AIResponse> {
    const start = Date.now();
    const req: AIRequest = {
      provider: AI_CONFIG.primaryProvider,
      model: AI_CONFIG.primaryModel,
      prompt: partial.prompt ?? '',
      maxTokens: partial.maxTokens ?? 150,
      temperature: partial.temperature ?? 0.7,
      context: partial.context ?? '',
      userAge: partial.userAge ?? 8,
      storyElements: partial.storyElements ?? {},
    };

    try {
      const raw = await retryWithBackoff(
        () => this.c(req.provider).generateResponse(req),
        3,
        1_000,
      );
      const filtered = filterAIResponse(raw || 'Tell me more!', req.userAge);
      const tokens = Math.ceil((req.prompt.length + filtered.length) / 4);
      const cost = this.cost(req.provider, req.model, tokens);

      return {
        content: filtered,
        provider: req.provider,
        model: req.model,
        tokensUsed: tokens,
        cost,
        responseTime: Date.now() - start,
        responseType: this.pickType(),
        timestamp: new Date(),
      };
    } catch (e) {
      console.error('Primary provider failed', e);
      return this.staticFallback(start);
    }
  }

  async assessStory(text: string, age: number) {
    try {
      return await this.c(AI_CONFIG.assessmentProvider).assessStory(text, age);
    } catch {
      return { grammarScore: 70, creativityScore: 75, overallScore: 73 };
    }
  }

  /*──────── helpers ────────*/
  private staticFallback(start: number): AIResponse {
    return {
      content: 'Great start! What happens next?',
      provider: AI_CONFIG.primaryProvider,
      model: AI_CONFIG.primaryModel,
      tokensUsed: 0,
      cost: 0,
      responseTime: Date.now() - start,
      responseType: 'continue',
      timestamp: new Date(),
    };
  }
  private pickType(): 'continue' | 'plot_twist' | 'new_character' | 'challenge' {
    const r = Math.random() * 100;
    return r < 40
      ? 'continue'
      : r < 65
        ? 'plot_twist'
        : r < 85
          ? 'new_character'
          : 'challenge';
  }
  private cost(p: AIProviderType, m: AIModel, tok: number) {
    // NOTE: Partial<…> lets each provider list only its own SKUs
    const USD_PER_K: Record<
      AIProviderType,
      Partial<Record<AIModel, number>>
    > = {
      openai: {
        'gpt-4.1-nano': 0.0005,
        'gpt-4.1-mini': 0.002,
        'gpt-4o-mini': 0.00075,
      },
      anthropic: {
        'claude-3-haiku-20240307': 0.0015,
        'claude-3-5-haiku-20241022': 0.0048,
      },
      google: {
        'gemini-2.5-flash-lite-preview-06-17': 0.0005,
        'gemini-2.0-flash-lite': 0.0005,
        'gemini-1.5-flash': 0.000375,
      },
    };
    const rate = USD_PER_K[p][m] ?? 0.001;
    return (tok / 1_000) * rate;
  }

  static updateProviderConfig(patch: Partial<typeof AI_CONFIG>) {
    Object.assign(AI_CONFIG, patch);
    console.info('AI_CONFIG updated →', AI_CONFIG);
  }
}

/*──────────────── singleton ───────────────*/
export const aiProviderManager = new AIProviderManager();
