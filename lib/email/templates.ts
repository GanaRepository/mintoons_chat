// lib/email/templates.ts - Email template rendering
interface EmailTemplate {
  html: string;
  text: string;
}

interface TemplateData {
  [key: string]: any;
}

export async function renderEmailTemplate(
  templateName: string,
  data: TemplateData
): Promise<EmailTemplate> {
  try {
    // In a real implementation, you'd use a proper email rendering library
    // For now, we'll create simple HTML templates

    switch (templateName) {
      case 'welcome':
        return renderWelcomeTemplate(data);
      case 'password_reset':
        return renderPasswordResetTemplate(data);
      case 'story_completed':
        return renderStoryCompletedTemplate(data);
      case 'mentor_comment':
        return renderMentorCommentTemplate(data);
      case 'achievement_unlocked':
        return renderAchievementTemplate(data);
      case 'weekly_progress':
        return renderWeeklyProgressTemplate(data);
      case 'subscription_welcome':
        return renderSubscriptionWelcomeTemplate(data);
      case 'subscription_canceled':
        return renderSubscriptionCanceledTemplate(data);
      case 'subscription_ended':
        return renderSubscriptionEndedTemplate(data);
      case 'payment_success':
        return renderPaymentSuccessTemplate(data);
      case 'payment_failed':
        return renderPaymentFailedTemplate(data);
      case 'usage_warning':
        return renderUsageWarningTemplate(data);
      case 'limit_reached':
        return renderLimitReachedTemplate(data);
      default:
        throw new Error(`Template not found: ${templateName}`);
    }
  } catch (error) {
    console.error(`Error rendering email template ${templateName}:`, error);
    return renderFallbackTemplate(data);
  }
}

