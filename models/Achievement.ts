import mongoose, { Schema, Document } from 'mongoose';


export interface AchievementDocument extends Document {
  _id: string;
  name: string;
  description: string;
  icon: string;
  type: 'story_milestone' | 'quality_score' | 'streak' | 'creativity' | 'grammar' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  criteria: AchievementCriteria;
  points: number;
  color: string;
  badgeImage?: string;
  unlockedMessage: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  
  rarityColor: string;
}

export interface UserAchievementDocument extends Document {
  _id: string;
  userId: string;
  achievementId: string;
  achievement: mongoose.Types.ObjectId;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  storyId?: string;
  triggerEvent: string;
  isNotified: boolean;
  notifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  updateProgress(currentValue: number): Promise<void>;
  complete(triggerEvent: string, storyId?: string): Promise<void>;
}

interface AchievementCriteria {
  storiesCompleted?: number;
  grammarScore?: number;
  creativityScore?: number;
  overallScore?: number;
  streakDays?: number;
  totalWords?: number;
  specificGenre?: string;
  timeBasedChallenge?: {
    days: number;
    requirement: string;
  };
  customCriteria?: Record<string, any>;
}

const achievementCriteriaSchema = new Schema(
  {
    storiesCompleted: { type: Number, min: 0 },
    grammarScore: { type: Number, min: 0, max: 100 },
    creativityScore: { type: Number, min: 0, max: 100 },
    overallScore: { type: Number, min: 0, max: 100 },
    streakDays: { type: Number, min: 0 },
    totalWords: { type: Number, min: 0 },
    specificGenre: { type: String },
    timeBasedChallenge: {
      days: { type: Number, min: 1 },
      requirement: { type: String },
    },
    customCriteria: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const achievementSchema = new Schema<AchievementDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Achievement name must be no more than 100 characters'],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Achievement description must be no more than 500 characters'],
    },
    icon: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['story_milestone', 'quality_score', 'streak', 'creativity', 'grammar', 'special'],
      required: true,
    },
    rarity: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      required: true,
      default: 'common',
    },
    criteria: {
      type: achievementCriteriaSchema,
      required: true,
    },
    points: {
      type: Number,
      required: true,
      min: 1,
      max: 1000,
    },
    color: {
      type: String,
      required: true,
      default: 'blue',
    },
    badgeImage: {
      type: String,
      validate: {
        validator: function (v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Badge image must be a valid URL',
      },
    },
    unlockedMessage: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Unlocked message must be no more than 200 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret._id = ret._id.toString();
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

const userAchievementSchema = new Schema<UserAchievementDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    achievementId: {
      type: String,
      required: true,
      index: true,
    },
    achievement: {
      type: Schema.Types.ObjectId,
      ref: 'Achievement',
      required: true,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
    },
    storyId: {
      type: String,
    },
    triggerEvent: {
      type: String,
      required: true,
      trim: true,
    },
    isNotified: {
      type: Boolean,
      default: false,
    },
    notifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
      toJSON: {
      virtuals: true,
      transform: function (doc: any, ret: any) {
        ret._id = ret._id?.toString();
        if (ret.achievement) ret.achievement = ret.achievement.toString();
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

achievementSchema.index({ type: 1, isActive: 1 });
achievementSchema.index({ rarity: 1 });
achievementSchema.index({ sortOrder: 1 });

userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
userAchievementSchema.index({ userId: 1, isCompleted: 1 });
userAchievementSchema.index({ completedAt: -1 });

achievementSchema.virtual('rarityColor').get(function (this: AchievementDocument) {
  const rarityColors = {
    common: '#6B7280',
    uncommon: '#10B981',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B',
  };
  return rarityColors[this.rarity] || '#6B7280';
});

userAchievementSchema.methods.updateProgress = async function (
  this: UserAchievementDocument,
  currentValue: number
): Promise<void> {
  const Achievement = mongoose.model('Achievement');
  const achievement = await Achievement.findById(this.achievement);

  if (!achievement) return;

  let targetValue = 0;
  if (achievement.criteria.storiesCompleted) {
    targetValue = achievement.criteria.storiesCompleted;
  } else if (achievement.criteria.grammarScore) {
    targetValue = achievement.criteria.grammarScore;
  } else if (achievement.criteria.creativityScore) {
    targetValue = achievement.criteria.creativityScore;
  } else if (achievement.criteria.overallScore) {
    targetValue = achievement.criteria.overallScore;
  } else if (achievement.criteria.streakDays) {
    targetValue = achievement.criteria.streakDays;
  } else if (achievement.criteria.totalWords) {
    targetValue = achievement.criteria.totalWords;
  }

  if (targetValue > 0) {
    this.progress = Math.min(100, Math.round((currentValue / targetValue) * 100));

    if (this.progress >= 100 && !this.isCompleted) {
      await this.complete('progress_reached');
    } else {
      await this.save();
    }
  }
};

userAchievementSchema.methods.complete = async function (
  this: UserAchievementDocument,
  triggerEvent: string,
  storyId?: string
): Promise<void> {
  if (this.isCompleted) return;

  this.isCompleted = true;
  this.completedAt = new Date();
  this.triggerEvent = triggerEvent;
  this.progress = 100;

  if (storyId) {
    this.storyId = storyId;
  }

  await this.save();

  const User = mongoose.model('User');
  const Achievement = mongoose.model('Achievement');

  const [user, achievement] = await Promise.all([
    User.findById(this.userId),
    Achievement.findById(this.achievement),
  ]);

  if (user && achievement) {
    await user.addPoints(achievement.points);

    const Notification = mongoose.model('Notification');
    await Notification.create({
      userId: this.userId,
      type: 'achievement_unlocked',
      title: 'Achievement Unlocked!',
      message: achievement.unlockedMessage,
      data: {
        achievementId: achievement._id.toString(),
        achievementName: achievement.name,
        points: achievement.points,
        icon: achievement.icon,
      },
    });
  }
};

userAchievementSchema.statics.checkAndAward = async function (
  userId: string,
  eventType: string,
  eventData: any
) {
  const Achievement = mongoose.model('Achievement');
  const User = mongoose.model('User');

  const user = await User.findById(userId);
  if (!user) return;

  const achievements = await Achievement.find({ isActive: true });

  for (const achievement of achievements) {
    const existingUserAchievement = await this.findOne({
      userId,
      achievementId: achievement._id.toString(),
    });

    if (existingUserAchievement?.isCompleted) continue;

    let shouldAward = false;
    let currentValue = 0;

    if (eventType === 'story_completed' && achievement.criteria.storiesCompleted) {
      currentValue = user.storyCount;
      shouldAward = currentValue >= achievement.criteria.storiesCompleted;
    } else if (eventType === 'assessment_received' && eventData.scores) {
      if (achievement.criteria.grammarScore && eventData.scores.grammar >= achievement.criteria.grammarScore) {
        currentValue = eventData.scores.grammar;
        shouldAward = true;
      } else if (achievement.criteria.creativityScore && eventData.scores.creativity >= achievement.criteria.creativityScore) {
        currentValue = eventData.scores.creativity;
        shouldAward = true;
      } else if (achievement.criteria.overallScore && eventData.scores.overall >= achievement.criteria.overallScore) {
        currentValue = eventData.scores.overall;
        shouldAward = true;
      }
    } else if (eventType === 'streak_updated' && achievement.criteria.streakDays) {
      currentValue = user.streak;
      shouldAward = currentValue >= achievement.criteria.streakDays;
    }

    if (shouldAward) {
      const userAchievement = existingUserAchievement || new this({
        userId,
        achievementId: achievement._id.toString(),
        achievement: achievement._id,
      });

      await userAchievement.complete(eventType, eventData.storyId);
    } else if (existingUserAchievement) {
      await existingUserAchievement.updateProgress(currentValue);
    } else if (currentValue > 0) {
      const userAchievement = new this({
        userId,
        achievementId: achievement._id.toString(),
        achievement: achievement._id,
      });

      await userAchievement.updateProgress(currentValue);
    }
  }
};

export const Achievement =
  mongoose.models.Achievement ||
  mongoose.model<AchievementDocument>('Achievement', achievementSchema);
export const UserAchievement =
  mongoose.models.UserAchievement ||
  mongoose.model<UserAchievementDocument>('UserAchievement', userAchievementSchema);

export default Achievement;
