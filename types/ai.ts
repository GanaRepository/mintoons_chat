// types/ai.ts - AI-related types
export type AIProvider = 'openai' | 'anthropic' | 'google';
export type AIModel =
  | 'gpt-4'
  | 'gpt-4-turbo'
  | 'claude-3-opus'
  | 'claude-3-sonnet'
  | 'gemini-pro';

export interface AIConfiguration {
  provider: AIProvider;
  model: AIModel;
  apiKey: string;
  maxTokens: number;
  temperature: number;
  isActive: boolean;
  costPerToken: number;
  priority: number;
}

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

export interface AICollaborationRequest {
  storyId: string;
  userInput: string;
  currentContent: string;
  storyElements: Record<string, string>;
  turnNumber: number;
  userAge: number;
}

export interface AIAssessmentRequest {
  storyContent: string;
  userAge: number;
  storyElements: Record<string, string>;
  wordCount: number;
}

export interface AIPromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  ageGroups: number[];
  provider?: AIProvider;
  isActive: boolean;
}

export interface AICostTracking {
  userId: string;
  provider: AIProvider;
  model: AIModel;
  tokensUsed: number;
  cost: number;
  requestType: 'collaboration' | 'assessment' | 'generation';
  timestamp: Date;
}

export interface AIProviderStatus {
  provider: AIProvider;
  isAvailable: boolean;
  responseTime: number;
  errorRate: number;
  lastChecked: Date;
  errors: string[];
}

export interface AIOptimization {
  singleCallOptimization: boolean;
  cacheResponses: boolean;
  fallbackProviders: AIProvider[];
  costThreshold: number;
  ageBasedModels: Record<string, AIModel>;
}

export interface AIContent {
  prompt: string;
  response: string;
  isFiltered: boolean;
  filterReasons: string[];
  safetyScore: number;
  ageAppropriate: boolean;
}

export interface AIAnalytics {
  totalRequests: number;
  totalCost: number;
  averageResponseTime: number;
  errorRate: number;
  providerDistribution: Record<AIProvider, number>;
  costByProvider: Record<AIProvider, number>;
  requestsByType: Record<string, number>;
}

// Document interfaces for MongoDB models
export interface AIProviderDocument {
  _id?: string;
  provider: string;
  model: string;
  isActive: boolean;
  costPerToken: number;
  performance: {
    averageResponseTime: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AnalyticsDocument {
  _id?: string;
  date: Date;
  type: string;
  metrics: {
    aiRequests: number;
    aiCost: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
