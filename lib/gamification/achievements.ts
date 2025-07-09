// lib/gamification/achievement.ts - Achievement system
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import { Achievement, UserAchievement } from '@models/Achievement';
import { Notification } from '@models/Notification';
import { sendEmail } from '@lib/email/sender';
import { webSocketManager } from '@lib/realtime/websockets';
import { ACHIEVEMENTS } from '@utils/constants';
import type {
  Achievement as AchievementType,
  UserAchievement as UserAchievementType,
} from '@types/achievement';

export class AchievementManager {
  /**
   * Check and award achievements based on user activity
   */
  async checkAndAwardAchievements(
    userId: string,
    eventType: string,
    eventData: any
  ): Promise<UserAchievementType[]> {
    try {
      await connectDB();

      const newAchievements: UserAchievementType[] = [];

      // Get user data
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Process different event types
      switch (eventType) {
        case 'story_completed':
          await this.processStoryCompletion(user, eventData, newAchievements);
          break;

        case 'assessment_received':
          await this.processAssessment(user, eventData, newAchievements);
          break;

        case 'streak_updated':
          await this.processStreakUpdate(user, eventData, newAchievements);
          break;

        case 'words_milestone':
          await this.processWordsMilestone(user, eventData, newAchievements);
          break;
      }

      // Notify user about new achievements
      for (const achievement of newAchievements) {
        await this.notifyUser(user, achievement);
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  /**
   * Get all achievements for a user
   */
  async getUserAchievements(userId: string): Promise<{
    earned: UserAchievementType[];
    progress: UserAchievementType[];
    next: AchievementType[];
  }> {
    try {
      await connectDB();

      // Get user's earned achievements
      const userAchievements = await UserAchievement.find({ userId })
        .populate('achievement')
        .sort({ completedAt: -1 });

      // Split into completed and in-progress
      const earned = userAchievements.filter(a => a.isCompleted);
      const progress = userAchievements.filter(
        a => !a.isCompleted && a.progress > 0
      );

      // Get all possible achievements
      const allAchievements = await Achievement.find({ isActive: true });

      // Find achievements user hasn't started yet
      const earnedIds = new Set(earned.map(a => a.achievementId));
      const progressIds = new Set(progress.map(a => a.achievementId));
      const next = allAchievements.filter(
        a => !earnedIds.has(a.id) && !progressIds.has(a.id)
      );

      return { earned, progress, next };
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return { earned: [], progress: [], next: [] };
    }
  }

  /**
   * Award an achievement to user
   */
  async awardAchievement(
    userId: string,
    achievementId: string,
    triggerEvent: string,
    storyId?: string
  ): Promise<UserAchievementType | null> {
    try {
      await connectDB();

      // Find achievement
      const achievement = await Achievement.findOne({ id: achievementId });
      if (!achievement) {
        throw new Error(`Achievement not found: ${achievementId}`);
      }

      // Check if user already has this achievement
      const existingAchievement = await UserAchievement.findOne({
        userId,
        achievementId,
      });

      if (existingAchievement?.isCompleted) {
        return null; // Already earned
      }

      // Award achievement
      const userAchievement =
        existingAchievement ||
        new UserAchievement({
          userId,
          achievementId,
          achievement: achievement._id,
          progress: 0,
        });

      userAchievement.isCompleted = true;
      userAchievement.completedAt = new Date();
      userAchievement.triggerEvent = triggerEvent;
      userAchievement.progress = 100;

      if (storyId) {
        userAchievement.storyId = storyId;
      }

      await userAchievement.save();

      // Add points to user
      const user = await User.findById(userId);
      if (user) {
        await user.addPoints(achievement.points);
      }

      return userAchievement;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return null;
    }
  }

  /**
   * Update achievement progress
   */
  async updateProgress(
    userId: string,
    achievementId: string,
    currentValue: number,
    maxValue: number
  ): Promise<UserAchievementType | null> {
    try {
      await connectDB();

      // Find achievement
      const achievement = await Achievement.findOne({ id: achievementId });
      if (!achievement) {
        throw new Error(`Achievement not found: ${achievementId}`);
      }

      // Get or create user achievement
      let userAchievement = await UserAchievement.findOne({
        userId,
        achievementId,
      });

      if (!userAchievement) {
        userAchievement = new UserAchievement({
          userId,
          achievementId,
          achievement: achievement._id,
          progress: 0,
          isCompleted: false,
        });
      }

      // Don't update if already completed
      if (userAchievement.isCompleted) {
        return userAchievement;
      }

      // Calculate progress percentage
      const progressPercentage = Math.min(
        100,
        Math.round((currentValue / maxValue) * 100)
      );
      userAchievement.progress = progressPercentage;

      // Complete if 100%
      if (progressPercentage >= 100) {
        userAchievement.isCompleted = true;
        userAchievement.completedAt = new Date();
        userAchievement.triggerEvent = 'progress_complete';

        // Add points to user
        const user = await User.findById(userId);
        if (user) {
          await user.addPoints(achievement.points);
        }
      }

      await userAchievement.save();

      return userAchievement;
    } catch (error) {
      console.error('Error updating achievement progress:', error);
      return null;
    }
  }

  /**
   * Reset achievements (admin only)
   */
  async resetAchievements(userId: string): Promise<boolean> {
    try {
      await connectDB();

      // Delete user achievements
      await UserAchievement.deleteMany({ userId });

      // Reset user points and level
      await User.findByIdAndUpdate(userId, {
        totalPoints: 0,
        level: 1,
      });

      return true;
    } catch (error) {
      console.error('Error resetting achievements:', error);
      return false;
    }
  }

  // Private helper methods

  private async processStoryCompletion(
    user: any,
    eventData: any,
    newAchievements: UserAchievementType[]
  ): Promise<void> {
    // Award "First Story" achievement for first completion
    if (user.storyCount === 1) {
      const achievement = await this.awardAchievement(
        user._id,
        'first_story',
        'story_completed',
        eventData.storyId
      );

      if (achievement) {
        newAchievements.push(achievement);
      }
    }

    // Check "Prolific Writer" achievement
    if (user.storyCount >= 10) {
      const achievement = await this.awardAchievement(
        user._id,
        'prolific_writer',
        'story_completed',
        eventData.storyId
      );

      if (achievement) {
        newAchievements.push(achievement);
      }
    }

    // Update progress for story count achievements
    const milestones = [5, 10, 25, 50, 100];
    for (const milestone of milestones) {
      const achievementId = `stories_${milestone}`;
      await this.updateProgress(
        user._id,
        achievementId,
        user.storyCount,
        milestone
      );
    }
  }

  private async processAssessment(
    user: any,
    eventData: any,
    newAchievements: UserAchievementType[]
  ): Promise<void> {
    const { grammarScore, creativityScore, overallScore } = eventData.scores;

    // Check "Grammar Master" achievement
    if (grammarScore >= 90) {
      const achievement = await this.awardAchievement(
        user._id,
        'grammar_master',
        'assessment_received',
        eventData.storyId
      );

      if (achievement) {
        newAchievements.push(achievement);
      }
    }

    // Check "Creative Writer" achievement
    if (creativityScore >= 90) {
      const achievement = await this.awardAchievement(
        user._id,
        'creative_writer',
        'assessment_received',
        eventData.storyId
      );

      if (achievement) {
        newAchievements.push(achievement);
      }
    }

    // Update progress for score-based achievements
    await this.updateProgress(user._id, 'grammar_90', grammarScore, 90);
    await this.updateProgress(user._id, 'creativity_90', creativityScore, 90);
    await this.updateProgress(user._id, 'overall_90', overallScore, 90);
  }

  private async processStreakUpdate(
    user: any,
    eventData: any,
    newAchievements: UserAchievementType[]
  ): Promise<void> {
    // Check "Streak Master" achievement
    if (user.streak >= 7) {
      const achievement = await this.awardAchievement(
        user._id,
        'streak_master',
        'streak_updated'
      );

      if (achievement) {
        newAchievements.push(achievement);
      }
    }

    // Update progress for streak achievements
    const streakMilestones = [3, 7, 14, 30, 60, 90];
    for (const milestone of streakMilestones) {
      const achievementId = `streak_${milestone}`;
      await this.updateProgress(
        user._id,
        achievementId,
        user.streak,
        milestone
      );
    }
  }

  private async processWordsMilestone(
    user: any,
    eventData: any,
    newAchievements: UserAchievementType[]
  ): Promise<void> {
    const { totalWords } = eventData;

    // Update progress for word count achievements
    const wordMilestones = [1000, 5000, 10000, 25000, 50000, 100000];
    for (const milestone of wordMilestones) {
      const achievementId = `words_${milestone}`;
      await this.updateProgress(user._id, achievementId, totalWords, milestone);
    }
  }

  private async notifyUser(
    user: any,
    achievement: UserAchievementType
  ): Promise<void> {
    try {
      // Get achievement details
      const achievementData = await Achievement.findById(
        achievement.achievement
      );
      if (!achievementData) return;

      // Create notification
      await Notification.create({
        userId: user._id,
        type: 'achievement_unlocked',
        title: 'Achievement Unlocked!',
        message: achievementData.unlockedMessage,
        data: {
          achievementId: achievement.achievementId,
          achievementName: achievementData.name,
          points: achievementData.points,
          icon: achievementData.icon,
        },
      });

      // Send real-time notification
      webSocketManager.sendToUser(user._id.toString(), 'achievementUnlocked', {
        achievement: {
          id: achievement.achievementId,
          name: achievementData.name,
          description: achievementData.description,
          icon: achievementData.icon,
          points: achievementData.points,
          color: achievementData.color,
        },
      });

      // Send email notification (if enabled)
      if (user.emailPreferences?.achievements) {
        await sendEmail({
          to: user.email,
          subject: `🏆 Achievement Unlocked: ${achievementData.name}!`,
          template: 'achievement_unlocked',
          data: {
            firstName: user.firstName,
            achievementName: achievementData.name,
            achievementDescription: achievementData.description,
            achievementIcon: achievementData.icon,
            pointsEarned: achievementData.points,
            totalPoints: user.totalPoints,
            currentLevel: user.level,
            progressUrl: `${process.env.APP_URL}/dashboard/progress`,
          },
        });
      }
    } catch (error) {
      console.error('Error notifying user about achievement:', error);
    }
  }
}

// Export singleton instance
export const achievementManager = new AchievementManager();
