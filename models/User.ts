import mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, UserPreferences, StreakData } from '../types/user';

export interface UserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age: number;
  role: UserRole;
  subscriptionTier: 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO';
  isActive: boolean;
  emailVerified: boolean;
  avatar?: string;
  bio?: string;
  parentEmail?: string;
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  subscriptionExpires?: Date;
  storyCount: number;
  lastStoryCreated?: Date;
  totalPoints: number;
  level: number;
  streak: number;
  lastActiveDate?: Date;
  assignedStudents?: mongoose.Types.ObjectId[];
  mentoringSince?: Date;
  emailPreferences: UserPreferences;
  lastLoginAt?: Date;
  loginAttempts: number;
  lockUntil?: Date;

  fullName: string;
  ageGroup: string;
  canCreateStory: boolean;
  remainingStories: number;

  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementLoginAttempts(): Promise<UserDocument>;
  resetLoginAttempts(): Promise<void>;
  isLocked(): boolean;
  addPoints(points: number): Promise<void>;
  updateStreak(): Promise<void>;
  incrementStoryCount(): Promise<void>;
}

// Add interface for UserAchievement model with static methods
interface UserAchievementModel extends mongoose.Model<any> {
  checkAndAward(userId: string, eventType: string, eventData: any): Promise<void>;
}

const userPreferencesSchema = new Schema<UserPreferences>(
  {
    notifications: { type: Boolean, default: true },
    mentorFeedback: { type: Boolean, default: true },
    achievements: { type: Boolean, default: true },
    weeklyReports: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new Schema<UserDocument>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters long'],
      maxlength: [50, 'First name must be no more than 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters long'],
      maxlength: [50, 'Last name must be no more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please enter a valid email address',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [2, 'Age must be at least 2'],
      max: [100, 'Age must be no more than 100'],
    },
    role: {
      type: String,
      enum: ['child', 'mentor', 'admin'],
      default: 'child',
      required: true,
    },
    subscriptionTier: {
      type: String,
      enum: ['FREE', 'BASIC', 'PREMIUM', 'PRO'],
      default: 'FREE',
    },
    isActive: {
      type: Boolean,
      default: true,
      // ...existing code...
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      validate: {
        validator: function (v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Avatar must be a valid URL',
      },
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio must be no more than 500 characters'],
      trim: true,
    },
    parentEmail: {
      type: String,
      required: function (this: UserDocument) {
        return this.age < 13;
      },
      validate: {
        validator: function (v: string) {
          return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please enter a valid parent email address',
      },
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
    },
    subscriptionId: {
      type: String,
      sparse: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing', 'incomplete'],
    },
    subscriptionExpires: {
      type: Date,
    },
    storyCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastStoryCreated: {
      type: Date,
    },
    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    streak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
    assignedStudents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    mentoringSince: {
      type: Date,
    },
    emailPreferences: {
      type: userPreferencesSchema,
      default: () => ({
        notifications: true,
        mentorFeedback: true,
        achievements: true,
        weeklyReports: true,
        marketing: false,
      }),
    },
    lastLoginAt: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc: any, ret: any) {
        ret._id = ret._id?.toString();
        if (ret.assignedStudents) {
          ret.assignedStudents = ret.assignedStudents.map((id: any) => id?.toString());
        }
        ret.password = undefined;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ subscriptionTier: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ age: 1 });

userSchema.virtual('fullName').get(function (this: UserDocument) {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('ageGroup').get(function (this: UserDocument) {
  if (this.age >= 2 && this.age <= 4) return 'toddler';
  if (this.age >= 5 && this.age <= 6) return 'preschool';
  if (this.age >= 7 && this.age <= 9) return 'early_elementary';
  if (this.age >= 10 && this.age <= 12) return 'late_elementary';
  if (this.age >= 13 && this.age <= 15) return 'middle_school';
  if (this.age >= 16 && this.age <= 18) return 'high_school';
  return 'unknown';
});

userSchema.virtual('canCreateStory').get(function (this: UserDocument) {
  const limits = { FREE: 3, BASIC: 20, PREMIUM: 50, PRO: 999999 };
  return this.storyCount < limits[this.subscriptionTier];
});

userSchema.virtual('remainingStories').get(function (this: UserDocument) {
  const limits = { FREE: 3, BASIC: 20, PREMIUM: 50, PRO: 999999 };
  return Math.max(0, limits[this.subscriptionTier] - this.storyCount);
});

userSchema.pre('save', async function (this: UserDocument, next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (
  this: UserDocument,
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

userSchema.methods.incrementLoginAttempts = async function (this: UserDocument): Promise<UserDocument> {
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    }).exec();
  }

  const updates: any = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }

  return this.updateOne(updates).exec();
};

userSchema.methods.resetLoginAttempts = async function (this: UserDocument): Promise<void> {
  await this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLoginAt: new Date() },
  }).exec();
};

userSchema.methods.isLocked = function (this: UserDocument): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

userSchema.methods.addPoints = async function (this: UserDocument, points: number): Promise<void> {
  this.totalPoints += points;

  const newLevel = Math.floor(this.totalPoints / 100) + 1;
  if (newLevel > this.level) {
    const oldLevel = this.level;
    this.level = newLevel;

    const Notification = mongoose.model('Notification');
    await Notification.create({
      userId: this._id.toString(),
      type: 'system_announcement',
      title: 'Level Up!',
      message: `Congratulations! You've reached level ${newLevel}!`,
      data: {
        oldLevel,
        newLevel,
        totalPoints: this.totalPoints,
      },
    });
  }

  await this.save();
};

userSchema.methods.updateStreak = async function (this: UserDocument): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = this.lastActiveDate ? new Date(this.lastActiveDate) : null;
  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
  }

  if (!lastActive || lastActive.getTime() === today.getTime()) {
    this.streak += 1;
  } else {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastActive.getTime() !== yesterday.getTime()) {
      this.streak = 1;
    }
  }

  this.lastActiveDate = new Date();
  await this.save();

  const UserAchievement = mongoose.model('UserAchievement') as UserAchievementModel;
  await UserAchievement.checkAndAward(this._id.toString(), 'streak_updated', {
    streak: this.streak,
  });
};

userSchema.methods.incrementStoryCount = async function (this: UserDocument): Promise<void> {
  this.storyCount += 1;
  this.lastStoryCreated = new Date();
  await this.save();

  const UserAchievement = mongoose.model('UserAchievement') as UserAchievementModel;
  await UserAchievement.checkAndAward(this._id.toString(), 'story_completed', {
    storyCount: this.storyCount,
  });
};

const User =
  mongoose.models.User ||
  mongoose.model<UserDocument>('User', userSchema);
export default User;