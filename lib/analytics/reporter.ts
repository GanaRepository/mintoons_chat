// lib/analytics/reporter.ts - Analytics reporting and insights
import { connectDB } from '@lib/database/connection';
import Analytics from '@models/Analytics';
import User from '@models/User';
import Story from '@models/Story';
import Subscription from '@models/Subscription';
import { SUBSCRIPTION_TIERS } from '@config/subscription';
import mongoose from 'mongoose';
import { calculateEngagementRate } from '@utils/helpers';
import { StoryStatus } from '../../types';
import { StoryAnalytics } from '../../types/analytics';
import { UserAnalytics } from '../../types/analytics';

interface ReportOptions {
  startDate: Date;
  endDate: Date;
  granularity: 'daily' | 'weekly' | 'monthly';
  filters?: {
    userRole?: string;
    subscriptionTier?: string;
    ageGroup?: string;
  };
}

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalStories: number;
  completedStories: number;
  revenue: number;
  conversionRate: number;
  churnRate: number;
  engagement: {
    avgStoriesPerUser: number;
    avgSessionDuration: number;
    avgWordsPerStory: number;
  };
}

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  subscriptionBreakdown: Record<string, number>;
  churnRate: number;
  growthRate: number;
}

interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  usersByTier: Record<string, number>;
  usersByAge: Record<string, number>;
  topUsersByPoints: any[];
  retentionRate: number;
}

interface ContentMetrics {
  totalStories: number;
  completedStories: number;
  averageWordCount: number;
  averageAssessmentScore: number;
  popularGenres: Array<{ genre: string; count: number }>;
  topStories: any[];
  contentQualityTrends: any[];
}

// Define aggregation result interfaces
interface StoryStatsResult {
  _id: null;
  avgWordCount: number;
  totalWords: number;
  avgAssessmentScore?: number;
}

interface TierBreakdownResult {
  _id: string;
  count: number;
}

interface AgeBreakdownResult {
  _id: string;
  count: number;
}

interface GenreResult {
  _id: string;
  count: number;
}

