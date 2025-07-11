// types/gamification.ts
import type { Achievement } from './achievement';

export type RewardType =
  | 'achievement'
  | 'level_up'
  | 'streak'
  | 'points'
  | 'special';

export interface Reward {
  id: string;
  type: RewardType;
  title: string;
  description: string;
  points?: number;

  // Achievement-specific
  achievement?: Achievement;

  // Level-specific
  newLevel?: number;
  previousLevel?: number;

  // Streak-specific
  streakDays?: number;

  // Special reward data
  specialData?: Record<string, any>;

  // Metadata
  createdAt: Date;
  claimedAt?: Date;
  isClaimed?: boolean;
}

export interface RewardNotification {
  id: string;
  userId: string;
  reward: Reward;
  isRead: boolean;
  createdAt: Date;
}

export interface GamificationEvent {
  type:
    | 'achievement_unlocked'
    | 'level_up'
    | 'streak_milestone'
    | 'points_earned';
  userId: string;
  data: Record<string, any>;
  timestamp: Date;
}
