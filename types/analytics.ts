// types/analytics.ts
import type { StoryStatus } from './story';
import type { SubscriptionTierType } from './subscription';

export type ChartType = 'line' | 'area' | 'bar' | 'pie';
export type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y';
export type AnalyticsType = 'daily' | 'weekly' | 'monthly';

export interface AnalyticsData {
  date: string;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface ChartProps {
  title: string;
  data: AnalyticsData[];
  chartType?: ChartType;
  timeRange?: TimeRange;
  height?: number;
  loading?: boolean;
  error?: string;
}

// Core analytics interface that matches the model exactly
export interface Analytics {
  _id: string;
  date: Date;
  type: AnalyticsType;

  // Platform metrics - matches model structure exactly
  metrics: {
    // User metrics
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    childUsers: number;
    mentorUsers: number;

    // Story metrics
    totalStories: number;
    newStories: number;
    completedStories: number;
    publishedStories: number;
    totalWords: number;
    averageWordsPerStory: number;

    // Assessment metrics
    totalAssessments: number;
    averageGrammarScore: number;
    averageCreativityScore: number;
    averageOverallScore: number;

    // Comment metrics
    totalComments: number;
    newComments: number;
    resolvedComments: number;

    // Subscription metrics
    totalSubscriptions: number;
    newSubscriptions: number;
    canceledSubscriptions: number;
    revenue: number;

    // Engagement metrics
    sessionDuration: number;
    storiesPerUser: number;
    commentsPerStory: number;

    // AI metrics
    aiRequests: number;
    aiCost: number;
    averageResponseTime: number;
  };

  // Breakdown by subscription tier - matches model structure
  tierBreakdown: Record<SubscriptionTierType, number>;

  // Breakdown by age group - matches model structure
  ageBreakdown: {
    toddler: number;
    preschool: number;
    early_elementary: number;
    late_elementary: number;
    middle_school: number;
    high_school: number;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface AIUsageAnalytics {
  totalRequests: number;
  totalTokensUsed: number;
  totalCost: number;
  averageResponseTime: number;
  totalStories: number;
  previousRequests?: number;
  previousTokensUsed?: number;
  previousCost?: number;
  previousResponseTime?: number;
  providerBreakdown: Array<{
    provider: string;
    requests: number;
    cost: number;
    responseTime: number;
  }>;
  dailyUsage: Array<{
    date: string;
    requests: number;
    cost: number;
  }>;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  previousRevenue?: number;
  subscriptionRevenue: number;
  activeSubscribers: number;
  previousActiveSubscribers?: number;
  canceledSubscriptions: number;
  totalSubscriptions: number;
  customerLifetimeValue?: number;
  conversionRate?: number;
  revenueGrowthRate?: number;
  revenueData: Array<{
    date: string;
    value: number;
    label?: string;
  }>;
  subscriptionBreakdown?: Record<
    SubscriptionTierType,
    {
      revenue: number;
      subscribers: number;
      percentage: number;
    }
  >;
  forecastData?: Array<{
    date: string;
    value: number;
  }>;
  forecastedMRR?: number;
  forecastedSubscribers?: number;
  confidenceLevel?: number;
  previousMRR?: number;
  previousARPU?: number;
}

export interface StoryAnalytics {
  totalStories: number;
  previousTotalStories?: number;
  storiesCreated: number;
  previousStoriesCreated?: number;
  totalViews: number;
  previousTotalViews?: number;
  totalLikes: number;
  totalComments: number;
  engagementRate: number;
  previousEngagementRate?: number;

  // Enhanced with model data
  completedStories: number;
  publishedStories: number;
  totalWords: number;
  averageWordsPerStory: number;

  statusDistribution?: Array<{
    status: StoryStatus;
    count: number;
    percentage: number;
  }>;
  genreDistribution?: Array<{
    genre: string;
    count: number;
    percentage: number;
  }>;
  characterDistribution?: Array<{
    character: string;
    count: number;
    percentage: number;
  }>;
  settingDistribution?: Array<{
    setting: string;
    count: number;
    percentage: number;
  }>;
  ratingDistribution?: Array<{
    score: number;
    count: number;
  }>;
  topStories?: Array<{
    id: string;
    title: string;
    authorName: string;
    views: number;
    likes: number;
    comments: number;
    rating?: number;
    createdAt: Date;
  }>;
  creationData: Array<{
    date: string;
    value: number;
  }>;
}

export interface UserAnalytics {
  totalUsers: number;
  previousPeriodUsers?: number;
  newUsers: number;
  previousNewUsers?: number;
  activeUsers: number;
  previousActiveUsers?: number;

  // Enhanced with model data
  childUsers: number;
  mentorUsers: number;
  retentionRate?: number;
  previousRetentionRate?: number;

  ageDistribution?: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  roleDistribution?: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
  peakHours?: Array<{
    hour: number;
    percentage: number;
  }>;
  activeDays?: Array<{
    day: string;
    percentage: number;
  }>;
  averageSessionDuration?: number;
  averageActionsPerSession?: number;
  recentActivity?: Array<{
    userName: string;
    action: string;
    timestamp: Date;
    userRole: string;
  }>;
  growthData: Array<{
    date: string;
    value: number;
  }>;
}

// Additional interfaces for analytics operations
export interface AnalyticsPeriod {
  startDate: Date;
  endDate: Date;
  type: AnalyticsType;
}

export interface AnalyticsComparison {
  current: Analytics;
  previous?: Analytics;
  percentageChange: Record<string, number>;
  trend: 'up' | 'down' | 'stable';
}

export interface AnalyticsSummary {
  period: AnalyticsPeriod;
  userMetrics: {
    total: number;
    new: number;
    active: number;
    growth: number;
  };
  storyMetrics: {
    total: number;
    new: number;
    completed: number;
    published: number;
    avgWords: number;
  };
  revenueMetrics: {
    total: number;
    subscriptions: number;
    growth: number;
  };
  engagementMetrics: {
    storiesPerUser: number;
    commentsPerStory: number;
    sessionDuration: number;
  };
}

export interface DashboardMetrics {
  overview: {
    totalUsers: number;
    totalStories: number;
    totalRevenue: number;
    activeUsers: number;
    userGrowth: number;
    storyGrowth: number;
    revenueGrowth: number;
    activeUserGrowth: number;
  };

  charts: {
    userGrowth: AnalyticsData[];
    storyCreation: AnalyticsData[];
    revenue: AnalyticsData[];
    engagement: AnalyticsData[];
  };

  breakdown: {
    tierDistribution: Record<SubscriptionTierType, number>;
    ageDistribution: Record<string, number>;
    statusDistribution: Record<StoryStatus, number>;
  };

  lastUpdated: Date;
}

// For creating analytics records
export interface AnalyticsCreateData {
  date: Date;
  type: AnalyticsType;
  metrics: Partial<Analytics['metrics']>;
  tierBreakdown?: Partial<Record<SubscriptionTierType, number>>;
  ageBreakdown?: Partial<Analytics['ageBreakdown']>;
}

// For filtering analytics queries
export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  type?: AnalyticsType;
  groupBy?: 'day' | 'week' | 'month';
  metrics?: string[];
}
