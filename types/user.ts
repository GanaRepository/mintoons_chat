// types/user.ts - Updated User interface to match the model exactly
export type UserRole = 'child' | 'mentor' | 'admin';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string; // Virtual field from model (firstName + lastName)
  email: string;
  age: number;
  ageGroup: string; // Virtual field from model
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
  subscriptionStatus?:
    | 'active'
    | 'canceled'
    | 'past_due'
    | 'trialing'
    | 'incomplete';
  subscriptionExpires?: Date;
  subscriptionCurrentPeriodEnd?: Date; // Added missing field from model

  // Story tracking
  storyCount: number;
  lastStoryCreated?: Date;

  // Virtual subscription fields
  canCreateStory: boolean; // Virtual from model
  remainingStories: number; // Virtual from model

  // Gamification
  totalPoints: number;
  level: number;
  streak: number;
  lastActiveDate?: Date;
  // Removed: points (duplicate of totalPoints)
  // Removed: achievements (not in model schema)
  // Removed: streakData (not in model schema)

  // Mentor-specific fields
  assignedStudents?: string[] | User[]; // Can be populated or just IDs
  mentoringSince?: Date;

  // Email preferences (matches model structure)
  emailPreferences: UserPreferences;

  // Security fields from model
  lastLoginAt?: Date;
  loginAttempts: number;
  lockUntil?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  bio?: string;
  avatar?: string;
}

export interface UserStats {
  totalStories: number;
  completedStories: number;
  draftStories: number;
  averageScore: number;
  totalWords: number;
  streak: number;
  level: number;
  totalPoints: number;
  achievements: string[]; // Keep here for stats display
}

// Fixed UserPreferences to match model emailPreferences structure
export interface UserPreferences {
  notifications: boolean; // matches model: emailPreferences.notifications
  mentorFeedback: boolean; // matches model: emailPreferences.mentorFeedback
  achievements: boolean; // matches model: emailPreferences.achievements
  weeklyReports: boolean; // matches model: emailPreferences.weeklyReports
  marketing: boolean; // matches model: emailPreferences.marketing
}

export interface UserActivity {
  userId: string;
  action: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface MentorProfile extends User {
  role: 'mentor';
  assignedStudents: string[];
  mentoringSince: Date;
  specializations: string[]; // Not in model - consider adding or removing
  qualifications: string; // Not in model - consider adding or removing
  isApproved: boolean; // Not in model - consider adding or removing
}

export interface AdminProfile extends User {
  role: 'admin';
  permissions: string[]; // Not in model - consider adding or removing
  lastLoginAt?: Date;
  adminSince: Date; // Not in model - consider adding or removing
}

export interface UserSearchFilters {
  role?: UserRole;
  subscriptionTier?: string;
  isActive?: boolean;
  ageMin?: number;
  ageMax?: number;
  search?: string;
  sortBy?:
    | 'createdAt'
    | 'updatedAt'
    | 'firstName'
    | 'storyCount'
    | 'totalPoints';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface UserCreationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age: number;
  role: UserRole;
  parentEmail?: string;
  subscriptionTier?: 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO'; // Added enum constraint
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  age?: number;
  bio?: string;
  avatar?: string;
  emailPreferences?: Partial<UserPreferences>; // Changed from 'preferences' to match model
}

// StreakData - consider if this should be in the User model or separate
export interface StreakData {
  current: number;
  longest: number;
  lastStoryDate: Date | null;
  milestones: number[];
  totalRewards: number;
}
