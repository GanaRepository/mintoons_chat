// types/analytics.ts
import type { StoryStatus } from './story';

export interface AnalyticsData {
  date: string;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
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

export interface ChartProps {
  title: string;
  data: AnalyticsData[];
  chartType?: ChartType;
  timeRange?: TimeRange;
  height?: number;
  loading?: boolean;
  error?: string;
}

// Add this interface to types/analytics.ts

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
    string,
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

// Also ensure these are exported if not already present
export interface AnalyticsData {
  date: string;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export type ChartType = 'line' | 'area' | 'bar' | 'pie';
export type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y';

export interface ChartProps {
  title: string;
  data: AnalyticsData[];
  chartType?: ChartType;
  timeRange?: TimeRange;
  height?: number;
  loading?: boolean;
  error?: string;
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

// Add this interface to your types/analytics.ts file

export interface UserAnalytics {
  totalUsers: number;
  previousPeriodUsers?: number;
  newUsers: number;
  previousNewUsers?: number;
  activeUsers: number;
  previousActiveUsers?: number;
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
