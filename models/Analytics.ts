// models/Analytics.ts - Analytics and metrics model
import mongoose, { Schema, Document } from 'mongoose';

export interface AnalyticsDocument extends Document {
  _id: mongoose.Types.ObjectId;
  date: Date;
  metrics: Record<string, number>;
  type: 'daily' | 'weekly' | 'monthly';
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
analyticsSchema.statics.recordDailyMetrics = async function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const User = mongoose.model('User');
  const Story = mongoose.model('Story');
  const Comment = mongoose.model('Comment');
  const Subscription = mongoose.model('Subscription');

  // Calculate metrics
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
    User.countDocuments({ isActive: true }),
    User.countDocuments({ createdAt: { $gte: today } }),
    User.countDocuments({ lastActiveDate: { $gte: today } }),
    Story.countDocuments(),
    Story.countDocuments({ createdAt: { $gte: today } }),
    Story.countDocuments({ status: 'completed' }),
    Comment.countDocuments(),
    Comment.countDocuments({ createdAt: { $gte: today } }),
    Subscription.find().populate('userId'),
  ]);

  // Calculate tier breakdown
  const tierBreakdown = subscriptions.reduce(
    (acc, sub) => {
      acc[sub.tier] = (acc[sub.tier] || 0) + 1;
      return acc;
    },
    { FREE: 0, BASIC: 0, PREMIUM: 0, PRO: 0 }
  );

  // Calculate age breakdown
  const users = await User.find({ isActive: true });
  const ageBreakdown = users.reduce(
    (acc, user) => {
      const ageGroup = user.ageGroup;
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
  const storyStats = await Story.aggregate([
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

  // Calculate revenue
  const revenue = subscriptions.reduce((total, sub) => {
    const { SubscriptionConfig } = require('@config/subscription');
    return total + SubscriptionConfig.getPrice(sub.tier);
  }, 0);

  // Create or update analytics record
  const analytics = await this.findOneAndUpdate(
    { date: today, type: 'daily' },
    {
      metrics: {
        totalUsers,
        newUsers,
        activeUsers,
        childUsers: await User.countDocuments({
          role: 'child',
          isActive: true,
        }),
        mentorUsers: await User.countDocuments({
          role: 'mentor',
          isActive: true,
        }),
        totalStories,
        newStories,
        completedStories,
        publishedStories: await Story.countDocuments({ status: 'published' }),
        totalWords,
        averageWordsPerStory,
        totalComments,
        newComments,
        totalSubscriptions: subscriptions.length,
        revenue: revenue / 100, // Convert from cents to dollars
        storiesPerUser: totalUsers > 0 ? totalStories / totalUsers : 0,
        commentsPerStory: totalStories > 0 ? totalComments / totalStories : 0,
      },
      tierBreakdown,
      ageBreakdown,
    },
    { upsert: true, new: true }
  );

  return analytics;
};

// Static method to get metrics for period
analyticsSchema.statics.getMetricsForPeriod = function (
  startDate: Date,
  endDate: Date,
  type: 'daily' | 'weekly' | 'monthly' = 'daily'
) {
  return this.find({
    date: { $gte: startDate, $lte: endDate },
    type,
  }).sort({ date: 1 });
};

const Analytics =
  mongoose.models.Analytics ||
  mongoose.model<AnalyticsDocument>('Analytics', analyticsSchema);
export default Analytics;
