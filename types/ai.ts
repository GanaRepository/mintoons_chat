// types/ai.ts - AI-related types
export type AIProvider = 'openai' | 'anthropic' | 'google';

// Updated to match the actual low-cost models, but model has different enum
// Note: The model enum needs to be updated to match these actual model names
export type AIModel =
  | 'gpt-4o-mini' // OpenAI budget flagship
  | 'gpt-4o-nano' // OpenAI budget flagship
  | 'claude-3-haiku' // Anthropic budget option
  | 'gemini-1.5-flash' // Google budget option
  | 'o1-mini' // OpenAI reasoning budget
  | 'o3-mini'; // OpenAI alternative budget

// Main AI Provider interface that matches the model exactly
export interface AIProviderConfig {
  _id: string;
  provider: AIProvider;
  modelName: AIModel; // Field name matches model
  apiKey?: string; // Optional in interface since it's select: false
  maxTokens: number;
  temperature: number;
  isActive: boolean;
  costPerToken: number;
  priority: number;

  // Usage tracking - matches model structure exactly
  usage: {
    requestsToday: number;
    tokensUsed: number;
    costToday: number;
    lastUsed?: Date;
  };

  // Rate limits - matches model structure exactly
  rateLimits: {
    requestsPerMinute: number;
    requestsPerDay: number;
    tokensPerDay: number;
  };

  // Performance metrics - matches model structure exactly
  performance: {
    averageResponseTime: number;
    successRate: number;
    errorCount: number;
    lastError?: {
      message: string;
      timestamp: Date;
    };
  };

  // Virtual field from model
  isAvailable: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Simplified interface for basic AI configuration
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
  _id: string;
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

// Enhanced interfaces for specific model operations
export interface AIProviderCreateData {
  provider: AIProvider;
  modelName: AIModel;
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
  costPerToken: number;
  priority?: number;
  rateLimits?: {
    requestsPerMinute?: number;
    requestsPerDay?: number;
    tokensPerDay?: number;
  };
}

export interface AIProviderUpdateData {
  apiKey?: string;
  maxTokens?: number;
  temperature?: number;
  isActive?: boolean;
  costPerToken?: number;
  priority?: number;
  rateLimits?: Partial<AIProviderConfig['rateLimits']>;
}

export interface AIUsageStats {
  providerId: string;
  provider: AIProvider;
  modelName: AIModel;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number;
  successRate: number;
  dailyUsage: Array<{
    date: string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

export interface AIProviderHealth {
  providerId: string;
  provider: AIProvider;
  isHealthy: boolean;
  issues: string[];
  lastHealthCheck: Date;
  uptime: number;
  responseTimeP95: number;
}

export interface AIFallbackStrategy {
  primaryProvider: AIProvider;
  fallbackProviders: AIProvider[];
  fallbackTriggers: {
    errorRate: number;
    responseTime: number;
    rateLimitReached: boolean;
  };
  autoFailback: boolean;
}

// For provider selection logic
export interface AIProviderSelection {
  selected: AIProviderConfig;
  reason: 'priority' | 'performance' | 'cost' | 'availability';
  alternatives: AIProviderConfig[];
}

// Document interfaces for MongoDB models (remove the redundant ones)
export interface AIProviderDocument extends AIProviderConfig {
  updateUsage(tokens: number, cost: number): Promise<void>;
  resetDailyUsage(): Promise<void>;
}

// Analytics document interface (if needed elsewhere)
export interface AnalyticsDocument {
  _id?: string;
  date: Date;
  type: string;
  metrics: {
    aiRequests: number;
    aiCost: number;
    averageResponseTime: number;
    [key: string]: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
