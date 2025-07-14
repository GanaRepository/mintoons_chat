export type AchievementType =
  | 'story_milestone'
  | 'quality_score'
  | 'streak'
  | 'creativity'
  | 'grammar'
  | 'special';

export type AchievementRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary';

export interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  type: AchievementType;
  rarity: AchievementRarity;
  criteria: AchievementCriteria;
  points: number;
  color: string;
  badgeImage?: string;
  unlockedMessage: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields from model
  rarityColor: string;
}

export interface AchievementCriteria {
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

export interface UserAchievement {
  _id: string;
  userId: string;
  achievementId: string;
  achievement: string; // ObjectId reference, not populated object
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  storyId?: string;
  triggerEvent: string;
  isNotified: boolean;
  notifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// For when achievement is populated
export interface UserAchievementWithPopulated extends Omit<UserAchievement, 'achievement'> {
  achievement: Achievement;
}

export interface AchievementProgress {
  current: number;
  target: number;
}

export interface UserLevel {
  currentLevel: number;
  totalPoints: number;
  pointsInCurrentLevel: number;
  pointsToNextLevel: number;
  levelProgress: number;
  levelBenefits: string[];
  nextLevelBenefits: string[];
}

export interface Streak {
  type: 'daily_writing' | 'quality_scores' | 'improvement';
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  isActive: boolean;
  streakRewards: StreakReward[];
}

export interface StreakReward {
  days: number;
  reward: string;
  points: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAge: number;
  avatar?: string;
  position: number;
  score: number;
  change: number;
  category: 'points' | 'stories' | 'creativity' | 'grammar';
}

export interface Leaderboard {
  category: string;
  timeframe: 'weekly' | 'monthly' | 'all_time';
  ageGroup?: string;
  entries: LeaderboardEntry[];
  userPosition?: number;
  lastUpdated: Date;
}

export interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirements: string;
  isRare: boolean;
  pointValue: number;
}

export interface UserBadge {
  badgeId: string;
  badge: Badge;
  earnedAt: Date;
  storyId?: string;
  displayOnProfile: boolean;
}

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  requirements: {
    storiesRequired?: number;
    minWordCount?: number;
    specificGenre?: string;
    qualityThreshold?: number;
    timeLimit?: number;
  };
  rewards: {
    points: number;
    badges: string[];
    specialPerks: string[];
  };
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  participantCount: number;
  completionCount: number;
  createdAt: Date;
}

export interface UserChallenge {
  _id: string;
  userId: string;
  challengeId: string;
  challenge: Challenge;
  isParticipating: boolean;
  progress: Record<string, any>;
  isCompleted: boolean;
  completedAt?: Date;
  rewardsClaimed: boolean;
  claimedAt?: Date;
  joinedAt: Date;
}

export interface GamificationStats {
  totalPoints: number;
  currentLevel: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  currentStreak: number;
  longestStreak: number;
  badgesEarned: number;
  challengesCompleted: number;
  leaderboardPosition?: number;
  pointsThisWeek: number;
  pointsThisMonth: number;
}

export interface AchievementNotification {
  _id: string;
  userId: string;
  achievementId: string;
  type: 'unlocked' | 'progress' | 'milestone';
  title: string;
  message: string;
  points?: number;
  isRead: boolean;
  createdAt: Date;
}