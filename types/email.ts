export type EmailType =
  | 'welcome'
  | 'password_reset'
  | 'story_completed'
  | 'mentor_comment'
  | 'achievement_unlocked'
  | 'weekly_progress'
  | 'subscription_reminder'
  | 'subscription_expired';

export interface EmailTemplate {
  _id: string;
  name: string;
  type: EmailType;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailData {
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
  templateId?: string;
  variables?: Record<string, any>;
}

export interface WelcomeEmailData {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  subscriptionTier: string;
  loginUrl: string;
  supportEmail: string;
}

export interface PasswordResetEmailData {
  firstName: string;
  email: string;
  resetToken: string;
  resetUrl: string;
  expiresIn: string;
  supportEmail: string;
}

export interface StoryCompletedEmailData {
  firstName: string;
  storyTitle: string;
  storyUrl: string;
  wordCount: number;
  grammarScore: number;
  creativityScore: number;
  overallScore: number;
  encouragement: string;
  nextStoryUrl: string;
}

export interface MentorCommentEmailData {
  firstName: string;
  storyTitle: string;
  mentorName: string;
  commentPreview: string;
  commentType: string;
  storyUrl: string;
  commentsCount: number;
}

export interface AchievementUnlockedEmailData {
  firstName: string;
  achievementName: string;
  achievementDescription: string;
  achievementIcon: string;
  pointsEarned: number;
  totalPoints: number;
  currentLevel: number;
  progressUrl: string;
}

export interface WeeklyProgressEmailData {
  firstName: string;
  weeklyStats: {
    storiesCompleted: number;
    wordsWritten: number;
    averageScore: number;
    streak: number;
    achievementsUnlocked: number;
  };
  highlights: string[];
  improvementAreas: string[];
  nextWeekGoals: string[];
  dashboardUrl: string;
}

export interface SubscriptionReminderEmailData {
  firstName: string;
  subscriptionTier: string;
  storiesUsed: number;
  storyLimit: number;
  daysUntilReset: number;
  upgradeUrl: string;
  currentUsagePercentage: number;
}

export interface SubscriptionExpiredEmailData {
  firstName: string;
  expiredTier: string;
  newTier: string;
  renewUrl: string;
  supportEmail: string;
  gracePeriodDays: number;
}

export interface EmailQueue {
  _id: string;
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
  type: EmailType;

  status: 'pending' | 'sending' | 'sent' | 'failed' | 'retry';
  attempts: number;
  maxAttempts: number;

  scheduledFor: Date;
  sentAt?: Date;

  error?: string;
  lastAttemptAt?: Date;

  userId?: string;
  metadata: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export interface EmailStats {
  totalSent: number;
  totalFailed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;

 statsByType: Record<EmailType, {
  sent: number;
  failed: number;
  opened: number;
  clicked: number;
}>;

recentActivity: Array<{
  date: Date;
  sent: number;
  failed: number;
}>;

}

export interface EmailPreferences {
  userId: string;
  emailNotifications: boolean;
  storyCompletionEmails: boolean;
  mentorCommentEmails: boolean;
  achievementEmails: boolean;
  weeklyProgressEmails: boolean;
  marketingEmails: boolean;
  reminderEmails: boolean;

  digestFrequency: 'immediate' | 'daily' | 'weekly' | 'never';

  unsubscribedFrom: EmailType[];
  unsubscribedAt?: Date;

  updatedAt: Date;
}

export interface EmailCampaign {
  _id: string;
  name: string;
  type: EmailType;
  subject: string;
  content: string;

  targetAudience: {
    ageMin?: number;
    ageMax?: number;
    subscriptionTiers?: string[];
    userRoles?: string[];
    registeredAfter?: Date;
    registeredBefore?: Date;
    lastActiveAfter?: Date;
    hasCompletedStories?: boolean;
  };

  scheduledFor: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';

  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  openCount: number;
  clickCount: number;
  unsubscribeCount: number;

  createdAt: Date;
  sentAt?: Date;
  completedAt?: Date;
}

export interface EmailAnalytics {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;

  metrics: {
    totalEmails: number;
    deliveredEmails: number;
    openedEmails: number;
    clickedEmails: number;
    bouncedEmails: number;
    unsubscribedEmails: number;

    deliveryRate: number;
    openRate: number;
    clickThroughRate: number;
    bounceRate: number;
    unsubscribeRate: number;
  };

  trends: Array<{
    date: Date;
    sent: number;
    opened: number;
    clicked: number;
  }>;

  topPerformingTemplates: Array<{
    templateId: string;
    templateName: string;
    openRate: number;
    clickRate: number;
    sentCount: number;
  }>;
}