function renderWelcomeTemplate(data: TemplateData): EmailTemplate {
  const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to MINTOONS!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .feature-list { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .feature-item { margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to MINTOONS!</h1>
            <p>Where young imaginations come to life</p>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName}! 👋</h2>
            
            <p>Welcome to the magical world of MINTOONS! We're so excited to have you join our community of young storytellers.</p>
            
            <p>Here's what you can do with your ${data.subscriptionTier} account:</p>
            
            <div class="feature-list">
              <div class="feature-item">✨ Create amazing stories with AI assistance</div>
              <div class="feature-item">📝 Get helpful feedback to improve your writing</div>
              <div class="feature-item">🏆 Earn achievement badges as you write</div>
              <div class="feature-item">📚 Share your stories with friends and family</div>
            </div>
            
            <p>Ready to start your first story?</p>
            <a href="${data.dashboardUrl}" class="button">Start Writing Now!</a>
            
            <p>If you need any help, just reply to this email. We're here to support your writing journey!</p>
            
            <p>Happy writing!<br>The MINTOONS Team</p>
          </div>
          <div class="footer">
            <p>Need help? Contact us at ${data.supportEmail}</p>
            <p>MINTOONS - AI-Powered Story Writing for Children</p>
          </div>
        </div>
      </body>
      </html>
    `;

  const text = `
  Welcome to MINTOONS, ${data.firstName}!
  
  We're so excited to have you join our community of young storytellers.
  
  Here's what you can do with your ${data.subscriptionTier} account:
  - Create amazing stories with AI assistance
  - Get helpful feedback to improve your writing
  - Earn achievement badges as you write
  - Share your stories with friends and family
  
  Ready to start your first story? Visit: ${data.dashboardUrl}
  
  If you need any help, just reply to this email. We're here to support your writing journey!
  
  Happy writing!
  The MINTOONS Team
  
  Need help? Contact us at ${data.supportEmail}
    `;

  return { html, text };
}

function renderPasswordResetTemplate(data: TemplateData): EmailTemplate {
  const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8B5CF6; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .url-box { background: #f8f9fa; padding: 15px; border-radius: 6px; font-family: monospace; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName},</h2>
            
            <p>We received a request to reset your MINTOONS password. If you made this request, click the button below to create a new password:</p>
            
            <a href="${data.resetUrl}" class="button">Reset My Password</a>
            
            <div class="warning">
              ⚠️ <strong>Important:</strong> This link will expire in ${data.expiresIn}. If you didn't request this password reset, you can safely ignore this email.
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <div class="url-box">${data.resetUrl}</div>
            
            <p>If you have any questions, contact us at ${data.supportEmail}</p>
            
            <p>Stay safe,<br>The MINTOONS Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

  const text = `
  Hi ${data.firstName},
  
  We received a request to reset your MINTOONS password. If you made this request, visit this link to create a new password:
  
  ${data.resetUrl}
  
  Important: This link will expire in ${data.expiresIn}. If you didn't request this password reset, you can safely ignore this email.
  
  If you have any questions, contact us at ${data.supportEmail}
  
  Stay safe,
  The MINTOONS Team
    `;

  return { html, text };
}

function renderStoryCompletedTemplate(data: TemplateData): EmailTemplate {
  const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Story Completed!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981, #3B82F6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .scores { display: flex; justify-content: space-around; margin: 20px 0; }
          .score-item { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 6px; }
          .feedback { background: #e0f2fe; padding: 20px; border-radius: 6px; margin: 20px 0; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Story Completed!</h1>
            <h2>"${data.storyTitle}"</h2>
          </div>
          <div class="content">
            <h2>Congratulations, ${data.firstName}! 🌟</h2>
            
            <p>You've just completed an amazing ${data.wordCount}-word story! Here's how you did:</p>
            
            <div class="scores">
              <div class="score-item">
                <h3>📝 Grammar</h3>
                <strong>${data.grammarScore}/100</strong>
              </div>
              <div class="score-item">
                <h3>🎨 Creativity</h3>
                <strong>${data.creativityScore}/100</strong>
              </div>
              <div class="score-item">
                <h3>⭐ Overall</h3>
                <strong>${data.overallScore}/100</strong>
              </div>
            </div>
            
            <div class="feedback">
              "${data.encouragement}"
            </div>
            
            <p>Keep up the fantastic work! Ready for your next adventure?</p>
            
            <a href="${data.storyUrl}" class="button">Read My Story</a>
            <a href="${data.nextStoryUrl}" class="button">Write Another Story</a>
            
            <p>Happy writing!<br>The MINTOONS Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

  const text = `
  Congratulations, ${data.firstName}!
  
  You've just completed an amazing ${data.wordCount}-word story: "${data.storyTitle}"
  
  Your Scores:
  - Grammar: ${data.grammarScore}/100
  - Creativity: ${data.creativityScore}/100  
  - Overall: ${data.overallScore}/100
  
  "${data.encouragement}"
  
  Keep up the fantastic work! Ready for your next adventure?
  
  Read your story: ${data.storyUrl}
  Write another story: ${data.nextStoryUrl}
  
  Happy writing!
  The MINTOONS Team
    `;

  return { html, text };
}

function renderMentorCommentTemplate(data: TemplateData): EmailTemplate {
  const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Comment!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EC4899; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #EC4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .comment-box { background: #f8f9fa; padding: 20px; border-left: 4px solid #EC4899; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 New Comment!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName}! 👋</h2>
            
            <p>${data.mentorName} left a ${data.commentType} comment on your story "${data.storyTitle}":</p>
            
            <div class="comment-box">
              <p>"${data.commentPreview}${data.commentPreview.length >= 100 ? '...' : ''}"</p>
            </div>
            
            <p>Your mentor is here to help you become an even better writer! Check out the full comment to see their helpful feedback.</p>
            
            <a href="${data.storyUrl}" class="button">Read Full Comment</a>
            
            <p>You now have ${data.commentsCount} comment${data.commentsCount !== 1 ? 's' : ''} on this story.</p>
            
            <p>Keep writing and learning!<br>The MINTOONS Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

  const text = `
  Hi ${data.firstName}!
  
  ${data.mentorName} left a ${data.commentType} comment on your story "${data.storyTitle}":
  
  "${data.commentPreview}${data.commentPreview.length >= 100 ? '...' : ''}"
  
  Your mentor is here to help you become an even better writer! Check out the full comment to see their helpful feedback.
  
  Read full comment: ${data.storyUrl}
  
  You now have ${data.commentsCount} comment${data.commentsCount !== 1 ? 's' : ''} on this story.
  
  Keep writing and learning!
  The MINTOONS Team
    `;

  return { html, text };
}

function renderAchievementTemplate(data: TemplateData): EmailTemplate {
  const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Achievement Unlocked!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #F59E0B, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .achievement-box { background: #fff7ed; border: 2px solid #F59E0B; padding: 30px; text-align: center; border-radius: 8px; margin: 20px 0; }
          .achievement-icon { font-size: 48px; margin-bottom: 10px; }
          .achievement-name { font-size: 24px; font-weight: bold; color: #F59E0B; }
          .achievement-desc { margin: 10px 0; }
          .points { background: #F59E0B; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏆 Achievement Unlocked!</h1>
          </div>
          <div class="content">
            <h2>Way to go, ${data.firstName}! 🎉</h2>
            
            <div class="achievement-box">
              <div class="achievement-icon">${data.achievementIcon}</div>
              <div class="achievement-name">${data.achievementName}</div>
              <div class="achievement-desc">${data.achievementDescription}</div>
              <div class="points">+${data.pointsEarned} points earned!</div>
            </div>
            
            <p>You now have ${data.totalPoints} total points and you're at Level ${data.currentLevel}!</p>
            
            <p>Keep writing amazing stories to unlock more achievements and level up!</p>
            
            <a href="${data.progressUrl}" class="button">View My Progress</a>
            
            <p>Congratulations on this awesome achievement!<br>The MINTOONS Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

  const text = `
  🏆 Achievement Unlocked!
  
  Way to go, ${data.firstName}! 🎉
  
  ${data.achievementIcon} ${data.achievementName}
  ${data.achievementDescription}
  
  +${data.pointsEarned} points earned!
  
  You now have ${data.totalPoints} total points and you're at Level ${data.currentLevel}!
  
  Keep writing amazing stories to unlock more achievements and level up!
  
  View your progress: ${data.progressUrl}
  
  Congratulations on this awesome achievement!
  The MINTOONS Team
    `;

  return { html, text };
}

function renderWeeklyProgressTemplate(data: TemplateData): EmailTemplate {
  const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Weekly Progress</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6, #10B981); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat-item { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 6px; }
          .section { margin: 20px 0; }
          .list-item { margin: 5px 0; padding: 8px; background: #f8f9fa; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Your Weekly Progress</h1>
            <p>Look how much you've accomplished!</p>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName}! 📈</h2>
            
            <p>Here's a summary of your amazing writing progress this week:</p>
            
            <div class="stats">
              <div class="stat-item">
                <h3>📚 Stories</h3>
                <strong>${data.weeklyStats.storiesCompleted}</strong>
                <div>Completed</div>
              </div>
              <div class="stat-item">
                <h3>✍️ Words</h3>
                <strong>${data.weeklyStats.wordsWritten}</strong>
                <div>Written</div>
              </div>
              <div class="stat-item">
                <h3>⭐ Average Score</h3>
                <strong>${data.weeklyStats.averageScore}/100</strong>
                <div>Quality</div>
              </div>
              <div class="stat-item">
                <h3>🔥 Streak</h3>
                <strong>${data.weeklyStats.streak} days</strong>
                <div>Writing streak</div>
              </div>
            </div>
            
            ${
              data.highlights.length > 0
                ? `
            <div class="section">
              <h3>🌟 This Week's Highlights</h3>
              <div>
                ${data.highlights.map(highlight => `<div class="list-item">${highlight}</div>`).join('')}
              </div>
            </div>
            `
                : ''
            }
            
            ${
              data.improvementAreas.length > 0
                ? `
            <div class="section">
              <h3>💡 Areas to Focus On</h3>
              <div>
                ${data.improvementAreas.map(area => `<div class="list-item">${area}</div>`).join('')}
              </div>
            </div>
            `
                : ''
            }
            
            ${
              data.nextWeekGoals.length > 0
                ? `
            <div class="section">
              <h3>🎯 Goals for Next Week</h3>
              <div>
                ${data.nextWeekGoals.map(goal => `<div class="list-item">${goal}</div>`).join('')}
              </div>
            </div>
            `
                : ''
            }
            
            <p>Keep up the fantastic work! Your writing is improving every day.</p>
            
            <a href="${data.dashboardUrl}" class="button">Continue Writing</a>
            
            <p>Happy writing!<br>The MINTOONS Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

  const text = `
  📊 Your Weekly Progress
  
  Hi ${data.firstName}!
  
  Here's a summary of your amazing writing progress this week:
  
  📚 Stories Completed: ${data.weeklyStats.storiesCompleted}
  ✍️ Words Written: ${data.weeklyStats.wordsWritten}
  ⭐ Average Score: ${data.weeklyStats.averageScore}/100
  🔥 Writing Streak: ${data.weeklyStats.streak} days
  
  ${
    data.highlights.length > 0
      ? `
  🌟 This Week's Highlights:
  ${data.highlights.map(highlight => `- ${highlight}`).join('\n')}
  `
      : ''
  }
  
  ${
    data.improvementAreas.length > 0
      ? `
  💡 Areas to Focus On:
  ${data.improvementAreas.map(area => `- ${area}`).join('\n')}
  `
      : ''
  }
  
  ${
    data.nextWeekGoals.length > 0
      ? `
  🎯 Goals for Next Week:
  ${data.nextWeekGoals.map(goal => `- ${goal}`).join('\n')}
  `
      : ''
  }
  
  Keep up the fantastic work! Your writing is improving every day.
  
  Continue writing: ${data.dashboardUrl}
  
  Happy writing!
  The MINTOONS Team
    `;

  return { html, text };
}

function renderSubscriptionWelcomeTemplate(data: TemplateData): EmailTemplate {
  const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to MINTOONS Premium!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #F59E0B, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .feature-list { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .feature-item { margin: 10px 0; padding: 8px; background: white; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to MINTOONS ${data.tier}!</h1>
            <p>Your premium writing adventure begins now</p>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName}! 🌟</h2>
            
            <p>Congratulations on upgrading to MINTOONS ${data.tier}! You now have access to amazing premium features:</p>
            
            <div class="feature-list">
              <h3>✨ Your Premium Features:</h3>
              <div>
                ${data.features.map(feature => `<div class="feature-item">${feature}</div>`).join('')}
              </div>
            </div>
            
            <p>Your subscription is now active and you can start enjoying all these premium benefits right away!</p>
            
            <a href="${process.env.APP_URL}/dashboard" class="button">Start Writing Premium Stories</a>
            
            <p>If you have any questions about your subscription, just reply to this email. We're here to help!</p>
            
            <p>Thank you for choosing MINTOONS Premium!<br>The MINTOONS Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

  const text = `
  🎉 Welcome to MINTOONS ${data.tier}!
  
  Hi ${data.firstName}! 🌟
  
  Congratulations on upgrading to MINTOONS ${data.tier}! You now have access to amazing premium features:
  
  ✨ Your Premium Features:
  ${data.features.map(feature => `- ${feature}`).join('\n')}
  
  Your subscription is now active and you can start enjoying all these premium benefits right away!
  
  Start writing premium stories: ${process.env.APP_URL}/dashboard
  
  If you have any questions about your subscription, just reply to this email. We're here to help!
  
  Thank you for choosing MINTOONS Premium!
  The MINTOONS Team
    `;

  return { html, text };
}

function renderSubscriptionCanceledTemplate(data: TemplateData): EmailTemplate {
  const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Cancellation Confirmed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6B7280; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .info-box { background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Cancellation Confirmed</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName},</h2>
            
            <p>We've received your cancellation request and wanted to confirm the details:</p>
            
            <div class="info-box">
              ${
                data.immediate
                  ? '<p><strong>Immediate Cancellation:</strong> Your subscription has been canceled immediately.</p>'
                  : `<p><strong>Cancellation at Period End:</strong> Your subscription will remain active until ${new Date(data.periodEnd).toLocaleDateString()}.</p>`
              }
         </div>
         
         <p>We're sorry to see you go! If you have any feedback about your experience, we'd love to hear from you.</p>
         
         <p>You can always resubscribe at any time if you change your mind.</p>
         
         <a href="${process.env.APP_URL}/pricing" class="button">View Pricing Plans</a>
         
         <p>Thank you for being part of the MINTOONS community!<br>The MINTOONS Team</p>
       </div>
     </div>
   </body>
   </html>
 `;

  const text = `
Subscription Cancellation Confirmed

Hi ${data.firstName},

We've received your cancellation request and wanted to confirm the details:

${
  data.immediate
    ? 'Immediate Cancellation: Your subscription has been canceled immediately.'
    : `Cancellation at Period End: Your subscription will remain active until ${new Date(data.periodEnd).toLocaleDateString()}.`
}

We're sorry to see you go! If you have any feedback about your experience, we'd love to hear from you.

You can always resubscribe at any time if you change your mind.

View pricing plans: ${process.env.APP_URL}/pricing

Thank you for being part of the MINTOONS community!
The MINTOONS Team
 `;

  return { html, text };
}

function renderSubscriptionEndedTemplate(data: TemplateData): EmailTemplate {
  const html = `
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Subscription Ended</title>
     <style>
       body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
       .container { max-width: 600px; margin: 0 auto; padding: 20px; }
       .header { background: #6B7280; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
       .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
       .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
       .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
       .info-box { background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; }
     </style>
   </head>
   <body>
     <div class="container">
       <div class="header">
         <h1>Subscription Ended</h1>
       </div>
       <div class="content">
         <h2>Hi ${data.firstName},</h2>
         
         <p>Your MINTOONS subscription ended on ${new Date(data.endDate).toLocaleDateString()}.</p>
         
         <div class="info-box">
           <p><strong>What happens now:</strong></p>
           <p>• Your account has been moved to the Free tier</p>
           <p>• You can still access your existing stories</p>
           <p>• You can create up to 50 stories per month</p>
           <p>• Premium features are no longer available</p>
         </div>
         
         <p>We'd love to have you back! Renew your subscription to continue enjoying premium features.</p>
         
         <a href="${data.renewUrl}" class="button">Renew Subscription</a>
         
         <p>If you have any questions, contact us at ${data.supportEmail}</p>
         
         <p>Thank you for being part of MINTOONS!<br>The MINTOONS Team</p>
       </div>
     </div>
   </body>
   </html>
 `;

  const text = `
Subscription Ended

Hi ${data.firstName},

Your MINTOONS subscription ended on ${new Date(data.endDate).toLocaleDateString()}.

What happens now:
- Your account has been moved to the Free tier
- You can still access your existing stories
- You can create up to 50 stories per month
- Premium features are no longer available

We'd love to have you back! Renew your subscription to continue enjoying premium features.

Renew subscription: ${data.renewUrl}

If you have any questions, contact us at ${data.supportEmail}

Thank you for being part of MINTOONS!
The MINTOONS Team
 `;

  return { html, text };
}

function renderPaymentSuccessTemplate(data: TemplateData): EmailTemplate {
  const html = `
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Payment Successful</title>
     <style>
       body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
       .container { max-width: 600px; margin: 0 auto; padding: 20px; }
       .header { background: #10B981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
       .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
       .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
       .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
       .payment-details { background: #f0fdf4; padding: 20px; border-radius: 6px; margin: 20px 0; }
     </style>
   </head>
   <body>
     <div class="container">
       <div class="header">
         <h1>✅ Payment Successful!</h1>
       </div>
       <div class="content">
         <h2>Hi ${data.firstName},</h2>
         
         <p>Your payment has been processed successfully!</p>
         
         <div class="payment-details">
           <p><strong>Payment Details:</strong></p>
           <p>Amount: $${data.amount}</p>
           <p>Plan: MINTOONS ${data.tier}</p>
           <p>Next billing date: ${new Date(data.nextBillingDate).toLocaleDateString()}</p>
         </div>
         
         <p>Your subscription is now active and you can enjoy all premium features.</p>
         
         <a href="${process.env.APP_URL}/dashboard" class="button">Start Writing</a>
         
         <p>Thank you for your continued support!<br>The MINTOONS Team</p>
       </div>
     </div>
   </body>
   </html>
 `;

  const text = `
✅ Payment Successful!

Hi ${data.firstName},

Your payment has been processed successfully!

Payment Details:
Amount: $${data.amount}
Plan: MINTOONS ${data.tier}
Next billing date: ${new Date(data.nextBillingDate).toLocaleDateString()}

Your subscription is now active and you can enjoy all premium features.

Start writing: ${process.env.APP_URL}/dashboard

Thank you for your continued support!
The MINTOONS Team
 `;

  return { html, text };
}

function renderPaymentFailedTemplate(data: TemplateData): EmailTemplate {
  const html = `
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Payment Issue</title>
     <style>
       body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
       .container { max-width: 600px; margin: 0 auto; padding: 20px; }
       .header { background: #EF4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
       .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
       .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
       .button { display: inline-block; background: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
       .warning-box { background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 6px; margin: 20px 0; }
       .reasons { background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; }
       .reason-item { margin: 8px 0; }
     </style>
   </head>
   <body>
     <div class="container">
       <div class="header">
         <h1>⚠️ Payment Issue</h1>
       </div>
       <div class="content">
         <h2>Hi ${data.firstName},</h2>
         
         <div class="warning-box">
           <p><strong>We couldn't process your payment of $${data.amount}</strong></p>
           
           <p>This might be due to:</p>
           <div class="reasons">
             <div class="reason-item">• Insufficient funds</div>
             <div class="reason-item">• Expired credit card</div>
             <div class="reason-item">• Bank security restrictions</div>
             <div class="reason-item">• Incorrect billing information</div>
           </div>
         </div>
         
         <p>Don't worry! We'll automatically retry your payment on ${new Date(data.retryDate).toLocaleDateString()}.</p>
         
         <p>To avoid any service interruption, please update your payment method:</p>
         
         <a href="${process.env.APP_URL}/dashboard/billing" class="button">Update Payment Method</a>
         
         <p>If you have any questions, please contact our support team.</p>
         
         <p>Thank you,<br>The MINTOONS Team</p>
       </div>
     </div>
   </body>
   </html>
 `;

  const text = `
⚠️ Payment Issue

Hi ${data.firstName},

We couldn't process your payment of $${data.amount}

This might be due to:
- Insufficient funds
- Expired credit card  
- Bank security restrictions
- Incorrect billing information

Don't worry! We'll automatically retry your payment on ${new Date(data.retryDate).toLocaleDateString()}.

To avoid any service interruption, please update your payment method: ${process.env.APP_URL}/dashboard/billing

If you have any questions, please contact our support team.

Thank you,
The MINTOONS Team
 `;

  return { html, text };
}

function renderUsageWarningTemplate(data: TemplateData): EmailTemplate {
  const html = `
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Story Limit Warning</title>
     <style>
       body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
       .container { max-width: 600px; margin: 0 auto; padding: 20px; }
       .header { background: #F59E0B; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
       .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
       .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
       .button { display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
       .usage-box { background: #fffbeb; border: 1px solid #fbbf24; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
       .usage-bar { background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden; margin: 10px 0; }
       .usage-fill { background: #f59e0b; height: 100%; width: ${(data.storiesUsed / data.storyLimit) * 100}%; }
     </style>
   </head>
   <body>
     <div class="container">
       <div class="header">
         <h1>📊 Story Limit Warning</h1>
       </div>
       <div class="content">
         <h2>Hi ${data.firstName}! 📝</h2>
         
         <p>You're doing amazing with your story writing! You've been so creative that you're approaching your story limit.</p>
         
         <div class="usage-box">
           <h3>Current Usage</h3>
           <p><strong>${data.storiesUsed} of ${data.storyLimit} stories used</strong></p>
           <div class="usage-bar">
             <div class="usage-fill"></div>
           </div>
           <p><strong>Only ${data.remaining} stories remaining this month!</strong></p>
         </div>
         
         <p>Don't let your creativity stop here! Upgrade your plan to continue writing unlimited stories:</p>
         
         <a href="${data.upgradeUrl}" class="button">Upgrade Now</a>
         
         <p>Or wait until next month when your story count resets automatically.</p>
         
         <p>Keep writing amazing stories!<br>The MINTOONS Team</p>
       </div>
     </div>
   </body>
   </html>
 `;

  const text = `
📊 Story Limit Warning

Hi ${data.firstName}! 📝

You're doing amazing with your story writing! You've been so creative that you're approaching your story limit.

Current Usage:
${data.storiesUsed} of ${data.storyLimit} stories used
Only ${data.remaining} stories remaining this month!

Don't let your creativity stop here! Upgrade your plan to continue writing unlimited stories: ${data.upgradeUrl}

Or wait until next month when your story count resets automatically.

Keep writing amazing stories!
The MINTOONS Team
 `;

  return { html, text };
}

function renderLimitReachedTemplate(data: TemplateData): EmailTemplate {
  const html = `
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Story Limit Reached</title>
     <style>
       body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
       .container { max-width: 600px; margin: 0 auto; padding: 20px; }
       .header { background: #EF4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
       .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
       .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
       .button { display: inline-block; background: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
       .limit-box { background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
     </style>
   </head>
   <body>
     <div class="container">
       <div class="header">
         <h1>🚫 Story Limit Reached</h1>
       </div>
       <div class="content">
         <h2>Hi ${data.firstName},</h2>
         
         <p>You've reached your story limit for your ${data.tier} plan.</p>
         
         <div class="limit-box">
           <p><strong>What happens now:</strong></p>
           <p>• You can't create new stories until ${new Date(data.resetDate).toLocaleDateString()}</p>
           <p>• You can still read and edit your existing stories</p>
           <p>• Your story count will reset next month</p>
         </div>
         
         <p>Want to keep writing? Upgrade to a higher plan for more stories!</p>
         
         <a href="${data.upgradeUrl}" class="button">Upgrade Plan</a>
         
         <p>Thank you for being such an active writer!<br>The MINTOONS Team</p>
       </div>
     </div>
   </body>
   </html>
 `;

  const text = `
🚫 Story Limit Reached

Hi ${data.firstName},

You've reached your story limit for your ${data.tier} plan.

What happens now:
- You can't create new stories until ${new Date(data.resetDate).toLocaleDateString()}
- You can still read and edit your existing stories
- Your story count will reset next month

Want to keep writing? Upgrade to a higher plan for more stories!

Upgrade plan: ${data.upgradeUrl}

Thank you for being such an active writer!
The MINTOONS Team
 `;

  return { html, text };
}

function renderFallbackTemplate(data: TemplateData): EmailTemplate {
  const html = `
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>MINTOONS Notification</title>
     <style>
       body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
       .container { max-width: 600px; margin: 0 auto; padding: 20px; }
       .header { background: #8B5CF6; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
       .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
       .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
     </style>
   </head>
   <body>
     <div class="container">
       <div class="header">
         <h1>📧 MINTOONS Notification</h1>
       </div>
       <div class="content">
         <h2>Hi there! 👋</h2>
         
         <p>We have an update for you from MINTOONS!</p>
         
         <p>If you have any questions, please contact our support team.</p>
         
         <p>Best regards,<br>The MINTOONS Team</p>
       </div>
     </div>
   </body>
   </html>
 `;

  const text = `
📧 MINTOONS Notification

Hi there! 👋

We have an update for you from MINTOONS!

If you have any questions, please contact our support team.

Best regards,
The MINTOONS Team
 `;

  return { html, text };
}
