// lib/analytics/tracker.ts - User/system activity tracking
import { connectDB } from '@lib/database/connection';
import Analytics from '@models/Analytics';
import mongoose from 'mongoose';

interface TrackingEvent {
  eventType: string;
  userId?: string;
  data: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  path?: string;
  referrer?: string;
}

// Define interfaces for better type safety
interface EventCounts {
  [eventType: string]: number;
}

interface UserEvents {
  [eventType: string]: Set<string>;
}

interface SessionAnalytics {
  totalEvents: number;
  eventTypes: EventCounts;
  sessions: Record<string, any[]>;
  dailyActivity: Record<string, number>;
  mostActiveHours: Record<number, number>;
}

interface EventLogDocument {
  eventType: string;
  userId?: string;
  data: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  path?: string;
  referrer?: string;
}

// Event types for tracking
export const TRACKING_EVENTS = {
  // User events
  USER_REGISTER: 'user_register',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',

  // Story events
  STORY_CREATE: 'story_create',
  STORY_EDIT: 'story_edit',
  STORY_COMPLETE: 'story_complete',
  STORY_PUBLISH: 'story_publish',
  STORY_DELETE: 'story_delete',
  STORY_VIEW: 'story_view',
  STORY_LIKE: 'story_like',
  STORY_SHARE: 'story_share',

  // AI events
  AI_RESPONSE: 'ai_response',
  AI_ASSESSMENT: 'ai_assessment',
  AI_COST: 'ai_cost',

  // Subscription events
  SUBSCRIPTION_UPGRADE: 'subscription_upgrade',
  SUBSCRIPTION_DOWNGRADE: 'subscription_downgrade',
  SUBSCRIPTION_CANCEL: 'subscription_cancel',
  SUBSCRIPTION_RENEW: 'subscription_renew',

  // Engagement events
  PAGE_VIEW: 'page_view',
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  DOWNLOAD: 'download',

  // Achievement events
  ACHIEVEMENT_UNLOCK: 'achievement_unlock',
  LEVEL_UP: 'level_up',
  STREAK_BROKEN: 'streak_broken',
  STREAK_MILESTONE: 'streak_milestone',

  // Comment events
  COMMENT_CREATE: 'comment_create',
  COMMENT_REPLY: 'comment_reply',
  COMMENT_HELPFUL: 'comment_helpful',

  // Error events
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
  PAYMENT_FAILED: 'payment_failed',
} as const;

export class AnalyticsTracker {
  private eventQueue: TrackingEvent[] = [];
  private isProcessing = false;
  private batchSize = 50;
  private flushInterval = 5000; // 5 seconds