export class AnalyticsReporter {
  /**
   * Generate dashboard metrics
   */
  async getDashboardMetrics(
    timeframe: 'today' | 'week' | 'month' = 'today'
  ): Promise<DashboardMetrics> {
    try {
      await connectDB();

      const now = new Date();
      let startDate: Date;

      switch (timeframe) {
        case 'today':
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }

      const [
        totalUsers,
        activeUsers,
        newUsers,
        totalStories,
        completedStories,
        subscriptions,
        storyStats,
      ] = await Promise.all([
        (User as any).countDocuments({ isActive: true }),
        (User as any).countDocuments({
          isActive: true,
          lastActiveDate: { $gte: startDate },
        }),
        (User as any).countDocuments({
          createdAt: { $gte: startDate },
        }),
        (Story as any).countDocuments(),
        (Story as any).countDocuments({
          status: { $in: ['completed', 'published'] },
        }),
        (Subscription as any).find({ status: 'active' }).lean().exec(),
        (Story as any).aggregate([
          {
            $group: {
              _id: null,
              avgWordCount: { $avg: '$wordCount' },
              totalWords: { $sum: '$wordCount' },
            },
          },
        ]) as Promise<StoryStatsResult[]>,
      ]);

      // Calculate revenue with type safety
      const revenue = (subscriptions as any[]).reduce(
        (total: number, sub: any) => {
          const tier =
            SUBSCRIPTION_TIERS[sub.tier as keyof typeof SUBSCRIPTION_TIERS];
          return total + (tier ? tier.price : 0);
        },
        0
      );

      // Calculate conversion rate (paying users / total users)
      const payingUsers = (subscriptions as any[]).filter(
        (sub: any) => sub.tier !== 'FREE'
      ).length;
      const conversionRate =
        totalUsers > 0 ? (payingUsers / totalUsers) * 100 : 0;

      // Calculate engagement metrics
      const avgStoriesPerUser = totalUsers > 0 ? totalStories / totalUsers : 0;
      const storyStatsTyped = storyStats as StoryStatsResult[];
      const avgWordsPerStory = storyStatsTyped[0]?.avgWordCount || 0;

      return {
        totalUsers,
        activeUsers,
        newUsers,
        totalStories,
        completedStories,
        revenue,
        conversionRate,
        churnRate: 0, // Would need historical data
        engagement: {
          avgStoriesPerUser,
          avgSessionDuration: 0, // Would need session tracking
          avgWordsPerStory,
        },
      };
    } catch (error) {
      console.error('Error generating dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Generate revenue report
   */
  async getRevenueMetrics(options: ReportOptions): Promise<RevenueMetrics> {
    try {
      await connectDB();

      const subscriptions = await (Subscription as any)
        .find({
          status: 'active',
          createdAt: { $gte: options.startDate, $lte: options.endDate },
        })
        .lean()
        .exec();

      // Calculate total revenue
      const totalRevenue = (subscriptions as any[]).reduce(
        (total: number, sub: any) => {
          const tier =
            SUBSCRIPTION_TIERS[sub.tier as keyof typeof SUBSCRIPTION_TIERS];
          return total + (tier ? tier.price : 0);
        },
        0
      );

      // Calculate MRR (Monthly Recurring Revenue)
      const monthlyRecurringRevenue = (subscriptions as any[]).reduce(
        (total: number, sub: any) => {
          const tier =
            SUBSCRIPTION_TIERS[sub.tier as keyof typeof SUBSCRIPTION_TIERS];
          return total + (tier ? tier.price : 0);
        },
        0
      );

      // Calculate ARPU (Average Revenue Per User)
      const totalUsers = await (User as any).countDocuments({ isActive: true });
      const averageRevenuePerUser =
        totalUsers > 0 ? totalRevenue / totalUsers : 0;

      // Subscription breakdown
      const subscriptionBreakdown = (subscriptions as any[]).reduce(
        (breakdown: Record<string, number>, sub: any) => {
          breakdown[sub.tier] = (breakdown[sub.tier] || 0) + 1;
          return breakdown;
        },
        {} as Record<string, number>
      );

      // Calculate growth rate (would need historical data)
      const growthRate = 0; // Placeholder

      return {
        totalRevenue,
        monthlyRecurringRevenue,
        averageRevenuePerUser,
        subscriptionBreakdown,
        churnRate: 0, // Would need historical data
        growthRate,
      };
    } catch (error) {
      console.error('Error generating revenue metrics:', error);
      throw error;
    }
  }

  /**
   * Generate user metrics report
   */
  async getUserMetrics(options: ReportOptions): Promise<UserMetrics> {
    try {
      await connectDB();

      const [
        totalUsers,
        activeUsers,
        newUsers,
        usersByTier,
        usersByAge,
        topUsers,
      ] = await Promise.all([
        (User as any).countDocuments({ isActive: true }),
        (User as any).countDocuments({
          isActive: true,
          lastActiveDate: { $gte: options.startDate },
        }),
        (User as any).countDocuments({
          createdAt: { $gte: options.startDate, $lte: options.endDate },
        }),
        (User as any).aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$subscriptionTier', count: { $sum: 1 } } },
        ]) as Promise<TierBreakdownResult[]>,
        (User as any).aggregate([
          { $match: { isActive: true } },
          {
            $group: {
              _id: {
                $switch: {
                  branches: [
                    { case: { $lte: ['$age', 6] }, then: 'Early (2-6)' },
                    { case: { $lte: ['$age', 12] }, then: 'Elementary (7-12)' },
                    { case: { $lte: ['$age', 18] }, then: 'Teen (13-18)' },
                  ],
                  default: 'Unknown',
                },
              },
              count: { $sum: 1 },
            },
          },
        ]) as Promise<AgeBreakdownResult[]>,
        (User as any)
          .find({ isActive: true, role: 'child' })
          .sort({ totalPoints: -1 })
          .limit(10)
          .select('firstName lastName totalPoints level storyCount')
          .lean()
          .exec(),
      ]);

      // Convert aggregation results to objects with type safety
      const tierBreakdown = (usersByTier as TierBreakdownResult[]).reduce(
        (obj: Record<string, number>, item: TierBreakdownResult) => {
          obj[item._id] = item.count;
          return obj;
        },
        {} as Record<string, number>
      );

      const ageBreakdown = (usersByAge as AgeBreakdownResult[]).reduce(
        (obj: Record<string, number>, item: AgeBreakdownResult) => {
          obj[item._id] = item.count;
          return obj;
        },
        {} as Record<string, number>
      );

      return {
        totalUsers,
        activeUsers,
        newUsers,
        usersByTier: tierBreakdown,
        usersByAge: ageBreakdown,
        topUsersByPoints: topUsers as any[],
        retentionRate: 0, // Would need historical data
      };
    } catch (error) {
      console.error('Error generating user metrics:', error);
      throw error;
    }
  }

  /**
   * Generate content metrics report
   */
  async getContentMetrics(options: ReportOptions): Promise<ContentMetrics> {
    try {
      await connectDB();

      const [
        totalStories,
        completedStories,
        storyStats,
        popularGenres,
        topStories,
      ] = await Promise.all([
        (Story as any).countDocuments({
          createdAt: { $gte: options.startDate, $lte: options.endDate },
        }),
        (Story as any).countDocuments({
          status: { $in: ['completed', 'published'] },
          createdAt: { $gte: options.startDate, $lte: options.endDate },
        }),
        (Story as any).aggregate([
          {
            $match: {
              createdAt: { $gte: options.startDate, $lte: options.endDate },
            },
          },
          {
            $group: {
              _id: null,
              avgWordCount: { $avg: '$wordCount' },
              avgAssessmentScore: { $avg: '$assessment.overallScore' },
            },
          },
        ]) as Promise<StoryStatsResult[]>,
        (Story as any).aggregate([
          {
            $match: {
              createdAt: { $gte: options.startDate, $lte: options.endDate },
            },
          },
          { $group: { _id: '$elements.genre', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]) as Promise<GenreResult[]>,
        (Story as any)
          .find({
            status: 'published',
            isPublic: true,
            createdAt: { $gte: options.startDate, $lte: options.endDate },
          })
          .sort({ likes: -1, views: -1 })
          .limit(10)
          .select('title authorName wordCount likes views')
          .lean()
          .exec(),
      ]);

      const storyStatsTyped = storyStats as StoryStatsResult[];
      const popularGenresTyped = popularGenres as GenreResult[];

      return {
        totalStories,
        completedStories,
        averageWordCount: storyStatsTyped[0]?.avgWordCount || 0,
        averageAssessmentScore: storyStatsTyped[0]?.avgAssessmentScore || 0,
        popularGenres: popularGenresTyped.map((genre: GenreResult) => ({
          genre: genre._id,
          count: genre.count,
        })),
        topStories: topStories as any[],
        contentQualityTrends: [], // Would need historical data
      };
    } catch (error) {
      console.error('Error generating content metrics:', error);
      throw error;
    }
  }

  /**
   * Generate AI usage report
   */
  async getAIUsageReport(options: ReportOptions): Promise<{
    totalRequests: number;
    totalCost: number;
    averageResponseTime: number;
    providerBreakdown: Record<string, number>;
    costByProvider: Record<string, number>;
  }> {
    try {
      await connectDB();

      const analytics = await (Analytics as any)
        .find({
          date: { $gte: options.startDate, $lte: options.endDate },
          type: 'daily',
        })
        .lean()
        .exec();

      const report = {
        totalRequests: 0,
        totalCost: 0,
        averageResponseTime: 0,
        providerBreakdown: {} as Record<string, number>,
        costByProvider: {} as Record<string, number>,
      };

      (analytics as any[]).forEach((day: any) => {
        if (day.metrics?.aiRequests) {
          report.totalRequests += day.metrics.aiRequests;
        }
        if (day.metrics?.aiCost) {
          report.totalCost += day.metrics.aiCost;
        }
        if (day.metrics?.averageResponseTime) {
          report.averageResponseTime += day.metrics.averageResponseTime;
        }
      });

      // Calculate average response time
      if (analytics.length > 0) {
        report.averageResponseTime =
          report.averageResponseTime / analytics.length;
      }

      return report;
    } catch (error) {
      console.error('Error generating AI usage report:', error);
      throw error;
    }
  }

  /**
   * Generate custom report
   */
  async generateCustomReport(
    metrics: string[],
    options: ReportOptions
  ): Promise<Record<string, any>> {
    try {
      const report: Record<string, any> = {};

      // Process each requested metric
      for (const metric of metrics) {
        switch (metric) {
          case 'dashboard':
            report.dashboard = await this.getDashboardMetrics('month');
            break;
          case 'revenue':
            report.revenue = await this.getRevenueMetrics(options);
            break;
          case 'users':
            report.users = await this.getUserMetrics(options);
            break;
          case 'content':
            report.content = await this.getContentMetrics(options);
            break;
          case 'ai':
            report.ai = await this.getAIUsageReport(options);
            break;
          case 'engagement':
            report.engagement = await this.getEngagementMetrics(options);
            break;
          default:
            console.warn(`Unknown metric requested: ${metric}`);
        }
      }

      return report;
    } catch (error) {
      console.error('Error generating custom report:', error);
      throw error;
    }
  }

  /**
   * Generate engagement metrics
   */
  async getEngagementMetrics(options: ReportOptions): Promise<{
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    averageStoriesPerUser: number;
    averageWordsPerStory: number;
    retentionRates: Record<string, number>;
  }> {
    try {
      await connectDB();

      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers,
        totalUsers,
        totalStories,
        storyStats,
      ] = await Promise.all([
        (User as any).countDocuments({
          isActive: true,
          lastActiveDate: { $gte: dayAgo },
        }),
        (User as any).countDocuments({
          isActive: true,
          lastActiveDate: { $gte: weekAgo },
        }),
        (User as any).countDocuments({
          isActive: true,
          lastActiveDate: { $gte: monthAgo },
        }),
        (User as any).countDocuments({ isActive: true }),
        (Story as any).countDocuments(),
        (Story as any).aggregate([
          {
            $group: {
              _id: null,
              avgWordCount: { $avg: '$wordCount' },
            },
          },
        ]) as Promise<StoryStatsResult[]>,
      ]);

      const storyStatsTyped = storyStats as StoryStatsResult[];

      return {
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers,
        averageSessionDuration: 0, // Would need session tracking
        averageStoriesPerUser: totalUsers > 0 ? totalStories / totalUsers : 0,
        averageWordsPerStory: storyStatsTyped[0]?.avgWordCount || 0,
        retentionRates: {
          '1day': totalUsers > 0 ? (dailyActiveUsers / totalUsers) * 100 : 0,
          '7day': totalUsers > 0 ? (weeklyActiveUsers / totalUsers) * 100 : 0,
          '30day': totalUsers > 0 ? (monthlyActiveUsers / totalUsers) * 100 : 0,
        },
      };
    } catch (error) {
      console.error('Error generating engagement metrics:', error);
      throw error;
    }
  }

  /**
   * Generate cohort analysis
   */
  async getCohortAnalysis(startDate: Date, endDate: Date): Promise<any> {
    try {
      await connectDB();

      const cohorts = await (User as any).aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            users: { $push: '$_id' },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 },
        },
      ]);

