export type NotificationType =
  | 'story_completed'
  | 'mentor_comment'
  | 'achievement_unlocked'
  | 'subscription_expiring'
  | 'weekly_progress'
  | 'system_announcement';

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  priority: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationCreateData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: number;
  expiresAt?: Date;
}

export interface NotificationFilters {
  userId?: string;
  type?: NotificationType;
  isRead?: boolean;
  priority?: number;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'createdAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}