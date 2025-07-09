// types/index.ts - Main type exports
export * from './auth';
export * from './user';
export * from './story';
export * from './subscription';
export * from './ai';
export * from './assessment';
export * from './comment';
export * from './achievement';
export * from './email';

// Re-export commonly used types
export type { User, UserRole, UserProfile } from './user';
export type { Story, StoryStatus, StoryElement } from './story';
export type { SubscriptionTier, SubscriptionStatus } from './subscription';
export type { AIProvider, AIResponse } from './ai';
export type { Comment, CommentType } from './comment';
export type { Achievement, AchievementType } from './achievement';
