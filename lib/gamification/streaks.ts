// lib/gamification/streaks.ts - Writing streak system
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import { Notification } from '@models/Notification';
import { achievementManager } from './achievement';
import { webSocketManager } from '@lib/realtime/websockets';
import { sendEmail } from '@lib/email/sender';

export class StreakManager {
  /**
   * Update user's writing streak
   */
  async updateStreak(userId: string): Promise<{
    streak: number;
    streakUpdated: boolean;
    streakBroken: boolean;
  }> {
    try {
      await connectDB();

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastActive = user.lastActiveDate || new Date(0);
      lastActive.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      );

      let streakUpdated = false;
      let streakBroken = false;

      // Already active today, no change
      if (daysDiff === 0) {
        return {
          streak: user.streak,
          streakUpdated: false,
          streakBroken: false,
        };
      }

      // Consecutive day, increment streak
      if (daysDiff === 1) {
        user.streak += 1;
        streakUpdated = true;
      }
      // Streak broken, reset to 1
      else if (daysDiff > 1) {
        // Only consider it broken if they had a streak
        if (user.streak > 1) {
          streakBroken = true;
        }
        user.streak = 1;
        streakUpdated = true;
      }

      // Update last active date
      user.lastActiveDate = today;
      await user.save();

      // Check for streak achievements
      if (streakUpdated) {
        await achievementManager.checkAndAwardAchievements(
          userId,
          'streak_updated',
          { streak: user.streak }
        );

        // Notify about milestone streaks
        if (
          user.streak === 3 ||
          user.streak === 7 ||
          user.streak === 14 ||
          user.streak === 30 ||
          user.streak === 60 ||
          user.streak === 100
        ) {
          await this.notifyStreakMilestone(user);
        }
      }

      // Notify about broken streak
      if (streakBroken) {
        await this.notifyStreakBroken(user, daysDiff);
      }

      return {
        streak: user.streak,
        streakUpdated,
        streakBroken,
      };
    } catch (error) {
      console.error('Error updating streak:', error);
      return {
        streak: 0,
        streakUpdated: false,
        streakBroken: false,
      };
    }
  }

  /**
   * Get user's current streak and status
   */
  async getStreakStatus(userId: string): Promise<{
    currentStreak: number;
    lastActiveDate: Date;
    isActiveToday: boolean;
    daysUntilBreak: number;
    longestStreak: number;
  }> {
    try {
      await connectDB();

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastActive = user.lastActiveDate || new Date(0);
      lastActive.setHours(0, 0, 0, 0);

      const isActiveToday = today.getTime() === lastActive.getTime();

      // Calculate days until streak breaks
      let daysUntilBreak = 0;
      if (isActiveToday) {
        daysUntilBreak = 1; // They need to write tomorrow
      } else {
        const daysDiff = Math.floor(
          (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff === 1) {
          daysUntilBreak = 0; // They need to write today
        } else {
          daysUntilBreak = -1; // Streak already broken
        }
      }

      return {
        currentStreak: user.streak,
        lastActiveDate: user.lastActiveDate || new Date(0),
        isActiveToday,
        daysUntilBreak,
        longestStreak: user.longestStreak || user.streak,
      };
    } catch (error) {
      console.error('Error getting streak status:', error);
      return {
        currentStreak: 0,
        lastActiveDate: new Date(0),
        isActiveToday: false,
        daysUntilBreak: -1,
        longestStreak: 0,
      };
    }
  }

  /**
   * Get streak statistics for all users
   */
  async getStreakStatistics(): Promise<{
    totalActiveStreaks: number;
    averageStreak: number;
    longestCurrentStreak: number;
    topUsers: Array<{ userId: string; userName: string; streak: number }>;
  }> {
    try {
      await connectDB();

      // Get all users with active streaks
      const users = await User.find({
        streak: { $gt: 0 },
        isActive: true,
      })
        .sort({ streak: -1 })
        .limit(100);

      const totalActiveStreaks = users.filter(user => user.streak > 0).length;

      const totalStreakDays = users.reduce((sum, user) => sum + user.streak, 0);
      const averageStreak =
        totalActiveStreaks > 0
          ? Math.round((totalStreakDays / totalActiveStreaks) * 10) / 10
          : 0;

      const longestCurrentStreak = users.length > 0 ? users[0].streak : 0;

      const topUsers = users.slice(0, 10).map(user => ({
        userId: user._id.toString(),
        userName: `${user.firstName} ${user.lastName}`,
        streak: user.streak,
      }));

      return {
        totalActiveStreaks,
        averageStreak,
        longestCurrentStreak,
        topUsers,
      };
    } catch (error) {
      console.error('Error getting streak statistics:', error);
      return {
        totalActiveStreaks: 0,
        averageStreak: 0,
        longestCurrentStreak: 0,
        topUsers: [],
      };
    }
  }

  /**
   * Reset a user's streak (admin only)
   */
  async resetStreak(userId: string): Promise<boolean> {
    try {
      await connectDB();

      await User.findByIdAndUpdate(userId, {
        streak: 0,
        lastActiveDate: null,
      });

      return true;
    } catch (error) {
      console.error('Error resetting streak:', error);
      return false;
    }
  }

  /**
   * Manually set a user's streak (admin only)
   */
  async setStreak(userId: string, streakCount: number): Promise<boolean> {
    try {
      await connectDB();

      if (streakCount < 0) {
        throw new Error('Streak count must be non-negative');
      }

      await User.findByIdAndUpdate(userId, {
        streak: streakCount,
        lastActiveDate: new Date(),
      });

      return true;
    } catch (error) {
      console.error('Error setting streak:', error);
      return false;
    }
  }

  // Private helper methods

  private async notifyStreakMilestone(user: any): Promise<void> {
    try {
      // Create notification
      await Notification.create({
        userId: user._id,
        type: 'streak_milestone',
        title: 'Writing Streak Milestone!',
        message: `Congratulations! You've reached a ${user.streak}-day writing streak!`,
        data: {
          streak: user.streak,
        },
      });

      // Send real-time notification
      webSocketManager.sendToUser(user._id.toString(), 'streakMilestone', {
        streak: user.streak,
      });

      // Send email for major milestones
      if (user.streak === 7 || user.streak === 30 || user.streak === 100) {
        if (user.emailPreferences?.achievements) {
          await sendEmail({
            to: user.email,
            subject: `🔥 Amazing! ${user.streak}-Day Writing Streak!`,
            template: 'streak_milestone',
            data: {
              firstName: user.firstName,
              streak: user.streak,
              points: user.streak * 5, // 5 points per streak day
              dashboardUrl: `${process.env.APP_URL}/dashboard/progress`,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error notifying streak milestone:', error);
    }
  }

  private async notifyStreakBroken(
    user: any,
    daysMissed: number
  ): Promise<void> {
    try {
      // Only notify for significant streaks
      if (user.streak < 3) return;

      // Create notification
      await Notification.create({
        userId: user._id,
        type: 'streak_broken',
        title: 'Writing Streak Reset',
        message: `Your ${user.streak}-day writing streak was reset. Time to start a new one!`,
        data: {
          previousStreak: user.streak,
          daysMissed,
        },
      });

      // Send real-time notification
      webSocketManager.sendToUser(user._id.toString(), 'streakBroken', {
        previousStreak: user.streak,
        daysMissed,
      });

      // Send email for significant streaks
      if (user.streak >= 7 && user.emailPreferences?.achievements) {
        await sendEmail({
          to: user.email,
          subject: `⏰ Your Writing Streak Has Been Reset`,
          template: 'streak_broken',
          data: {
            firstName: user.firstName,
            previousStreak: user.streak,
            daysMissed,
            dashboardUrl: `${process.env.APP_URL}/dashboard/progress`,
          },
        });
      }
    } catch (error) {
      console.error('Error notifying streak broken:', error);
    }
  }
}

// Export singleton instance
export const streakManager = new StreakManager();