  constructor() {
    // Start the flush interval
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Track a user event
   */
  async trackEvent(
    eventType: string,
    data: Record<string, any> = {},
    userId?: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string,
    path?: string,
    referrer?: string
  ): Promise<void> {
    try {
      const event: TrackingEvent = {
        eventType,
        data,
        timestamp: new Date(),
        userId,
        sessionId,
        ipAddress,
        userAgent,
        path,
        referrer,
      };

      // Add to queue
      this.eventQueue.push(event);

      // If queue is full, flush immediately
      if (this.eventQueue.length >= this.batchSize) {
        await this.flush();
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  /**
   * Track page view
   */
  async trackPageView(
    path: string,
    userId?: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string,
    referrer?: string
  ): Promise<void> {
    await this.trackEvent(
      TRACKING_EVENTS.PAGE_VIEW,
      { path },
      userId,
      sessionId,
      ipAddress,
      userAgent,
      path,
      referrer
    );
  }

  /**
   * Track story events
   */
  async trackStoryEvent(
    action:
      | 'create'
      | 'edit'
      | 'complete'
      | 'publish'
      | 'delete'
      | 'view'
      | 'like'
      | 'share',
    storyId: string,
    data: Record<string, any> = {},
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    const eventType = `story_${action}`;
    await this.trackEvent(eventType, { storyId, ...data }, userId, sessionId);
  }

  /**
   * Track AI usage
   */
  async trackAIUsage(
    type: 'response' | 'assessment',
    provider: string,
    model: string,
    tokensUsed: number,
    cost: number,
    userId?: string,
    storyId?: string
  ): Promise<void> {
    await this.trackEvent(
      type === 'response'
        ? TRACKING_EVENTS.AI_RESPONSE
        : TRACKING_EVENTS.AI_ASSESSMENT,
      {
        provider,
        model,
        tokensUsed,
        cost,
        storyId,
      },
      userId
    );
  }

  /**
   * Track subscription events
   */
  async trackSubscriptionEvent(
    action: 'upgrade' | 'downgrade' | 'cancel' | 'renew',
    fromTier: string,
    toTier: string,
    userId: string,
    amount?: number
  ): Promise<void> {
    const eventType = `subscription_${action}`;
    await this.trackEvent(
      eventType,
      {
        fromTier,
        toTier,
        amount,
      },
      userId
    );
  }

  /**
   * Track user actions
   */
  async trackUserAction(
    action: 'register' | 'login' | 'logout',
    userId: string,
    data: Record<string, any> = {},
    sessionId?: string,
    ipAddress?: string
  ): Promise<void> {
    const eventType = `user_${action}`;
    await this.trackEvent(eventType, data, userId, sessionId, ipAddress);
  }

  /**
   * Track achievements
   */
  async trackAchievementEvent(
    action: 'unlock' | 'level_up' | 'streak_broken' | 'streak_milestone',
    userId: string,
    data: Record<string, any> = {}
  ): Promise<void> {
    const eventType =
      action === 'unlock'
        ? TRACKING_EVENTS.ACHIEVEMENT_UNLOCK
        : action === 'level_up'
          ? TRACKING_EVENTS.LEVEL_UP
          : action === 'streak_broken'
            ? TRACKING_EVENTS.STREAK_BROKEN
            : TRACKING_EVENTS.STREAK_MILESTONE;

    await this.trackEvent(eventType, data, userId);
  }

  /**
   * Track errors
   */
  async trackError(
    error: Error,
    context: string,
    userId?: string,
    data: Record<string, any> = {}
  ): Promise<void> {
    await this.trackEvent(
      TRACKING_EVENTS.ERROR_OCCURRED,
      {
        error: error.message,
        stack: error.stack,
        context,
        ...data,
      },
      userId
    );
  }

  /**
   * Flush events to database
   */
  private async flush(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const eventsToProcess = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await connectDB();

      // Group events by day for analytics aggregation
      const eventsByDay: Record<string, TrackingEvent[]> = {};

      eventsToProcess.forEach((event: TrackingEvent) => {
        const dateKey = event.timestamp
          ? event.timestamp.toISOString().split('T')[0]
          : null;
        if (dateKey) {
          if (!eventsByDay[dateKey]) {
            eventsByDay[dateKey] = [];
          }
          eventsByDay[dateKey].push(event);
        } else {
          console.warn('Event with invalid timestamp:', event);
        }
      });

      // Process each day's events
      for (const [dateKey, dayEvents] of Object.entries(eventsByDay)) {
        await this.processEventsForDay(dateKey, dayEvents);
      }
    } catch (error) {
      console.error('Error flushing analytics events:', error);

      // Re-add events to queue if processing failed
      this.eventQueue.unshift(...eventsToProcess);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process events for a specific day
   */
  private async processEventsForDay(
    dateKey: string,
    events: TrackingEvent[]
  ): Promise<void> {
    const date = new Date(dateKey);
    date.setHours(0, 0, 0, 0);

    // Aggregate events by type
    const eventCounts: EventCounts = {};
    const userEvents: UserEvents = {};
    let totalEvents = 0;

    events.forEach((event: TrackingEvent) => {
      totalEvents++;

      // Count events by type
      eventCounts[event.eventType] = (eventCounts[event.eventType] || 0) + 1;

      // Track unique users per event type
      if (event.userId) {
        if (!userEvents[event.eventType]) {
          userEvents[event.eventType] = new Set<string>();
        }
        userEvents[event.eventType]!.add(event.userId);
      }
    });

    // Update analytics record with proper type casting
    await (Analytics as any).findOneAndUpdate(
      { date, type: 'daily' },
      {
        $inc: {
          'metrics.totalEvents': totalEvents,
          ...Object.fromEntries(
            Object.entries(eventCounts).map(
              ([eventType, count]: [string, number]) => [
                `eventCounts.${eventType}`,
                count,
              ]
            )
          ),
        },
        $set: {
          lastUpdated: new Date(),
        },
      },
      { upsert: true }
    );

    // Store individual events for detailed analysis (optional, for recent events only)
    const recentEvents = events.filter((event: TrackingEvent) => {
      const eventAge = Date.now() - event.timestamp.getTime();
      return eventAge < 7 * 24 * 60 * 60 * 1000; // Keep for 7 days
    });

    if (recentEvents.length > 0) {
      try {
        // Get or create EventLog model
        const EventLog = this.getEventLogModel();
        await (EventLog as any).insertMany(recentEvents);
      } catch (error) {
        console.error('Error inserting events to EventLog:', error);
      }
    }
  }

  /**
   * Get or create EventLog model
   */
  private getEventLogModel() {
    if (mongoose.models.EventLog) {
      return mongoose.models.EventLog;
    }

    const eventLogSchema = new mongoose.Schema(
      {
        eventType: { type: String, required: true, index: true },
        userId: { type: String, index: true },
        data: { type: mongoose.Schema.Types.Mixed, default: {} },
        timestamp: { type: Date, required: true, index: true },
        sessionId: { type: String, index: true },
        ipAddress: String,
        userAgent: String,
        path: String,
        referrer: String,
      },
      {
        timestamps: true,
      }
    );

    // Add indexes for better query performance
    eventLogSchema.index({ eventType: 1, timestamp: -1 });
    eventLogSchema.index({ userId: 1, timestamp: -1 });
    eventLogSchema.index({ sessionId: 1, timestamp: -1 });

    return mongoose.model<EventLogDocument>('EventLog', eventLogSchema);
  }

  /**
   * Get user session analytics
   */
  async getUserSessionAnalytics(
    userId: string,
    days: number = 30
  ): Promise<SessionAnalytics | null> {
    try {
      await connectDB();

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const EventLog = this.getEventLogModel();

      const userEvents = await (EventLog as any)
        .find({
          userId,
          timestamp: { $gte: startDate },
        })
        .sort({ timestamp: -1 })
        .lean()
        .exec();

      if (!userEvents || userEvents.length === 0) {
        return {
          totalEvents: 0,
          eventTypes: {},
          sessions: {},
          dailyActivity: {},
          mostActiveHours: {},
        };
      }

      // Analyze user behavior
      const sessionAnalytics: SessionAnalytics = {
        totalEvents: userEvents.length,
        eventTypes: {},
        sessions: {},
        dailyActivity: {},
        mostActiveHours: {},
      };

      (userEvents as EventLogDocument[]).forEach((event: EventLogDocument) => {
        // Count by event type
        sessionAnalytics.eventTypes[event.eventType] =
          (sessionAnalytics.eventTypes[event.eventType] || 0) + 1;

        // Group by session
        if (event.sessionId) {
          if (!sessionAnalytics.sessions[event.sessionId]) {
            sessionAnalytics.sessions[event.sessionId] = [];
          }
          sessionAnalytics.sessions[event.sessionId]!.push(event);
        }

        // Daily activity
        const dateKey = event.timestamp
          ? event.timestamp.toISOString().split('T')[0]
          : '';
        if (dateKey) {
          sessionAnalytics.dailyActivity[dateKey] =
            (sessionAnalytics.dailyActivity[dateKey] || 0) + 1;
        }

        // Hour of day activity
        const hour = event.timestamp ? event.timestamp.getHours() : 0;
        sessionAnalytics.mostActiveHours[hour] =
          (sessionAnalytics.mostActiveHours[hour] || 0) + 1;
      });

      return sessionAnalytics;
    } catch (error) {
      console.error('Error getting user session analytics:', error);
      return null;
    }
  }

  /**
   * Get event statistics for a date range
   */
  async getEventStatistics(
    startDate: Date,
    endDate: Date,
    eventTypes?: string[]
  ): Promise<{
    totalEvents: number;
    eventsByType: EventCounts;
    uniqueUsers: number;
    topUsers: Array<{ userId: string; eventCount: number }>;
  } | null> {
    try {
      await connectDB();

      const EventLog = this.getEventLogModel();

      const matchCriteria: any = {
        timestamp: { $gte: startDate, $lte: endDate },
      };

      if (eventTypes && eventTypes.length > 0) {
        matchCriteria.eventType = { $in: eventTypes };
      }

      const [eventStats, uniqueUsers, topUsers] = await Promise.all([
        // Event counts by type
        (EventLog as any).aggregate([
          { $match: matchCriteria },
          { $group: { _id: '$eventType', count: { $sum: 1 } } },
        ]),

        // Unique users count
        (EventLog as any).distinct('userId', matchCriteria),

        // Top users by event count
        (EventLog as any).aggregate([
          { $match: { ...matchCriteria, userId: { $exists: true } } },
          { $group: { _id: '$userId', eventCount: { $sum: 1 } } },
          { $sort: { eventCount: -1 } },
          { $limit: 10 },
          { $project: { userId: '$_id', eventCount: 1, _id: 0 } },
        ]),
      ]);

      const eventsByType: EventCounts = {};
      let totalEvents = 0;

      (eventStats as any[]).forEach((stat: any) => {
        eventsByType[stat._id] = stat.count;
        totalEvents += stat.count;
      });

      return {
        totalEvents,
        eventsByType,
        uniqueUsers: (uniqueUsers as string[]).length,
        topUsers: topUsers as Array<{ userId: string; eventCount: number }>,
      };
    } catch (error) {
      console.error('Error getting event statistics:', error);
      return null;
    }
  }

  /**
   * Clean up old events
   */
  async cleanupOldEvents(daysToKeep: number = 30): Promise<void> {
    try {
      await connectDB();

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const EventLog = this.getEventLogModel();
      const result = await (EventLog as any).deleteMany({
        timestamp: { $lt: cutoffDate },
      });

      const deletedCount =
        result && typeof result.deletedCount === 'number'
          ? result.deletedCount
          : 0;
      console.log(`Cleaned up ${deletedCount} old events`);
    } catch (error) {
      console.error('Error cleaning up old events:', error);
    }
  }

  /**
   * Force flush events (for testing/shutdown)
   */
  async forceFlush(): Promise<void> {
    await this.flush();
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.eventQueue.length;
  }

  /**
   * Check if currently processing
   */
  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }
}

// Export singleton instance
export const analyticsTracker = new AnalyticsTracker();
