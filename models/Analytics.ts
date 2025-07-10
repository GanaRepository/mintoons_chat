// models/Analytics.ts - Analytics and metrics model
import mongoose, { Schema, Document } from 'mongoose';

export interface AnalyticsDocument extends Document {
  _id: mongoose.Types.ObjectId;
  date: Date;
  metrics: Record<string, number>;
  type: 'daily' | 'weekly' | 'monthly';
  tierBreakdown: {
    FREE: number;
    BASIC: number;
    PREMIUM: number;
    PRO: number;
  };
  ageBreakdown: {
    toddler: number;
    preschool: number;
    early_elementary: number;
    late_elementary: number;
    middle_school: number;
    high_school: number;
  };
}

// Static methods interface
interface AnalyticsModel extends mongoose.Model<AnalyticsDocument> {
  recordDailyMetrics(): Promise<AnalyticsDocument>;
  getMetricsForPeriod(
    startDate: Date,
    endDate: Date,
    type?: 'daily' | 'weekly' | 'monthly'
  ): Promise<AnalyticsDocument[]>;
}

const analyticsSchema = new Schema<AnalyticsDocument>(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
      index: true,
    },

    // Platform metrics
    metrics: {
      // User metrics
      totalUsers: { type: Number, default: 0 },
      newUsers: { type: Number, default: 0 },
      activeUsers: { type: Number, default: 0 },
      childUsers: { type: Number, default: 0 },
      mentorUsers: { type: Number, default: 0 },

      // Story metrics
      totalStories: { type: Number, default: 0 },
      newStories: { type: Number, default: 0 },
      completedStories: { type: Number, default: 0 },
      publishedStories: { type: Number, default: 0 },
      totalWords: { type: Number, default: 0 },
      averageWordsPerStory: { type: Number, default: 0 },

      // Assessment metrics
      totalAssessments: { type: Number, default: 0 },
      averageGrammarScore: { type: Number, default: 0 },
      averageCreativityScore: { type: Number, default: 0 },
      averageOverallScore: { type: Number, default: 0 },

      // Comment metrics
      totalComments: { type: Number, default: 0 },
      newComments: { type: Number, default: 0 },
      resolvedComments: { type: Number, default: 0 },

      // Subscription metrics
      totalSubscriptions: { type: Number, default: 0 },
      newSubscriptions: { type: Number, default: 0 },
      canceledSubscriptions: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },

      // Engagement metrics
      sessionDuration: { type: Number, default: 0 },
      storiesPerUser: { type: Number, default: 0 },
      commentsPerStory: { type: Number, default: 0 },

      // AI metrics
      aiRequests: { type: Number, default: 0 },
      aiCost: { type: Number, default: 0 },
      averageResponseTime: { type: Number, default: 0 },
    },

    // Breakdown by subscription tier
    tierBreakdown: {
      FREE: { type: Number, default: 0 },
      BASIC: { type: Number, default: 0 },
      PREMIUM: { type: Number, default: 0 },
      PRO: { type: Number, default: 0 },
    },

    // Breakdown by age group
    ageBreakdown: {
      toddler: { type: Number, default: 0 },
      preschool: { type: Number, default: 0 },
      early_elementary: { type: Number, default: 0 },
      late_elementary: { type: Number, default: 0 },
      middle_school: { type: Number, default: 0 },
      high_school: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
analyticsSchema.index({ date: 1, type: 1 }, { unique: true });
analyticsSchema.index({ type: 1, date: -1 });

// Static method to record daily metrics
analyticsSchema.statics.recordDailyMetrics =
  async function (): Promise<AnalyticsDocument> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const User = mongoose.model('User');
      const Story = mongoose.model('Story');
      const Comment = mongoose.model('Comment');
      const Subscription = mongoose.model('Subscription');

      // Calculate metrics with proper type casting
      const [
        totalUsers,
        newUsers,
        activeUsers,
        totalStories,
        newStories,
        completedStories,
        totalComments,
        newComments,
        subscriptions,
      ] = await Promise.all([
        (User as any).countDocuments({ isActive: true }),
        (User as any).countDocuments({ createdAt: { $gte: today } }),
        (User as any).countDocuments({ lastActiveDate: { $gte: today } }),
        (Story as any).countDocuments(),
        (Story as any).countDocuments({ createdAt: { $gte: today } }),
        (Story as any).countDocuments({ status: 'completed' }),
        (Comment as any).countDocuments(),
        (Comment as any).countDocuments({ createdAt: { $gte: today } }),
        (Subscription as any).find().populate('userId').lean().exec(),
      ]);

      // Calculate tier breakdown with type safety
      const tierBreakdown = (subscriptions as any[]).reduce(
        (acc: any, sub: any) => {
          const tier = sub.tier || 'FREE';
          acc[tier] = (acc[tier] || 0) + 1;
          return acc;
        },
        { FREE: 0, BASIC: 0, PREMIUM: 0, PRO: 0 }
      );

      // Calculate age breakdown
      const users = await (User as any).find({ isActive: true }).lean().exec();
      const ageBreakdown = (users as any[]).reduce(
        (acc: any, user: any) => {
          let ageGroup = 'toddler';

          if (user.age >= 2 && user.age <= 4) ageGroup = 'toddler';
          else if (user.age >= 5 && user.age <= 6) ageGroup = 'preschool';
          else if (user.age >= 7 && user.age <= 9)
            ageGroup = 'early_elementary';
          else if (user.age >= 10 && user.age <= 12)
            ageGroup = 'late_elementary';
          else if (user.age >= 13 && user.age <= 15) ageGroup = 'middle_school';
          else if (user.age >= 16 && user.age <= 18) ageGroup = 'high_school';

          acc[ageGroup] = (acc[ageGroup] || 0) + 1;
          return acc;
        },
        {
          toddler: 0,
          preschool: 0,
          early_elementary: 0,
          late_elementary: 0,
          middle_school: 0,
          high_school: 0,
        }
      );

      // Calculate additional metrics
      const storyStats = await (Story as any).aggregate([
        {
          $group: {
            _id: null,
            totalWords: { $sum: '$wordCount' },
            averageWords: { $avg: '$wordCount' },
          },
        },
      ]);

      const totalWords = storyStats[0]?.totalWords || 0;
      const averageWordsPerStory = storyStats[0]?.averageWords || 0;

      // Calculate revenue with type safety
      const revenue = (subscriptions as any[]).reduce(
        (total: number, sub: any) => {
          // This would need to be imported properly in a real implementation
          // For now, using a simple calculation
          const tierPrices: Record<string, number> = {
            FREE: 0,
            BASIC: 9.99,
            PREMIUM: 19.99,
            PRO: 39.99,
          };
          return total + (tierPrices[sub.tier] || 0);
        },
        0
      );

      // Create or update analytics record
      const analytics = await this.findOneAndUpdate(
        { date: today, type: 'daily' },
        {
          metrics: {
            totalUsers,
            newUsers,
            activeUsers,
            childUsers: await (User as any).countDocuments({
              role: 'child',
              isActive: true,
            }),
            mentorUsers: await (User as any).countDocuments({
              role: 'mentor',
              isActive: true,
            }),
            totalStories,
            newStories,
            completedStories,
            publishedStories: await (Story as any).countDocuments({
              status: 'published',
            }),
            totalWords,
            averageWordsPerStory,
            totalComments,
            newComments,
            totalSubscriptions: subscriptions.length,
            revenue,
            storiesPerUser: totalUsers > 0 ? totalStories / totalUsers : 0,
            commentsPerStory:
              totalStories > 0 ? totalComments / totalStories : 0,
          },
          tierBreakdown,
          ageBreakdown,
        },
        { upsert: true, new: true }
      );

      return analytics as AnalyticsDocument;
    } catch (error) {
      console.error('Error recording daily metrics:', error);
      throw error;
    }
  };

// Static method to get metrics for period
analyticsSchema.statics.getMetricsForPeriod = function (
  startDate: Date,
  endDate: Date,
  type: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<AnalyticsDocument[]> {
  return this.find({
    date: { $gte: startDate, $lte: endDate },
    type,
  }).sort({ date: 1 });
};

const Analytics =
  mongoose.models.Analytics ||
  mongoose.model<AnalyticsDocument, AnalyticsModel>(
    'Analytics',
    analyticsSchema
  );
export default Analytics;
