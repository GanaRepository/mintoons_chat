// lib/gamification/achievement.ts - Direct fix for union type issues
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import { Achievement, UserAchievement } from '@models/Achievement';
import Notification from '@models/Notification';
import { sendEmail } from '@lib/email/sender';
import { webSocketManager } from '@lib/realtime/websockets';

type SimpleUserAchievement = any; // Simple type to avoid conflicts
type SimpleAchievement = any;
type EventData = {
  storyId?: string;
  scores?: {
    grammarScore?: number;
    creativityScore?: number;
    overallScore?: number;
  };
  totalWords?: number;
  streak?: number;
};

export class AchievementManager {
  async checkAndAwardAchievements(
    userId: string,
    eventType: string,
    eventData: EventData
  ): Promise<SimpleUserAchievement[]> {
    try {
      if (!userId || !eventType || !eventData) {
        throw new Error('Invalid input parameters');
      }

      await connectDB();
      const newAchievements: SimpleUserAchievement[] = [];

      // Use explicit any casting for User model too
      const user = await (User as any).findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

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
        default:
          throw new Error(`Unknown event type: ${eventType}`);
      }

      await Promise.all(
        newAchievements.map(async achievement => {
          await this.notifyUser(user, achievement);
        })
      );

      return newAchievements;
    } catch (error) {
      console.error(
        `Error in checkAndAwardAchievements for userId: ${userId}, eventType: ${eventType}`,
        error
      );
      return [];
    }
  }

  async getUserAchievements(userId: string): Promise<{
    earned: SimpleUserAchievement[];
    progress: SimpleUserAchievement[];
    next: SimpleAchievement[];
  }> {
    try {
      await connectDB();

      // Direct method calls with explicit any casting
      const userAchievements = (await UserAchievement.find({ userId })
        .populate('achievement')
        .sort({ completedAt: -1 })
        .lean()
        .exec()) as any[];

      const earned = userAchievements.filter(a => a.isCompleted);
      const progress = userAchievements.filter(
        a => !a.isCompleted && a.progress > 0
      );

      const allAchievements = (await Achievement.find({ isActive: true })
        .lean()
        .exec()) as any[];

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

  async awardAchievement(
    userId: string,
    achievementId: string,
    triggerEvent: string,
    storyId?: string
  ): Promise<SimpleUserAchievement | null> {
    try {
      await connectDB();

      const achievement = await Achievement.findOne({
        id: achievementId,
      }).exec();
      if (!achievement) {
        throw new Error(`Achievement not found: ${achievementId}`);
      }

      const existingAchievement = await UserAchievement.findOne({
        userId,
        achievementId,
      }).exec();

      if (existingAchievement?.isCompleted) {
        return null;
      }

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

      const user = await (User as any).findById(userId);
      if (user && user.addPoints) {
        await user.addPoints(achievement.points);
      }

      return userAchievement.toObject();
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return null;
    }
  }

  async updateProgress(
    userId: string,
    achievementId: string,
    currentValue: number,
    maxValue: number
  ): Promise<SimpleUserAchievement | null> {
    try {
      await connectDB();

      const achievement = await Achievement.findOne({
        id: achievementId,
      }).exec();
      if (!achievement) {
        throw new Error(`Achievement not found: ${achievementId}`);
      }

      let userAchievement = await UserAchievement.findOne({
        userId,
        achievementId,
      }).exec();

      if (!userAchievement) {
        userAchievement = new UserAchievement({
          userId,
          achievementId,
          achievement: achievement._id,
          progress: 0,
          isCompleted: false,
        });
      }

      if (userAchievement.isCompleted) {
        return userAchievement.toObject();
      }

      const progressPercentage =
        maxValue > 0
          ? Math.min(100, Math.round((currentValue / maxValue) * 100))
          : 0;
      userAchievement.progress = progressPercentage;

      if (progressPercentage >= 100) {
        userAchievement.isCompleted = true;
        userAchievement.completedAt = new Date();
        userAchievement.triggerEvent = 'progress_complete';

        const user = await (User as any).findById(userId);
        if (user && user.addPoints) {
          await user.addPoints(achievement.points);
        }
      }

      await userAchievement.save();
      return userAchievement.toObject();
    } catch (error) {
      console.error('Error updating achievement progress:', error);
      return null;
    }
  }

  async resetAchievements(userId: string): Promise<boolean> {
    try {
      await connectDB();

      await UserAchievement.deleteMany({ userId }).exec();
      await (User as any)
        .findByIdAndUpdate(userId, {
          totalPoints: 0,
          level: 1,
        })
        .exec();

      return true;
    } catch (error) {
      console.error('Error resetting achievements:', error);
      return false;
    }
  }

  private async processStoryCompletion(
    user: any,
    eventData: EventData,
    newAchievements: SimpleUserAchievement[]
  ): Promise<void> {
    if (user.storyCount === 1) {
      const achievement = await this.awardAchievement(
        user._id,
        'first_story',
        'story_completed',
        eventData.storyId
      );
      if (achievement) newAchievements.push(achievement);
    }

    if (user.storyCount >= 10) {
      const achievement = await this.awardAchievement(
        user._id,
        'prolific_writer',
        'story_completed',
        eventData.storyId
      );
      if (achievement) newAchievements.push(achievement);
    }

    const milestones = [5, 10, 25, 50, 100];
    await Promise.all(
      milestones.map(async milestone => {
        await this.updateProgress(
          user._id,
          `stories_${milestone}`,
          user.storyCount,
          milestone
        );
      })
    );
  }

  private async processAssessment(
    user: any,
    eventData: EventData,
    newAchievements: SimpleUserAchievement[]
  ): Promise<void> {
    const scores = eventData.scores || {};
    const { grammarScore = 0, creativityScore = 0, overallScore = 0 } = scores;

    if (grammarScore >= 90) {
      const achievement = await this.awardAchievement(
        user._id,
        'grammar_master',
        'assessment_received',
        eventData.storyId
      );
      if (achievement) newAchievements.push(achievement);
    }

    if (creativityScore >= 90) {
      const achievement = await this.awardAchievement(
        user._id,
        'creative_writer',
        'assessment_received',
        eventData.storyId
      );
      if (achievement) newAchievements.push(achievement);
    }

    await Promise.all([
      this.updateProgress(user._id, 'grammar_90', grammarScore, 90),
      this.updateProgress(user._id, 'creativity_90', creativityScore, 90),
      this.updateProgress(user._id, 'overall_90', overallScore, 90),
    ]);
  }

  private async processStreakUpdate(
    user: any,
    eventData: EventData,
    newAchievements: SimpleUserAchievement[]
  ): Promise<void> {
    if (user.streak >= 7) {
      const achievement = await this.awardAchievement(
        user._id,
        'streak_master',
        'streak_updated'
      );
      if (achievement) newAchievements.push(achievement);
    }

    const streakMilestones = [3, 7, 14, 30, 60, 90];
    await Promise.all(
      streakMilestones.map(async milestone => {
        await this.updateProgress(
          user._id,
          `streak_${milestone}`,
          user.streak,
          milestone
        );
      })
    );
  }

  private async processWordsMilestone(
    user: any,
    eventData: EventData,
    newAchievements: SimpleUserAchievement[]
  ): Promise<void> {
    const { totalWords = 0 } = eventData;

    const wordMilestones = [1000, 5000, 10000, 25000, 50000, 100000];
    await Promise.all(
      wordMilestones.map(async milestone => {
        await this.updateProgress(
          user._id,
          `words_${milestone}`,
          totalWords,
          milestone
        );
      })
    );
  }

  private async notifyUser(
    user: any,
    achievement: SimpleUserAchievement
  ): Promise<void> {
    try {
      const achievementData = await Achievement.findById(
        achievement.achievement
      ).exec();
      if (!achievementData) return;

      await (Notification as any).create({
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

      if (user.emailPreferences?.achievements && process.env.APP_URL) {
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

export const achievementManager = new AchievementManager();
