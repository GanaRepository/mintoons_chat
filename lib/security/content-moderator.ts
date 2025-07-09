// lib/security/content-moderation.ts - Content moderation system
import { connectDB } from '@lib/database/connection';
import Story from '@models/Story';
import Comment from '@models/Comment';
import User from '@models/User';
import { Notification } from '@models/Notification';
import { sendEmail } from '@lib/email/sender';

interface ModerationResult {
  isApproved: boolean;
  isFlagged: boolean;
  reasons: string[];
  moderatedContent?: string;
  sensitivityScore: number;
}

export class ContentModerationSystem {
  // Flagged word patterns for different age groups
  private readonly sensitivePatterns = {
    violence:
      /\b(kill|murder|dead|die|death|blood|gun|weapon|shoot|stab|hurt|pain|torture)\b/gi,
    profanity: /\b(damn|hell|ass|crap|suck|stupid|idiot|dumb|shut up)\b/gi,
    adultThemes:
      /\b(sex|sexy|naked|nude|dating|drunk|alcohol|drugs|cigarette|smoking)\b/gi,
    discrimination:
      /\b(hate|racist|sexist|retard|gay|lesbian|homo|ugly|fat)\b/gi,
    contact:
      /\b(phone|email|address|instagram|snapchat|tiktok|facebook|whatsapp|call me|text me)\b/gi,
  };

  /**
   * Moderate story content
   */
  async moderateStory(
    storyContent: string,
    authorAge: number
  ): Promise<ModerationResult> {
    try {
      // Initialize result
      const result: ModerationResult = {
        isApproved: true,
        isFlagged: false,
        reasons: [],
        sensitivityScore: 0,
      };

      // Apply stricter filtering for younger children
      const ageMultiplier = authorAge < 10 ? 1.5 : authorAge < 13 ? 1.2 : 1;

      // Check for sensitive content
      let moderatedContent = storyContent;
      let sensitivityScore = 0;

      // Check each pattern category
      for (const [category, pattern] of Object.entries(
        this.sensitivePatterns
      )) {
        const matches = storyContent.match(pattern);

        if (matches && matches.length > 0) {
          // Add to reasons if matched
          result.reasons.push(`Potentially inappropriate ${category} content`);

          // Calculate sensitivity
          const categoryScore = matches.length * 10 * ageMultiplier;
          sensitivityScore += categoryScore;

          // Moderate content
          const replacement = this.getReplacementForCategory(category);
          moderatedContent = moderatedContent.replace(pattern, replacement);
        }
      }

      // Determine moderation result
      result.sensitivityScore = Math.min(100, sensitivityScore);

      if (sensitivityScore > 70) {
        result.isApproved = false;
        result.isFlagged = true;
      } else if (sensitivityScore > 30) {
        result.isApproved = true;
        result.isFlagged = true;
      }

      // Provide moderated content if needed
      if (result.isFlagged) {
        result.moderatedContent = moderatedContent;
      }

      return result;
    } catch (error) {
      console.error('Error moderating content:', error);
      return {
        isApproved: false,
        isFlagged: true,
        reasons: ['Error processing content'],
        sensitivityScore: 100,
      };
    }
  }

  /**
   * Moderate comment content
   */
  async moderateComment(commentContent: string): Promise<ModerationResult> {
    // Similar implementation to moderateStory but with stricter rules
    // since comments are from mentors to children
    try {
      // Initialize result
      const result: ModerationResult = {
        isApproved: true,
        isFlagged: false,
        reasons: [],
        sensitivityScore: 0,
      };

      // Apply stricter filtering for comments
      const commentMultiplier = 2.0; // Comments are held to a higher standard

      // Check for sensitive content
      let moderatedContent = commentContent;
      let sensitivityScore = 0;

      // Check each pattern category
      for (const [category, pattern] of Object.entries(
        this.sensitivePatterns
      )) {
        const matches = commentContent.match(pattern);

        if (matches && matches.length > 0) {
          // Add to reasons if matched
          result.reasons.push(`Potentially inappropriate ${category} content`);

          // Calculate sensitivity
          const categoryScore = matches.length * 15 * commentMultiplier;
          sensitivityScore += categoryScore;

          // Moderate content
          const replacement = this.getReplacementForCategory(category);
          moderatedContent = moderatedContent.replace(pattern, replacement);
        }
      }

      // Determine moderation result
      result.sensitivityScore = Math.min(100, sensitivityScore);

      if (sensitivityScore > 50) {
        // Lower threshold for comments
        result.isApproved = false;
        result.isFlagged = true;
      } else if (sensitivityScore > 20) {
        result.isApproved = true;
        result.isFlagged = true;
      }

      // Provide moderated content if needed
      if (result.isFlagged) {
        result.moderatedContent = moderatedContent;
      }

      return result;
    } catch (error) {
      console.error('Error moderating comment:', error);
      return {
        isApproved: false,
        isFlagged: true,
        reasons: ['Error processing content'],
        sensitivityScore: 100,
      };
    }
  }

