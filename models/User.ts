// models/User.ts - User model with role-based features
import mongoose, { Schema, Document } from 'mongoose';
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

  // Subscription details
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
  subscriptionExpires?: Date;
  subscriptionCurrentPeriodEnd?: Date;

  // Story tracking
  storyCount: number;
  lastStoryCreated?: Date;

  // Gamification
  totalPoints: number;
  level: number;
  streak: number;
  lastActiveDate?: Date;
  points?: number;
  achievements?: string[];
  streakData?: StreakData;

  // Mentor-specific fields
  assignedStudents?: mongoose.Types.ObjectId[] | UserDocument[];
  mentoringSince?: Date;

  // Email preferences
  emailPreferences: UserPreferences;

  // Security
  lastLoginAt?: Date;
  loginAttempts: number;
  lockUntil?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementStoryCount(): Promise<void>;
  updateStreak(): Promise<void>;
  addPoints(points: number): Promise<void>;
}

// Static methods interface
interface UserModel extends mongoose.Model<UserDocument> {
  findByEmail(email: string): Promise<UserDocument | null>;
  getLeaderboard(ageGroup?: string, limit?: number): Promise<UserDocument[]>;
}

const userSchema = new Schema<UserDocument>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name must be no more than 50 characters'],
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name must be no more than 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include in queries by default
    },

    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [2, 'Age must be at least 2'],
      max: [18, 'Age must be no more than 18'],
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
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
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
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid parent email',
      ],
      required: function (this: UserDocument) {
        return this.age < 13; // COPPA compliance
      },
    },

    // Subscription details
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
      default: 'active',
    },

    subscriptionExpires: {
      type: Date,
    },

    // Story tracking
    storyCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastStoryCreated: {
      type: Date,
    },

    // Gamification
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

    // Mentor-specific fields
    assignedStudents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    mentoringSince: {
      type: Date,
      required: function (this: UserDocument) {
        return this.role === 'mentor';
      },
    },

    // Email preferences
    emailPreferences: {
      notifications: { type: Boolean, default: true },
      mentorFeedback: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },

    // Security
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
      transform: function (doc, ret) {
        delete (ret as any).password;
        delete (ret as any).__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ subscriptionTier: 1 });
userSchema.index({ totalPoints: -1 }); // For leaderboards
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function (this: UserDocument) {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age group
userSchema.virtual('ageGroup').get(function (this: UserDocument) {
  if (this.age >= 2 && this.age <= 4) return 'toddler';
  if (this.age >= 5 && this.age <= 6) return 'preschool';
  if (this.age >= 7 && this.age <= 9) return 'early_elementary';
  if (this.age >= 10 && this.age <= 12) return 'late_elementary';
  if (this.age >= 13 && this.age <= 15) return 'middle_school';
  if (this.age >= 16 && this.age <= 18) return 'high_school';
  return 'unknown';
});

// Virtual for subscription status
userSchema.virtual('canCreateStory').get(function (this: UserDocument) {
  try {
    const { SubscriptionConfig } = require('@config/subscription');
    return SubscriptionConfig.canCreateStory(
      this.subscriptionTier,
      this.storyCount
    );
  } catch (error) {
    // Fallback if config is not available
    const limits: Record<string, number> = {
      FREE: 50,
      BASIC: 100,
      PREMIUM: 200,
      PRO: 300,
    };
    return this.storyCount < (limits[this.subscriptionTier] || 50);
  }
});

// Virtual for remaining stories
userSchema.virtual('remainingStories').get(function (this: UserDocument) {
  try {
    const { SubscriptionConfig } = require('@config/subscription');
    return SubscriptionConfig.getRemainingStories(
      this.subscriptionTier,
      this.storyCount
    );
  } catch (error) {
    // Fallback if config is not available
    const limits: Record<string, number> = {
      FREE: 50,
      BASIC: 100,
      PREMIUM: 200,
      PRO: 300,
    };
    return Math.max(0, (limits[this.subscriptionTier] || 50) - this.storyCount);
  }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (this: UserDocument, next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware to set mentoringSince for new mentors
userSchema.pre('save', function (this: UserDocument, next) {
  if (this.isNew && this.role === 'mentor' && !this.mentoringSince) {
    this.mentoringSince = new Date();
  }
  next();
});

// Method to compare password
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

// Method to increment story count
userSchema.methods.incrementStoryCount = async function (
  this: UserDocument
): Promise<void> {
  this.storyCount += 1;
  this.lastStoryCreated = new Date();
  await this.save();
};

// Method to update writing streak
userSchema.methods.updateStreak = async function (
  this: UserDocument
): Promise<void> {
  const today = new Date();
  const lastActive = this.lastActiveDate || new Date(0);
  const daysDiff = Math.floor(
    (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff === 1) {
    // Consecutive day - increment streak
    this.streak += 1;
  } else if (daysDiff > 1) {
    // Streak broken - reset to 1
    this.streak = 1;
  }
  // If daysDiff === 0, user already active today, don't change streak

  this.lastActiveDate = today;
  await this.save();
};

// Method to add points and calculate level
userSchema.methods.addPoints = async function (
  this: UserDocument,
  points: number
): Promise<void> {
  this.totalPoints += points;

  // Calculate level (every 100 points = 1 level)
  const newLevel = Math.floor(this.totalPoints / 100) + 1;
  if (newLevel > this.level) {
    this.level = newLevel;
    // Could emit level up event here
  }

  await this.save();
};

// Static method to find by email - simplified typing
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

// Static method to get leaderboard - simplified typing
userSchema.statics.getLeaderboard = function (
  ageGroup?: string,
  limit: number = 10
) {
  const match: any = { isActive: true, role: 'child' };

  if (ageGroup) {
    const ageRanges: Record<string, [number, number]> = {
      toddler: [2, 4],
      preschool: [5, 6],
      early_elementary: [7, 9],
      late_elementary: [10, 12],
      middle_school: [13, 15],
      high_school: [16, 18],
    };

    const ageRange = ageRanges[ageGroup];
    if (ageRange) {
      const [min, max] = ageRange;
      match.age = { $gte: min, $lte: max };
    }
  }

  return this.find(match)
    .sort({ totalPoints: -1, createdAt: 1 })
    .limit(limit)
    .select(
      'firstName lastName totalPoints level streak storyCount avatar age'
    );
};

// Export the model - simplified typing
const User =
  mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);
export default User;
