export type AIProvider = 'openai' | 'anthropic' | 'google';

export type AIModel =
  | 'gpt-4o-mini'
  | 'gpt-4o-nano'
  | 'claude-3-haiku'
  | 'gemini-1.5-flash'
  | 'o1-mini'
  | 'o3-mini';

export interface AIProviderConfig {
  _id: string;
  provider: AIProvider;
  modelName: AIModel;
  apiKey?: string;
  maxTokens: number;
  temperature: number;
  isActive: boolean;
  costPerToken: number;
  priority: number;

  usage: {
    requestsToday: number;
    tokensUsed: number;
    costToday: number;
    lastUsed?: Date;
  };

  rateLimits: {
    requestsPerMinute: number;
    requestsPerDay: number;
    tokensPerDay: number;
  };

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

  createdAt: Date;
  updatedAt: Date;
}

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

export interface AIProviderSelection {
  selected: AIProviderConfig;
  reason: 'priority' | 'performance' | 'cost' | 'availability';
  alternatives: AIProviderConfig[];
}