      // For each cohort, calculate retention rates
      const cohortAnalysis = await Promise.all(
        (cohorts as any[]).map(async (cohort: any) => {
          const cohortUsers = cohort.users;

          // Calculate retention for different time periods
          const retention = await Promise.all([
            // 1 week retention
            (User as any).countDocuments({
              _id: { $in: cohortUsers },
              lastActiveDate: {
                $gte: new Date(cohort._id.year, cohort._id.month - 1, 7),
              },
            }),
            // 1 month retention
            (User as any).countDocuments({
              _id: { $in: cohortUsers },
              lastActiveDate: {
                $gte: new Date(cohort._id.year, cohort._id.month, 1),
              },
            }),
            // 3 month retention
            (User as any).countDocuments({
              _id: { $in: cohortUsers },
              lastActiveDate: {
                $gte: new Date(cohort._id.year, cohort._id.month + 2, 1),
              },
            }),
          ]);

          return {
            cohort: `${cohort._id.year}-${cohort._id.month.toString().padStart(2, '0')}`,
            totalUsers: cohort.count,
            retention: {
              week1: retention[0],
              month1: retention[1],
              month3: retention[2],
            },
            retentionRates: {
              week1: (retention[0] / cohort.count) * 100,
              month1: (retention[1] / cohort.count) * 100,
              month3: (retention[2] / cohort.count) * 100,
            },
          };
        })
      );

