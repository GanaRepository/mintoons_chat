import * as mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';

export interface AnalyticsDocument extends Document {
  _id: mongoose.Types.ObjectId;
  date: Date;
  type: 'daily' | 'weekly' | 'monthly';
  metrics: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    childUsers: number;
    mentorUsers: number;
    totalStories: number;
    newStories: number;
    completedStories: number;
    publishedStories: number;
    totalWords: number;
    averageWordsPerStory: number;
    totalAssessments: number;
    averageGrammarScore: number;
    averageCreativityScore: number;
    averageOverallScore: number;
    totalComments: number;
    newComments: number;
    resolvedComments: number;
    totalSubscriptions: number;
    newSubscriptions: number;
    canceledSubscriptions: number;
    revenue: number;
    sessionDuration: number;
    storiesPerUser: number;
    commentsPerStory: number;
    aiRequests: number;
    aiCost: number;
    averageResponseTime: number;
  };
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
  createdAt: Date;
  updatedAt: Date;
}

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
      // ...existing code...
    },
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
      // ...existing code...
    },
    metrics: {
      totalUsers: { type: Number, default: 0 },
      newUsers: { type: Number, default: 0 },
      activeUsers: { type: Number, default: 0 },
      childUsers: { type: Number, default: 0 },
      mentorUsers: { type: Number, default: 0 },
      totalStories: { type: Number, default: 0 },
      newStories: { type: Number, default: 0 },
      completedStories: { type: Number, default: 0 },
      publishedStories: { type: Number, default: 0 },
      totalWords: { type: Number, default: 0 },
      averageWordsPerStory: { type: Number, default: 0 },
      totalAssessments: { type: Number, default: 0 },
      averageGrammarScore: { type: Number, default: 0 },
      averageCreativityScore: { type: Number, default: 0 },
      averageOverallScore: { type: Number, default: 0 },
      totalComments: { type: Number, default: 0 },
      newComments: { type: Number, default: 0 },
      resolvedComments: { type: Number, default: 0 },
      totalSubscriptions: { type: Number, default: 0 },
      newSubscriptions: { type: Number, default: 0 },
      canceledSubscriptions: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      sessionDuration: { type: Number, default: 0 },
      storiesPerUser: { type: Number, default: 0 },
      commentsPerStory: { type: Number, default: 0 },
      aiRequests: { type: Number, default: 0 },
      aiCost: { type: Number, default: 0 },
      averageResponseTime: { type: Number, default: 0 },
    },
    tierBreakdown: {
      FREE: { type: Number, default: 0 },
      BASIC: { type: Number, default: 0 },
      PREMIUM: { type: Number, default: 0 },
      PRO: { type: Number, default: 0 },
    },
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

analyticsSchema.index({ date: 1, type: 1 }, { unique: true });
analyticsSchema.index({ type: 1, date: -1 });

analyticsSchema.statics.recordDailyMetrics = async function (): Promise<AnalyticsDocument> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const User = mongoose.model('User');
    const Story = mongoose.model('Story');
    const Comment = mongoose.model('Comment');
    const Subscription = mongoose.model('Subscription');

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
      Subscription.find().populate('userId').lean().exec(),
    ]);

    const tierBreakdown = subscriptions.reduce(
      (acc: { FREE: number; BASIC: number; PREMIUM: number; PRO: number }, sub: any) => {
        const tier = (sub.tier || 'FREE') as 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO';
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      },
      { FREE: 0, BASIC: 0, PREMIUM: 0, PRO: 0 }
    );

    const users = await User.find({ isActive: true }).lean().exec();
    const ageBreakdown = users.reduce(
      (acc: any, user: any) => {
        let ageGroup = 'toddler';
        if (user.age >= 2 && user.age <= 4) ageGroup = 'toddler';
        else if (user.age >= 5 && user.age <= 6) ageGroup = 'preschool';
        else if (user.age >= 7 && user.age <= 9) ageGroup = 'early_elementary';
        else if (user.age >= 10 && user.age <= 12) ageGroup = 'late_elementary';
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

    const tierPrices = { FREE: 0, BASIC: 9.99, PREMIUM: 19.99, PRO: 39.99 };
    const revenue = subscriptions.reduce((total: number, sub: any) => {
      return total + (tierPrices[sub.tier as keyof typeof tierPrices] || 0);
    }, 0);

    const analytics = await this.findOneAndUpdate(
      { date: today, type: 'daily' },
      {
        metrics: {
          totalUsers,
          newUsers,
          activeUsers,
          childUsers: await User.countDocuments({ role: 'child', isActive: true }),
          mentorUsers: await User.countDocuments({ role: 'mentor', isActive: true }),
          totalStories,
          newStories,
          completedStories,
          publishedStories: await Story.countDocuments({ status: 'published' }),
          totalWords,
          averageWordsPerStory,
          totalComments,
          newComments,
          totalSubscriptions: subscriptions.length,
          revenue,
          storiesPerUser: totalUsers > 0 ? totalStories / totalUsers : 0,
          commentsPerStory: totalStories > 0 ? totalComments / totalStories : 0,
          totalAssessments: 0,
          averageGrammarScore: 0,
          averageCreativityScore: 0,
          averageOverallScore: 0,
          resolvedComments: 0,
          newSubscriptions: 0,
          canceledSubscriptions: 0,
          sessionDuration: 0,
          aiRequests: 0,
          aiCost: 0,
          averageResponseTime: 0,
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
  (mongoose.models && mongoose.models.Analytics) ||
  mongoose.model<AnalyticsDocument, AnalyticsModel>('Analytics', analyticsSchema);
export default Analytics;