  /**
   * Flag a story for review
   */
  async flagStoryForReview(
    storyId: string,
    flaggedBy: string,
    reason: string
  ): Promise<boolean> {
    try {
      await connectDB();

      const story = await Story.findById(storyId);
      if (!story) {
        throw new Error('Story not found');
      }

      // Mark story as moderated
      story.isModerated = true;
      story.moderationFlags.push({
        type: 'user_reported',
        reason,
        flaggedBy,
        flaggedAt: new Date(),
      });
      // Continuing lib/security/content-moderation.ts

      await story.save();

      // Notify administrators
      await this.notifyAdminsOfFlaggedContent(
        'story',
        storyId,
        reason,
        flaggedBy
      );

      return true;
    } catch (error) {
      console.error('Error flagging story for review:', error);
      return false;
    }
  }

  /**
   * Flag a comment for review
   */
  async flagCommentForReview(
    commentId: string,
    flaggedBy: string,
    reason: string
  ): Promise<boolean> {
    try {
      await connectDB();

      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }

      // Mark comment as flagged
      comment.isFlagged = true;
      comment.flaggedBy = flaggedBy;
      comment.flaggedReason = reason;
      comment.flaggedAt = new Date();

      await comment.save();

      // Notify administrators
      await this.notifyAdminsOfFlaggedContent(
        'comment',
        commentId,
        reason,
        flaggedBy
      );

      return true;
    } catch (error) {
      console.error('Error flagging comment for review:', error);
      return false;
    }
  }

  /**
   * Get flagged content for admin review
   */
  async getFlaggedContent(
    contentType: 'story' | 'comment' | 'all',
    limit: number = 20
  ): Promise<any[]> {
    try {
      await connectDB();

      let flaggedStories: any[] = [];
      let flaggedComments: any[] = [];

      if (contentType === 'story' || contentType === 'all') {
        flaggedStories = await Story.find({ isModerated: true })
          .populate('authorId', 'firstName lastName email age')
          .sort({ updatedAt: -1 })
          .limit(contentType === 'all' ? Math.floor(limit / 2) : limit);
      }

      if (contentType === 'comment' || contentType === 'all') {
        flaggedComments = await Comment.find({ isFlagged: true })
          .populate('authorId', 'firstName lastName email role')
          .populate('storyId', 'title authorId')
          .sort({ flaggedAt: -1 })
          .limit(contentType === 'all' ? Math.floor(limit / 2) : limit);
      }

      if (contentType === 'all') {
        // Combine and sort by flagged date
        const combinedResults = [
          ...flaggedStories.map(item => ({
            type: 'story',
            data: item,
            flaggedAt: item.moderationFlags[0]?.flaggedAt || item.updatedAt,
          })),
          ...flaggedComments.map(item => ({
            type: 'comment',
            data: item,
            flaggedAt: item.flaggedAt,
          })),
        ];

        return combinedResults
          .sort(
            (a, b) =>
              new Date(b.flaggedAt).getTime() - new Date(a.flaggedAt).getTime()
          )
          .slice(0, limit);
      }

      return contentType === 'story' ? flaggedStories : flaggedComments;
    } catch (error) {
      console.error('Error getting flagged content:', error);
      return [];
    }
  }

  /**
   * Review and approve/reject flagged content
   */
  async reviewFlaggedContent(
    contentType: 'story' | 'comment',
    contentId: string,
    action: 'approve' | 'reject',
    adminId: string,
    message?: string
  ): Promise<boolean> {
    try {
      await connectDB();

      if (contentType === 'story') {
        const story = await Story.findById(contentId);
        if (!story) {
          throw new Error('Story not found');
        }

        if (action === 'approve') {
          // Approve story
          story.isModerated = false;
          await story.save();

          // Notify author
          await this.notifyContentReviewComplete(
            'story',
            contentId,
            story.authorId.toString(),
            'approved',
            message
          );
        } else {
          // Reject story - change status to draft and notify author
          story.status = 'draft';
          story.isModerated = true;
          await story.save();

          // Notify author
          await this.notifyContentReviewComplete(
            'story',
            contentId,
            story.authorId.toString(),
            'rejected',
            message
          );
        }
      } else {
        const comment = await Comment.findById(contentId);
        if (!comment) {
          throw new Error('Comment not found');
        }

        if (action === 'approve') {
          // Approve comment
          comment.isFlagged = false;
          await comment.save();

          // Notify author
          await this.notifyContentReviewComplete(
            'comment',
            contentId,
            comment.authorId.toString(),
            'approved',
            message
          );
        } else {
          // Reject comment - archive it
          comment.status = 'archived';
          await comment.save();

          // Notify author
          await this.notifyContentReviewComplete(
            'comment',
            contentId,
            comment.authorId.toString(),
            'rejected',
            message
          );
        }
      }

      return true;
    } catch (error) {
      console.error('Error reviewing flagged content:', error);
      return false;
    }
  }

  /**
   * Check for suspicious activity patterns
   */
  async checkSuspiciousActivity(userId: string): Promise<{
    isSuspicious: boolean;
    reasons: string[];
    riskScore: number;
  }> {
    try {
      await connectDB();

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const reasons: string[] = [];
      let riskScore = 0;

      // Check for multiple flagged stories
      const flaggedStoryCount = await Story.countDocuments({
        authorId: userId,
        isModerated: true,
      });

      if (flaggedStoryCount > 0) {
        reasons.push(`User has ${flaggedStoryCount} flagged stories`);
        riskScore += flaggedStoryCount * 20;
      }

      // Check for multiple flagged comments (for mentors)
      if (user.role === 'mentor') {
        const flaggedCommentCount = await Comment.countDocuments({
          authorId: userId,
          isFlagged: true,
        });

        if (flaggedCommentCount > 0) {
          reasons.push(`Mentor has ${flaggedCommentCount} flagged comments`);
          riskScore += flaggedCommentCount * 30; // Higher weight for mentors
        }
      }

      // Check login attempts
      if (user.loginAttempts > 3) {
        reasons.push(`Multiple failed login attempts (${user.loginAttempts})`);
        riskScore += user.loginAttempts * 10;
      }

      return {
        isSuspicious: riskScore >= 50,
        reasons,
        riskScore: Math.min(100, riskScore),
      };
    } catch (error) {
      console.error('Error checking suspicious activity:', error);
      return {
        isSuspicious: false,
        reasons: ['Error checking activity'],
        riskScore: 0,
      };
    }
  }

  // Private helper methods

  private getReplacementForCategory(category: string): string {
    switch (category) {
      case 'violence':
        return '[adventure]';
      case 'profanity':
        return '[oh no]';
      case 'adultThemes':
        return '[fun]';
      case 'discrimination':
        return '[different]';
      case 'contact':
        return '[talk]';
      default:
        return '[...]';
    }
  }

  private async notifyAdminsOfFlaggedContent(
    contentType: 'story' | 'comment',
    contentId: string,
    reason: string,
    flaggedBy: string
  ): Promise<void> {
    try {
      // Get all admin users
      const admins = await User.find({ role: 'admin' });

      for (const admin of admins) {
        // Create notification
        await Notification.create({
          userId: admin._id,
          type: 'content_flagged',
          title: `Flagged ${contentType}`,
          message: `A ${contentType} has been flagged for review: ${reason}`,
          data: {
            contentType,
            contentId,
            flaggedBy,
            reason,
          },
        });
      }
    } catch (error) {
      console.error('Error notifying admins of flagged content:', error);
    }
  }

  private async notifyContentReviewComplete(
    contentType: 'story' | 'comment',
    contentId: string,
    userId: string,
    result: 'approved' | 'rejected',
    message?: string
  ): Promise<void> {
    try {
      // Create notification
      await Notification.create({
        userId,
        type: 'content_reviewed',
        title: `Your ${contentType} has been ${result}`,
        message:
          message || `Your ${contentType} has been reviewed and ${result}`,
        data: {
          contentType,
          contentId,
          result,
        },
      });

      // Get user data for email
      const user = await User.findById(userId);
      if (!user) return;

      // Send email notification
      await sendEmail({
        to: user.email,
        subject: `MINTOONS - Your ${contentType} has been ${result}`,
        template: 'content_reviewed',
        data: {
          firstName: user.firstName,
          contentType,
          result,
          message:
            message || `Your ${contentType} has been reviewed and ${result}.`,
          dashboardUrl: `${process.env.APP_URL}/dashboard`,
        },
      });
    } catch (error) {
      console.error('Error notifying content review complete:', error);
    }
  }
}

// Export singleton instance
export const contentModerationSystem = new ContentModerationSystem();
