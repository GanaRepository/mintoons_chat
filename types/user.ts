// types/user.ts - User-related types
export type UserRole = 'child' | 'mentor' | 'admin';

// Update the User interface in types/user.ts
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
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
  subscriptionCurrentPeriodEnd?: Date; // Add this missing property

  // Story tracking
  storyCount: number;
  lastStoryCreated?: Date;

  // Gamification
  totalPoints: number;
  level: number;
  streak: number;
  lastActiveDate?: Date;
  achievements?: string[];
  streakData?: StreakData; // Add this line

  // Mentor-specific fields
  assignedStudents?: string[];
  mentoringSince?: Date;

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
  achievements: string[];
}

export interface UserPreferences {
  emailNotifications: boolean;
  mentorFeedback: boolean;
  achievementNotifications: boolean;
  weeklyReports: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
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
  specializations: string[];
  qualifications: string;
  isApproved: boolean;
}

export interface AdminProfile extends User {
  role: 'admin';
  permissions: string[];
  lastLoginAt?: Date;
  adminSince: Date;
}

export interface UserSearchFilters {
  role?: UserRole;
  subscriptionTier?: string;
  isActive?: boolean;
  ageMin?: number;
  ageMax?: number;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'firstName' | 'storyCount';
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
  subscriptionTier?: string;
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  age?: number;
  bio?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

export interface StreakData {
  current: number;
  longest: number;
  lastStoryDate: Date | null;
  milestones: number[];
  totalRewards: number;
}