      return cohortAnalysis;
    } catch (error) {
      console.error('Error generating cohort analysis:', error);
      throw error;
    }
  }

  /**
   * Generate A/B test analysis
   */
  async getABTestAnalysis(
    testName: string,
    options: ReportOptions
  ): Promise<{
    totalParticipants: number;
    variants: Record<string, any>;
    conversionRates: Record<string, number>;
    statisticalSignificance: boolean;
  }> {
    try {
      await connectDB();

      // This would require tracking A/B test participation
      // For now, return placeholder structure
      return {
        totalParticipants: 0,
        variants: {},
        conversionRates: {},
        statisticalSignificance: false,
      };
    } catch (error) {
      console.error('Error generating A/B test analysis:', error);
      throw error;
    }
  }

  /**
   * Generate funnel analysis
   */
  async getFunnelAnalysis(
    funnelSteps: string[],
    options: ReportOptions
  ): Promise<{
    steps: Array<{
      name: string;
      users: number;
      dropoffRate: number;
      conversionRate: number;
    }>;
    totalUsers: number;
    overallConversionRate: number;
  }> {
    try {
      await connectDB();

      const EventLog = mongoose.models.EventLog;
      if (!EventLog) {
        return {
          steps: [],
          totalUsers: 0,
          overallConversionRate: 0,
        };
      }

      const funnelData = await Promise.all(
        funnelSteps.map(async (step: string) => {
          const users = await (EventLog as any).distinct('userId', {
            eventType: step,
            timestamp: { $gte: options.startDate, $lte: options.endDate },
          });
          return {
            name: step,
            users: users.length,
          };
        })
      );

      // Calculate conversion rates and dropoff rates
      const totalUsers = funnelData[0]?.users || 0;
      const steps = funnelData.map((step: any, index: number) => {
        const conversionRate =
          totalUsers > 0 ? (step.users / totalUsers) * 100 : 0;
        const previousStepUsers = funnelData[index - 1]?.users || 0;
        const dropoffRate =
          index > 0 && previousStepUsers > 0
            ? ((previousStepUsers - step.users) / previousStepUsers) * 100
            : 0;

        return {
          name: step.name,
          users: step.users,
          dropoffRate,
          conversionRate,
        };
      });

      const finalUsers = funnelData[funnelData.length - 1]?.users || 0;
      const overallConversionRate =
        totalUsers > 0 ? (finalUsers / totalUsers) * 100 : 0;

      return {
        steps,
        totalUsers,
        overallConversionRate,
      };
    } catch (error) {
      console.error('Error generating funnel analysis:', error);
      throw error;
    }
  }

  /**
   * Export report to different formats
   */
  async exportReport(
    reportData: any,
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<Buffer | string> {
    try {
      switch (format) {
        case 'json':
          return JSON.stringify(reportData, null, 2);

        case 'csv':
          // Convert to CSV format
          return this.convertToCSV(reportData);

        case 'pdf':
          // Generate PDF report
          return await this.generatePDFReport(reportData);

        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any): string {
    // Simple CSV conversion - would need more sophisticated logic for complex data
    const headers = Object.keys(data);
    const csvRows = [headers.join(',')];

    // Add data rows (simplified)
    if (Array.isArray(data)) {
      data.forEach((row: any) => {
        csvRows.push(Object.values(row).join(','));
      });
    }

    return csvRows.join('\n');
  }

  /**
   * Generate PDF report
   */
  private async generatePDFReport(data: any): Promise<Buffer> {
    // This would integrate with the PDF generator
    // For now, return empty buffer
    return Buffer.from('PDF report placeholder');
  }

  /**
   * Schedule automatic reports
   */
  async scheduleReport(
    reportType: string,
    schedule: 'daily' | 'weekly' | 'monthly',
    recipients: string[],
    options: ReportOptions
  ): Promise<void> {
    try {
      // This would integrate with a job scheduler
      console.log(
        `Scheduling ${reportType} report for ${schedule} delivery to:`,
        recipients
      );

      // Store scheduled report configuration
      // Implementation would depend on chosen job scheduler (cron, bull, etc.)
    } catch (error) {
      console.error('Error scheduling report:', error);
      throw error;
    }
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(): Promise<{
    activeUsers: number;
    onlineUsers: number;
    currentSessions: number;
    recentActivity: any[];
  }> {
    try {
      await connectDB();

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const [activeUsers, recentActivity] = await Promise.all([
        (User as any).countDocuments({
          lastActiveDate: { $gte: fiveMinutesAgo },
        }),
        // Get recent activity from event log if available
        mongoose.models.EventLog
          ? (mongoose.models.EventLog as any)
              .find({
                timestamp: { $gte: oneHourAgo },
              })
              .sort({ timestamp: -1 })
              .limit(50)
              .lean()
              .exec()
          : [],
      ]);

      return {
        activeUsers,
        onlineUsers: activeUsers, // Would need real-time tracking
        currentSessions: 0, // Would need session tracking
        recentActivity: recentActivity || [],
      };
    } catch (error) {
      console.error('Error getting real-time metrics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const analyticsReporter = new AnalyticsReporter();

// Add this function to the AnalyticsReporter class

/**
 * Get revenue analytics with detailed breakdown
 */

interface RevenueAnalytics {
  totalRevenue: number;
  previousRevenue: number;
  subscriptionRevenue: number;
  activeSubscribers: number;
  previousActiveSubscribers: number;
  canceledSubscriptions: number;
  totalSubscriptions: number;
  customerLifetimeValue: number;
  conversionRate: number;
  revenueGrowthRate: number;
  revenueData: Array<{ date: string; value: number }>;
  subscriptionBreakdown: Record<
    string,
    { revenue: number; subscribers: number; percentage: number }
  >;
  forecastData: Array<{ date: string; value: number }>;
  forecastedMRR: number;
  forecastedSubscribers: number;
  confidenceLevel: number;
  previousMRR: number;
  previousARPU: number;
}

export async function getRevenueAnalytics(
  timeRange: string
): Promise<RevenueAnalytics> {
  try {
    await connectDB();

    const now = new Date();
    let startDate: Date;
    let endDate = now;

    // Parse timeRange
    switch (timeRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get current period data
    const [subscriptions, previousPeriodSubscriptions] = await Promise.all([
      (Subscription as any)
        .find({
          status: 'active',
          createdAt: { $gte: startDate, $lte: endDate },
        })
        .lean()
        .exec(),
      (Subscription as any)
        .find({
          status: 'active',
          createdAt: {
            $gte: new Date(
              startDate.getTime() - (endDate.getTime() - startDate.getTime())
            ),
            $lte: startDate,
          },
        })
        .lean()
        .exec(),
    ]);

    // Calculate metrics
    const totalRevenue = subscriptions.reduce((total: number, sub: any) => {
      const tier =
        SUBSCRIPTION_TIERS[sub.tier as keyof typeof SUBSCRIPTION_TIERS];
      return total + (tier ? tier.price : 0);
    }, 0);

    const previousRevenue = previousPeriodSubscriptions.reduce(
      (total: number, sub: any) => {
        const tier =
          SUBSCRIPTION_TIERS[sub.tier as keyof typeof SUBSCRIPTION_TIERS];
        return total + (tier ? tier.price : 0);
      },
      0
    );

    const activeSubscribers = subscriptions.length;
    const previousActiveSubscribers = previousPeriodSubscriptions.length;

    const subscriptionRevenue = totalRevenue; // Assuming all revenue is subscription-based
    const canceledSubscriptions = 0; // Would need proper tracking
    const totalSubscriptions = activeSubscribers;

    // Generate time series data
    const revenueData = await generateRevenueTimeSeries(startDate, endDate);
    const forecastData = await generateRevenueForecast(revenueData);

    // Calculate subscription breakdown
    const subscriptionBreakdown: Record<
      string,
      { revenue: number; subscribers: number; percentage: number }
    > = {};

    Object.keys(SUBSCRIPTION_TIERS).forEach(tier => {
      const tierSubs = subscriptions.filter((sub: any) => sub.tier === tier);
      const tierRevenue = tierSubs.reduce((total: number, sub: any) => {
        const tierConfig =
          SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
        return total + (tierConfig ? tierConfig.price : 0);
      }, 0);

      subscriptionBreakdown[tier] = {
        revenue: tierRevenue,
        subscribers: tierSubs.length,
        percentage: totalRevenue > 0 ? (tierRevenue / totalRevenue) * 100 : 0,
      };
    });

    return {
      totalRevenue,
      previousRevenue,
      subscriptionRevenue,
      activeSubscribers,
      previousActiveSubscribers,
      canceledSubscriptions,
      totalSubscriptions,
      customerLifetimeValue: calculateCLV(totalRevenue, activeSubscribers),
      conversionRate: await calculateConversionRate(),
      revenueGrowthRate:
        previousRevenue > 0
          ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
          : 0,
      revenueData,
      subscriptionBreakdown,
      forecastData,
      forecastedMRR:
        forecastData.length > 0
          ? forecastData[forecastData.length - 1]?.value || 0
          : 0,
      forecastedSubscribers: Math.round(activeSubscribers * 1.1), // Simple 10% growth forecast
      confidenceLevel: 75, // Placeholder confidence level
      previousMRR: previousRevenue,
      previousARPU:
        previousActiveSubscribers > 0
          ? previousRevenue / previousActiveSubscribers
          : 0,
    };
  } catch (error) {
    console.error('Error getting revenue analytics:', error);
    throw error;
  }
}

// Helper functions for revenue analytics
async function generateRevenueTimeSeries(
  startDate: Date,
  endDate: Date
): Promise<Array<{ date: string; value: number }>> {
  // Generate daily revenue data
  const data: Array<{ date: string; value: number }> = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // This would query actual daily revenue data
    data.push({
      date: currentDate.toISOString().split('T')[0],
      value: Math.random() * 1000 + 500, // Placeholder data
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}

async function generateRevenueForecast(
  historicalData: Array<{ date: string; value: number }>
): Promise<Array<{ date: string; value: number }>> {
  // Simple forecast based on trend
  const forecast: Array<{ date: string; value: number }> = [];
  const lastValue = historicalData[historicalData.length - 1]?.value || 0;
  const trend = calculateSimpleTrend(historicalData);

  const lastDate = new Date(
    historicalData[historicalData.length - 1]?.date || new Date()
  );

  for (let i = 1; i <= 30; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i);

    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      value: lastValue + trend * i,
    });
  }

  return forecast;
}

function calculateCLV(totalRevenue: number, subscribers: number): number {
  // Simple CLV calculation
  const avgRevenuePerUser = subscribers > 0 ? totalRevenue / subscribers : 0;
  const avgLifetimeMonths = 12; // Assumption
  return avgRevenuePerUser * avgLifetimeMonths;
}

async function calculateConversionRate(): Promise<number> {
  const [totalUsers, paidUsers] = await Promise.all([
    (User as any).countDocuments({ isActive: true }),
    (Subscription as any).countDocuments({
      status: 'active',
      tier: { $ne: 'FREE' },
    }),
  ]);

  return totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0;
}

function calculateSimpleTrend(data: Array<{ value: number }>): number {
  if (data.length < 2) return 0;

  const firstValue = data[0]?.value || 0;
  const lastValue = data[data.length - 1]?.value || 0;

  return (lastValue - firstValue) / data.length;
}

// Add this function to lib/analytics/reporter.ts

/**
 * Get story analytics with detailed breakdown
 */
export async function getStoryAnalytics(
  timeRange: string
): Promise<StoryAnalytics> {
  try {
    await connectDB();

    const now = new Date();
    let startDate: Date;
    let endDate = now;

    // Parse timeRange
    switch (timeRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Calculate previous period for comparison
    const periodDuration = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodDuration);
    const previousEndDate = startDate;

    // Get current period data
    const [
      currentStories,
      previousStories,
      statusDistribution,
      genreDistribution,
      characterDistribution,
      settingDistribution,
      topStories,
      ratingDistribution,
      creationData,
    ] = await Promise.all([
      // Current period stories
      (Story as any)
        .find({
          createdAt: { $gte: startDate, $lte: endDate },
        })
        .lean()
        .exec(),

      // Previous period stories
      (Story as any)
        .find({
          createdAt: { $gte: previousStartDate, $lte: previousEndDate },
        })
        .lean()
        .exec(),

      // Status distribution
      (Story as any).aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Genre distribution
      (Story as any).aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$elements.genre', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Character distribution
      (Story as any).aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$elements.character', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Setting distribution
      (Story as any).aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$elements.setting', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Top performing stories
      (Story as any)
        .find({
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['published', 'completed'] },
        })
        .sort({ views: -1, likes: -1 })
        .limit(10)
        .select('title authorName views likes comments rating createdAt')
        .lean()
        .exec(),

      // Rating distribution
      (Story as any).aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            'assessment.overallScore': { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: { $round: '$assessment.overallScore' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
      ]),

      // Creation data over time
      generateStoryCreationTimeSeries(startDate, endDate),
    ]);

    // Calculate metrics
    const totalStories = currentStories.length;
    const previousTotalStories = previousStories.length;
    const storiesCreated = currentStories.length;
    const previousStoriesCreated = previousStories.length;

    const totalViews = currentStories.reduce(
      (sum: number, story: any) => sum + (story.views || 0),
      0
    );
    const previousTotalViews = previousStories.reduce(
      (sum: number, story: any) => sum + (story.views || 0),
      0
    );

    const totalLikes = currentStories.reduce(
      (sum: number, story: any) => sum + (story.likes || 0),
      0
    );
    const totalComments = currentStories.reduce(
      (sum: number, story: any) => sum + (story.comments?.length || 0),
      0
    );

    const engagementRate = calculateEngagementRate(
      totalViews,
      totalLikes,
      totalComments
    );
    const previousEngagementRate = 0; // Would need historical calculation

    // Process distributions
    const processedStatusDistribution = processStatusDistribution(
      statusDistribution,
      totalStories
    );
    // NEW CODE (USE THIS):
    const processedGenreDistribution = genreDistribution.map(
      (item: { _id: string; count: number }) => ({
        genre: item._id || 'Unknown',
        count: item.count,
        percentage: totalStories > 0 ? (item.count / totalStories) * 100 : 0,
      })
    );

    const processedCharacterDistribution = characterDistribution.map(
      (item: { _id: string; count: number }) => ({
        character: item._id || 'Unknown',
        count: item.count,
        percentage: totalStories > 0 ? (item.count / totalStories) * 100 : 0,
      })
    );

    const processedSettingDistribution = settingDistribution.map(
      (item: { _id: string; count: number }) => ({
        setting: item._id || 'Unknown',
        count: item.count,
        percentage: totalStories > 0 ? (item.count / totalStories) * 100 : 0,
      })
    );

    const processedRatingDistribution =
      processRatingDistribution(ratingDistribution);

    return {
      totalStories,
      previousTotalStories,
      storiesCreated,
      previousStoriesCreated,
      totalViews,
      previousTotalViews,
      totalLikes,
      totalComments,
      engagementRate,
      previousEngagementRate,
      statusDistribution: processedStatusDistribution,
      genreDistribution: processedGenreDistribution,
      characterDistribution: processedCharacterDistribution,
      settingDistribution: processedSettingDistribution,
      ratingDistribution: processedRatingDistribution,
      topStories: topStories.map((story: any) => ({
        id: story._id.toString(),
        title: story.title,
        authorName: story.authorName,
        views: story.views || 0,
        likes: story.likes || 0,
        comments: story.comments?.length || 0,
        rating: story.assessment?.overallScore,
        createdAt: story.createdAt,
      })),
      creationData,
      // Add missing properties for StoryAnalytics
      completedStories: currentStories.filter((s: any) => s.status === 'completed').length,
      publishedStories: currentStories.filter((s: any) => s.status === 'published').length,
      totalWords: currentStories.reduce((sum: number, s: any) => sum + (s.wordCount || 0), 0),
      averageWordsPerStory: currentStories.length > 0 ? currentStories.reduce((sum: number, s: any) => sum + (s.wordCount || 0), 0) / currentStories.length : 0,
    };
  } catch (error) {
    console.error('Error getting story analytics:', error);
    throw error;
  }
}

// Helper functions for story analytics
async function generateStoryCreationTimeSeries(
  startDate: Date,
  endDate: Date
): Promise<Array<{ date: string; value: number }>> {
  const data: Array<{ date: string; value: number }> = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayStart = new Date(currentDate);
    const dayEnd = new Date(currentDate);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const count = await (Story as any).countDocuments({
      createdAt: { $gte: dayStart, $lt: dayEnd },
    });

    data.push({
      date: currentDate.toISOString().split('T')[0],
      value: count,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}

function processStatusDistribution(statusData: any[], totalStories: number) {
  return statusData.map(item => ({
    status: item._id as StoryStatus,
    count: item.count,
    percentage: totalStories > 0 ? (item.count / totalStories) * 100 : 0,
  }));
}

function processRatingDistribution(ratingData: any[]) {
  // Create distribution for scores 1-5
  const distribution = [];
  for (let score = 1; score <= 5; score++) {
    const found = ratingData.find(item => item._id === score);
    distribution.push({
      score,
      count: found ? found.count : 0,
    });
  }
  return distribution;
}

// Add this function to your lib/analytics/reporter.ts file

/**
 * Get user analytics with detailed breakdown
 */
export async function getUserAnalytics(
  timeRange: string
): Promise<UserAnalytics> {
  try {
    await connectDB();

    const now = new Date();
    let startDate: Date;
    let endDate = now;

    // Parse timeRange
    switch (timeRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Calculate previous period for comparison
    const periodDuration = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodDuration);
    const previousEndDate = startDate;

    // Get current and previous period data
    const [
      totalUsers,
      previousPeriodUsers,
      newUsers,
      previousNewUsers,
      activeUsers,
      previousActiveUsers,
      ageDistribution,
      roleDistribution,
      recentActivity,
      growthData,
    ] = await Promise.all([
      // Current period
      (User as any).countDocuments({ isActive: true }),

      // Previous period total users
      (User as any).countDocuments({
        isActive: true,
        createdAt: { $lte: previousEndDate },
      }),

      // New users current period
      (User as any).countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
      }),

      // New users previous period
      (User as any).countDocuments({
        createdAt: { $gte: previousStartDate, $lte: previousEndDate },
      }),

      // Active users current period
      (User as any).countDocuments({
        isActive: true,
        lastActiveDate: { $gte: startDate },
      }),

      // Active users previous period
      (User as any).countDocuments({
        isActive: true,
        lastActiveDate: { $gte: previousStartDate, $lte: previousEndDate },
      }),

      // Age distribution
      (User as any).aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $lte: ['$age', 6] }, then: '2-6' },
                  { case: { $lte: ['$age', 12] }, then: '7-12' },
                  { case: { $lte: ['$age', 18] }, then: '13-18' },
                ],
                default: 'Unknown',
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),

      // Role distribution
      (User as any).aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),

      // Recent activity (mock data)
      generateRecentUserActivity(10),

      // Growth data over time
      generateUserGrowthTimeSeries(startDate, endDate),
    ]);

    return {
      totalUsers,
      previousPeriodUsers,
      newUsers,
      previousNewUsers,
      activeUsers,
      previousActiveUsers,
      previousRetentionRate: 0, // Would need historical calculation
      ageDistribution: ageDistribution.map((item: any) => ({
        range: item._id,
        count: item.count,
        percentage: totalUsers > 0 ? (item.count / totalUsers) * 100 : 0,
      })),
      roleDistribution: roleDistribution.map((item: any) => ({
        role: item._id,
        count: item.count,
        percentage: totalUsers > 0 ? (item.count / totalUsers) * 100 : 0,
      })),
      peakHours: generatePeakHours(),
      activeDays: generateActiveDays(),
      averageSessionDuration: 25, // Mock data
      averageActionsPerSession: 8, // Mock data
      recentActivity,
      growthData,
      // Add missing properties for UserAnalytics
      childUsers: await (User as any).countDocuments({ isActive: true, role: 'child' }),
      mentorUsers: await (User as any).countDocuments({ isActive: true, role: 'mentor' }),
    };
  } catch (error) {
    console.error('Error getting user analytics:', error);
    throw error;
  }
}

// Helper functions for user analytics
async function generateRecentUserActivity(limit: number) {
  // Mock recent activity data
  return Array.from({ length: limit }, (_, i) => ({
    userName: `User ${i + 1}`,
    action: 'created a story',
    timestamp: new Date(Date.now() - i * 60000),
    userRole: i % 3 === 0 ? 'child' : 'mentor',
  }));
}

async function generateUserGrowthTimeSeries(startDate: Date, endDate: Date) {
  const data = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    data.push({
      date: currentDate.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 50) + 10, // Mock growth data
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}

function generatePeakHours() {
  return [
    { hour: 15, percentage: 85 },
    { hour: 16, percentage: 92 },
    { hour: 17, percentage: 78 },
  ];
}

function generateActiveDays() {
  return [
    { day: 'Saturday', percentage: 95 },
    { day: 'Sunday', percentage: 88 },
    { day: 'Friday', percentage: 82 },
  ];
}
