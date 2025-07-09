// lib/analytics/reporter.ts - Analytics reporting and insights
import { connectDB } from '@lib/database/connection';
import Analytics from '@models/Analytics';
import User from '@models/User';
import Story from '@models/Story';
import Subscription from '@models/Subscription';
import { SUBSCRIPTION_TIERS } from '@config/subscription';
import mongoose from 'mongoose';

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
        User.countDocuments({ isActive: true }),
        User.countDocuments({
          isActive: true,
          lastActiveDate: { $gte: startDate },
        }),
        User.countDocuments({
          createdAt: { $gte: startDate },
        }),
        Story.countDocuments(),
        Story.countDocuments({
          status: { $in: ['completed', 'published'] },
        }),
        Subscription.find({ status: 'active' }),
        Story.aggregate([
          {
            $group: {
              _id: null,
              avgWordCount: { $avg: '$wordCount' },
              totalWords: { $sum: '$wordCount' },
            },
          },
        ]),
      ]);

      // Calculate revenue
      const revenue = subscriptions.reduce((total, sub) => {
        const tier = SUBSCRIPTION_TIERS[sub.tier];
        return total + (tier ? tier.price / 100 : 0);
      }, 0);

      // Calculate conversion rate (paying users / total users)
      const payingUsers = subscriptions.filter(
        sub => sub.tier !== 'FREE'
      ).length;
      const conversionRate =
        totalUsers > 0 ? (payingUsers / totalUsers) * 100 : 0;

      // Calculate engagement metrics
      const avgStoriesPerUser = totalUsers > 0 ? totalStories / totalUsers : 0;
      const avgWordsPerStory = storyStats[0]?.avgWordCount || 0;

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

      const subscriptions = await Subscription.find({
        status: 'active',
        createdAt: { $gte: options.startDate, $lte: options.endDate },
      });

      // Calculate total revenue
      const totalRevenue = subscriptions.reduce((total, sub) => {
        const tier = SUBSCRIPTION_TIERS[sub.tier];
        return total + (tier ? tier.price / 100 : 0);
      }, 0);

      // Calculate MRR (Monthly Recurring Revenue)
      const monthlyRecurringRevenue = subscriptions.reduce((total, sub) => {
        const tier = SUBSCRIPTION_TIERS[sub.tier];
        return total + (tier ? tier.price / 100 : 0);
      }, 0);

      // Calculate ARPU (Average Revenue Per User)
      const totalUsers = await User.countDocuments({ isActive: true });
      const averageRevenuePerUser =
        totalUsers > 0 ? totalRevenue / totalUsers : 0;

      // Subscription breakdown
      const subscriptionBreakdown = subscriptions.reduce(
        (breakdown, sub) => {
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
        User.countDocuments({ isActive: true }),
        User.countDocuments({
          isActive: true,
          lastActiveDate: { $gte: options.startDate },
        }),
        User.countDocuments({
          createdAt: { $gte: options.startDate, $lte: options.endDate },
        }),
        User.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$subscriptionTier', count: { $sum: 1 } } },
        ]),
        User.aggregate([
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
        ]),
        User.find({ isActive: true, role: 'child' })
          .sort({ totalPoints: -1 })
          .limit(10)
          .select('firstName lastName totalPoints level storyCount'),
      ]);

      // Convert aggregation results to objects
      const tierBreakdown = usersByTier.reduce(
        (obj, item) => {
          obj[item._id] = item.count;
          return obj;
        },
        {} as Record<string, number>
      );

      const ageBreakdown = usersByAge.reduce(
        (obj, item) => {
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
        topUsersByPoints: topUsers,
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
        Story.countDocuments({
          createdAt: { $gte: options.startDate, $lte: options.endDate },
        }),
        Story.countDocuments({
          status: { $in: ['completed', 'published'] },
          createdAt: { $gte: options.startDate, $lte: options.endDate },
        }),
        Story.aggregate([
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
        ]),
        Story.aggregate([
          {
            $match: {
              createdAt: { $gte: options.startDate, $lte: options.endDate },
            },
          },
          { $group: { _id: '$elements.genre', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
        Story.find({
          status: 'published',
          isPublic: true,
          createdAt: { $gte: options.startDate, $lte: options.endDate },
        })
          .sort({ likes: -1, views: -1 })
          .limit(10)
          .select('title authorName wordCount likes views'),
      ]);

      return {
        totalStories,
        completedStories,
        averageWordCount: storyStats[0]?.avgWordCount || 0,
        averageAssessmentScore: storyStats[0]?.avgAssessmentScore || 0,
        popularGenres: popularGenres.map(genre => ({
          genre: genre._id,
          count: genre.count,
        })),
        topStories,
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

      const analytics = await Analytics.find({
        date: { $gte: options.startDate, $lte: options.endDate },
        type: 'daily',
      });

      const report = {
        totalRequests: 0,
        totalCost: 0,
        averageResponseTime: 0,
        providerBreakdown: {} as Record<string, number>,
        costByProvider: {} as Record<string, number>,
      };

      analytics.forEach(day => {
        if (day.metrics.aiRequests) {
          report.totalRequests += day.metrics.aiRequests;
        }
        if (day.metrics.aiCost) {
          report.totalCost += day.metrics.aiCost;
        }
        if (day.metrics.averageResponseTime) {
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
        User.countDocuments({
          isActive: true,
          lastActiveDate: { $gte: dayAgo },
        }),
        User.countDocuments({
          isActive: true,
          lastActiveDate: { $gte: weekAgo },
        }),
        User.countDocuments({
          isActive: true,
          lastActiveDate: { $gte: monthAgo },
        }),
        User.countDocuments({ isActive: true }),
        Story.countDocuments(),
        Story.aggregate([
          {
            $group: {
              _id: null,
              avgWordCount: { $avg: '$wordCount' },
            },
          },
        ]),
      ]);

      return {
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers,
        averageSessionDuration: 0, // Would need session tracking
        averageStoriesPerUser: totalUsers > 0 ? totalStories / totalUsers : 0,
        averageWordsPerStory: storyStats[0]?.avgWordCount || 0,
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

      const cohorts = await User.aggregate([
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
        cohorts.map(async cohort => {
          const cohortUsers = cohort.users;

          // Calculate retention for different time periods
          const retention = await Promise.all([
            // 1 week retention
            User.countDocuments({
              _id: { $in: cohortUsers },
              lastActiveDate: {
                $gte: new Date(cohort._id.year, cohort._id.month - 1, 7),
              },
            }),
            // 1 month retention
            User.countDocuments({
              _id: { $in: cohortUsers },
              lastActiveDate: {
                $gte: new Date(cohort._id.year, cohort._id.month, 1),
              },
            }),
            // 3 month retention
            User.countDocuments({
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
        funnelSteps.map(async step => {
          const users = await EventLog.distinct('userId', {
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
      const steps = funnelData.map((step, index) => {
        const conversionRate =
          totalUsers > 0 ? (step.users / totalUsers) * 100 : 0;
        const dropoffRate =
          index > 0
            ? ((funnelData[index - 1].users - step.users) /
                funnelData[index - 1].users) *
              100
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
      data.forEach(row => {
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
        User.countDocuments({
          lastActiveDate: { $gte: fiveMinutesAgo },
        }),
        // Get recent activity from event log if available
        mongoose.models.EventLog
          ? mongoose.models.EventLog.find({
              timestamp: { $gte: oneHourAgo },
            })
              .sort({ timestamp: -1 })
              .limit(50)
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
