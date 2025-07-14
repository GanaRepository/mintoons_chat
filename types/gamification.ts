import type { Achievement } from './achievement';

export type RewardType =
  | 'achievement'
  | 'level_up'
  | 'streak'
  | 'points'
  | 'special';

export interface Reward {
  _id: string;
  type: RewardType;
  title: string;
  description: string;
  points?: number;

  achievement?: Achievement;

  newLevel?: number;
  previousLevel?: number;

  streakDays?: number;

  specialData?: Record<string, any>;

  createdAt: Date;
  claimedAt?: Date;
  isClaimed?: boolean;
}

export interface RewardNotification {
  _id: string;
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