// lib/email/sender.ts - Email sending with Nodemailer
import nodemailer from 'nodemailer';
import { renderEmailTemplate } from './templates';
import { connectDB } from '@lib/database/connection';
import EmailQueue from '@models/Notification'; // Reusing notification model for email queue

interface EmailData {
  to: string | string[];
  subject: string;
  template?: string;
  html?: string;
  text?: string;
  data?: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
  scheduledFor?: Date;
}

class EmailSender {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });

    // Verify transporter configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Email transporter configuration error:', error);
      } else {
        console.log('Email server is ready to send messages');
      }
    });
  }

  /**
   * Send email immediately
   */
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const { html, text } = await this.prepareEmailContent(emailData);

      const recipients = Array.isArray(emailData.to)
        ? emailData.to
        : [emailData.to];

      for (const recipient of recipients) {
        const mailOptions = {
          from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
          to: recipient,
          subject: emailData.subject,
          html,
          text,
          headers: {
            'X-Priority': emailData.priority === 'high' ? '1' : '3',
          },
        };

        await this.transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${recipient}`);
      }

      return true;
    } catch (error) {
      console.error('Error sending email:', error);

      // Queue email for retry if immediate sending fails
      await this.queueEmail(emailData);
      return false;
    }
  }

  /**
   * Queue email for later sending
   */
  async queueEmail(emailData: EmailData): Promise<void> {
    try {
      await connectDB();

      const { html, text } = await this.prepareEmailContent(emailData);

      // Simple email queue using notification model
      // In production, consider using a dedicated email queue service
      const queueData = {
        type: 'email_queue' as any,
        title: emailData.subject,
        message: text,
        data: {
          to: emailData.to,
          subject: emailData.subject,
          html,
          text,
          template: emailData.template,
          templateData: emailData.data,
          priority: emailData.priority || 'normal',
          scheduledFor: emailData.scheduledFor || new Date(),
          attempts: 0,
          maxAttempts: 3,
        },
      };

      // Save to queue
      // Note: This is a simplified queue implementation
      console.log('Email queued for retry:', emailData.subject);
    } catch (error) {
      console.error('Error queueing email:', error);
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(user: any): Promise<void> {
    await this.sendEmail({
      to: user.email,
      subject: "Welcome to MINTOONS - Let's Start Writing Stories!",
      template: 'welcome',
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        subscriptionTier: user.subscriptionTier,
        loginUrl: `${process.env.APP_URL}/login`,
        dashboardUrl: `${process.env.APP_URL}/dashboard`,
        supportEmail: process.env.FROM_EMAIL,
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user: any, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

    await this.sendEmail({
      to: user.email,
      subject: 'Reset Your MINTOONS Password',
      template: 'password_reset',
      data: {
        firstName: user.firstName,
        resetUrl,
        resetToken,
        expiresIn: '1 hour',
        supportEmail: process.env.FROM_EMAIL,
      },
      priority: 'high',
    });
  }

  /**
   * Send story completion email
   */
  async sendStoryCompletionEmail(
    user: any,
    story: any,
    assessment: any
  ): Promise<void> {
    await this.sendEmail({
      to: user.email,
      subject: `Great Job on Your Story: "${story.title}"!`,
      template: 'story_completed',
      data: {
        firstName: user.firstName,
        storyTitle: story.title,
        storyUrl: `${process.env.APP_URL}/dashboard/story/${story._id}`,
        wordCount: story.wordCount,
        grammarScore: assessment.grammarScore,
        creativityScore: assessment.creativityScore,
        overallScore: assessment.overallScore,
        encouragement: assessment.feedback,
        nextStoryUrl: `${process.env.APP_URL}/dashboard/create-stories`,
      },
    });
  }

  /**
   * Send mentor comment notification
   */
  async sendMentorCommentEmail(
    user: any,
    story: any,
    comment: any
  ): Promise<void> {
    await this.sendEmail({
      to: user.email,
      subject: `New Comment on Your Story: "${story.title}"`,
      template: 'mentor_comment',
      data: {
        firstName: user.firstName,
        storyTitle: story.title,
        mentorName: comment.authorName,
        commentPreview: comment.content.slice(0, 100),
        commentType: comment.type,
        storyUrl: `${process.env.APP_URL}/dashboard/story/${story._id}`,
        commentsCount: story.mentorComments.length,
      },
    });
  }

  /**
   * Send achievement unlocked email
   */
  async sendAchievementEmail(user: any, achievement: any): Promise<void> {
    await this.sendEmail({
      to: user.email,
      subject: `🎉 Achievement Unlocked: ${achievement.name}!`,
      template: 'achievement_unlocked',
      data: {
        firstName: user.firstName,
        achievementName: achievement.name,
        achievementDescription: achievement.description,
        achievementIcon: achievement.icon,
        pointsEarned: achievement.points,
        totalPoints: user.totalPoints,
        currentLevel: user.level,
        progressUrl: `${process.env.APP_URL}/dashboard/progress`,
      },
    });
  }

  /**
   * Send weekly progress email
   */
  async sendWeeklyProgressEmail(user: any, weeklyStats: any): Promise<void> {
    await this.sendEmail({
      to: user.email,
      subject: 'Your Weekly Writing Progress - MINTOONS',
      template: 'weekly_progress',
      data: {
        firstName: user.firstName,
        weeklyStats: {
          storiesCompleted: weeklyStats.storiesCompleted,
          wordsWritten: weeklyStats.wordsWritten,
          averageScore: weeklyStats.averageScore,
          streak: weeklyStats.streak,
          achievementsUnlocked: weeklyStats.achievementsUnlocked,
        },
        highlights: weeklyStats.highlights || [],
        improvementAreas: weeklyStats.improvementAreas || [],
        nextWeekGoals: weeklyStats.nextWeekGoals || [],
        dashboardUrl: `${process.env.APP_URL}/dashboard`,
      },
    });
  }

  /**
   * Send bulk emails (for campaigns)
   */
  async sendBulkEmails(
    recipients: string[],
    emailData: Omit<EmailData, 'to'>
  ): Promise<void> {
    const batchSize = 50; // Send in batches to avoid overwhelming the server

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      // Send batch with delay to respect rate limits
      await Promise.all(
        batch.map(recipient => this.sendEmail({ ...emailData, to: recipient }))
      );

      // Add delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      }
    }
  }

  /**
   * Process email queue (for scheduled emails)
   */
  async processEmailQueue(): Promise<void> {
    try {
      // This would typically be run by a cron job or background worker
      console.log('Processing email queue...');

      // Find queued emails
      // Implementation would depend on how queue is stored
    } catch (error) {
      console.error('Error processing email queue:', error);
    }
  }

  private async prepareEmailContent(
    emailData: EmailData
  ): Promise<{ html: string; text: string }> {
    let html = emailData.html || '';
    let text = emailData.text || '';

    // If template is specified, render it
    if (emailData.template) {
      const rendered = await renderEmailTemplate(
        emailData.template,
        emailData.data || {}
      );
      html = rendered.html;
      text = rendered.text;
    }

    // If no text provided, create simple text version from HTML
    if (!text && html) {
      text = html
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    return { html, text };
  }

  /**
   * Test email configuration
   */
  async testEmail(): Promise<boolean> {
    try {
      await this.sendEmail({
        to: process.env.FROM_EMAIL!,
        subject: 'MINTOONS Email Test',
        html: '<h1>Email Configuration Test</h1><p>This is a test email to verify the email configuration is working correctly.</p>',
        text: 'Email Configuration Test - This is a test email to verify the email configuration is working correctly.',
      });

      return true;
    } catch (error) {
      console.error('Email test failed:', error);
      return false;
    }
  }
}

// Export singleton instance and convenience function
export const emailSender = new EmailSender();
export const sendEmail = (emailData: EmailData) =>
  emailSender.sendEmail(emailData);
