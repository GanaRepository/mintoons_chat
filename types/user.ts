export type UserRole = 'child' | 'mentor' | 'admin';

export interface UserPreferences {
  notifications: boolean;
  mentorFeedback: boolean;
  achievements: boolean;
  weeklyReports: boolean;
  marketing: boolean;
}

export interface StreakData {
  current: number;
  longest: number;
  lastStoryDate: Date | null;
  milestones: number[];
  totalRewards: number;
}

export interface User {
  _id: string;
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

  assignedStudents?: string[];
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
}

export interface UserWithAssignedStudents extends Omit<User, 'assignedStudents'> {
  assignedStudents: User[];
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
  subscriptionTier?: 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO';
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  age?: number;
  bio?: string;
  avatar?: string;
  emailPreferences?: Partial<UserPreferences>;
}