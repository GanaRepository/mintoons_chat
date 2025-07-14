// utils/constants.ts - Application constants
export const APP_CONFIG = {
  NAME: 'MINTOONS',
  DESCRIPTION: 'AI-Powered Story Writing Platform for Children',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@mintoons.com',
  CONTACT_EMAIL: 'hello@mintoons.com',
} as const;

// Story Creation Constants
export const STORY_CONFIG = {
  MIN_WORD_COUNT: 300,
  MAX_WORD_COUNT: 600,
  MIN_WORDS_PER_TURN: 30,
  MAX_WORDS_PER_TURN: 50,
  AI_RESPONSE_LENGTH: 2,
  ASSESSMENT_THRESHOLD: 300,
} as const;

// Story Elements for 6-Element Selection
export const STORY_ELEMENTS = {
  GENRES: [
    { id: 'adventure', name: 'Adventure', icon: '🗺️', description: 'Exciting journeys and discoveries' },
    { id: 'fantasy', name: 'Fantasy', icon: '🧙‍♂️', description: 'Magic, wizards, and mythical creatures' },
    { id: 'mystery', name: 'Mystery', icon: '🔍', description: 'Puzzles, clues, and detective work' },
    { id: 'friendship', name: 'Friendship', icon: '👫', description: 'Stories about friendship and teamwork' },
    { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦', description: 'Family adventures and bonding' },
    { id: 'animal', name: 'Animal Tales', icon: '🐾', description: 'Stories featuring animal characters' },
    { id: 'superhero', name: 'Superhero', icon: '🦸‍♂️', description: 'Heroes with special powers' },
    { id: 'space', name: 'Space Adventure', icon: '🚀', description: 'Outer space exploration' },
  ],
  SETTINGS: [
    { id: 'forest', name: 'Enchanted Forest', icon: '🌲', description: 'Magical woods full of wonder' },
    { id: 'castle', name: 'Royal Castle', icon: '🏰', description: 'Majestic palace with secrets' },
    { id: 'ocean', name: 'Ocean Depths', icon: '🌊', description: 'Underwater world of mystery' },
    { id: 'space', name: 'Space Station', icon: '🚀', description: 'High-tech home among the stars' },
    { id: 'village', name: 'Cozy Village', icon: '🏘️', description: 'Peaceful countryside community' },
    { id: 'mountain', name: 'Tall Mountains', icon: '⛰️', description: 'Peaks reaching to the clouds' },
  ],
  CHARACTERS: [
    { id: 'explorer', name: 'Brave Explorer', icon: '🧭', description: 'Adventurous and curious' },
    { id: 'animal', name: 'Talking Animal', icon: '🐾', description: 'Wise animal friend' },
    { id: 'wizard', name: 'Young Wizard', icon: '🧙‍♂️', description: 'Learning magic' },
    { id: 'robot', name: 'Friendly Robot', icon: '🤖', description: 'Helpful mechanical friend' },
    { id: 'princess', name: 'Brave Princess', icon: '👸', description: 'Strong and independent' },
    { id: 'ordinary', name: 'Ordinary Kid', icon: '👦', description: 'Regular child with big dreams' },
  ],
  MOODS: [
    { id: 'exciting', name: 'Exciting', icon: '⚡', description: 'Full of energy and thrills' },
    { id: 'peaceful', name: 'Peaceful', icon: '🕊️', description: 'Calm and serene' },
    { id: 'mysterious', name: 'Mysterious', icon: '🔮', description: 'Full of secrets and wonder' },
    { id: 'funny', name: 'Funny', icon: '😄', description: 'Lighthearted and amusing' },
    { id: 'brave', name: 'Brave', icon: '🦁', description: 'Courageous and bold' },
    { id: 'magical', name: 'Magical', icon: '✨', description: 'Enchanted and wondrous' },
  ],
  CONFLICTS: [
    { id: 'treasure', name: 'Lost Treasure', icon: '💎', description: 'Find the hidden treasure' },
    { id: 'rescue', name: 'Rescue Mission', icon: '🆘', description: 'Save someone in danger' },
    { id: 'mystery', name: 'Solve Mystery', icon: '🔍', description: 'Uncover the truth' },
    { id: 'competition', name: 'Big Competition', icon: '🏆', description: 'Win the challenge' },
    { id: 'journey', name: 'Long Journey', icon: '🗺️', description: 'Reach the destination' },
    { id: 'friendship', name: 'Help Friend', icon: '🤝', description: 'Support a friend in need' },
  ],
  THEMES: [
    { id: 'friendship', name: 'Friendship', icon: '👫', description: 'The power of true friends' },
    { id: 'courage', name: 'Courage', icon: '🦸‍♂️', description: 'Being brave when it matters' },
    { id: 'kindness', name: 'Kindness', icon: '💝', description: 'The magic of being kind' },
    { id: 'teamwork', name: 'Teamwork', icon: '🤝', description: 'Working together to succeed' },
    { id: 'discovery', name: 'Discovery', icon: '🔭', description: 'Learning something new' },
    { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦', description: 'The importance of family bonds' },
  ],
} as const;

// Age Groups matching types/user.ts ageGroup virtual field
export const AGE_GROUPS = {
  TODDLER: { min: 2, max: 4, label: 'Toddler (2-4)' },
  PRESCHOOL: { min: 5, max: 6, label: 'Preschool (5-6)' },
  EARLY_ELEMENTARY: { min: 7, max: 9, label: 'Early Elementary (7-9)' },
  LATE_ELEMENTARY: { min: 10, max: 12, label: 'Late Elementary (10-12)' },
  MIDDLE_SCHOOL: { min: 13, max: 15, label: 'Middle School (13-15)' },
  HIGH_SCHOOL: { min: 16, max: 18, label: 'High School (16-18)' },
} as const;

// User Roles matching types/user.ts UserRole type exactly
export const USER_ROLES = {
  CHILD: 'child',
  MENTOR: 'mentor',
  ADMIN: 'admin',
} as const;

// Story Status matching types/story.ts StoryStatus type exactly
export const STORY_STATUS = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

// Comment Types matching types/comment.ts CommentType exactly
export const COMMENT_TYPES = {
  GRAMMAR: 'grammar',
  CREATIVITY: 'creativity',
  SUGGESTION: 'suggestion',
  PRAISE: 'praise',
  IMPROVEMENT: 'improvement',
  QUESTION: 'question',
} as const;

// Comment Status matching types/comment.ts CommentStatus exactly
export const COMMENT_STATUS = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
  ARCHIVED: 'archived',
} as const;

// Achievement Types matching types/achievement.ts AchievementType exactly
export const ACHIEVEMENT_TYPES = {
  STORY_MILESTONE: 'story_milestone',
  QUALITY_SCORE: 'quality_score',
  STREAK: 'streak',
  CREATIVITY: 'creativity',
  GRAMMAR: 'grammar',
  SPECIAL: 'special',
} as const;

// Achievement Rarity matching types/achievement.ts AchievementRarity exactly
export const ACHIEVEMENT_RARITY = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
} as const;

// Subscription Tiers matching types/subscription.ts SubscriptionTierType exactly
export const SUBSCRIPTION_TIERS = {
  FREE: 'FREE',
  BASIC: 'BASIC',
  PREMIUM: 'PREMIUM',
  PRO: 'PRO',
} as const;

// Subscription Status matching types/subscription.ts SubscriptionStatus exactly
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  TRIALING: 'trialing',
  INCOMPLETE: 'incomplete',
} as const;

// AI Models matching types/ai.ts AIModel exactly
export const AI_MODELS = {
  GPT_4O_MINI: 'gpt-4o-mini',
  GPT_4O_NANO: 'gpt-4o-nano',
  CLAUDE_3_HAIKU: 'claude-3-haiku',
  GEMINI_1_5_FLASH: 'gemini-1.5-flash',
  O1_MINI: 'o1-mini',
  O3_MINI: 'o3-mini',
} as const;

// AI Providers matching types/ai.ts AIProvider exactly
export const AI_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GOOGLE: 'google',
} as const;

// Email Types matching types/email.ts EmailType exactly
export const EMAIL_TYPES = {
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset',
  STORY_COMPLETED: 'story_completed',
  MENTOR_COMMENT: 'mentor_comment',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  WEEKLY_PROGRESS: 'weekly_progress',
  SUBSCRIPTION_REMINDER: 'subscription_reminder',
  SUBSCRIPTION_EXPIRED: 'subscription_expired',
} as const;

// Notification Types matching types/notification.ts NotificationType exactly
export const NOTIFICATION_TYPES = {
  STORY_COMPLETED: 'story_completed',
  MENTOR_COMMENT: 'mentor_comment',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  SUBSCRIPTION_EXPIRING: 'subscription_expiring',
  WEEKLY_PROGRESS: 'weekly_progress',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
} as const;

// Assessment Criteria
export const ASSESSMENT_CRITERIA = {
  GRAMMAR: {
    EXCELLENT: { min: 90, label: 'Excellent', color: 'green' },
    GOOD: { min: 75, label: 'Good', color: 'blue' },
    FAIR: { min: 60, label: 'Fair', color: 'yellow' },
    NEEDS_IMPROVEMENT: { min: 0, label: 'Needs Improvement', color: 'red' },
  },
  CREATIVITY: {
    EXCELLENT: { min: 90, label: 'Excellent', color: 'green' },
    GOOD: { min: 75, label: 'Good', color: 'blue' },
    FAIR: { min: 60, label: 'Fair', color: 'yellow' },
    NEEDS_IMPROVEMENT: { min: 0, label: 'Needs Improvement', color: 'red' },
  },
  OVERALL: {
    EXCELLENT: { min: 90, label: 'Excellent', color: 'green' },
    GOOD: { min: 75, label: 'Good', color: 'blue' },
    FAIR: { min: 60, label: 'Fair', color: 'yellow' },
    NEEDS_IMPROVEMENT: { min: 0, label: 'Needs Improvement', color: 'red' },
  },
} as const;

// AI Response Types
export const AI_RESPONSE_TYPES = {
  CONTINUE: { weight: 30, description: 'Continue same direction' },
  PLOT_TWIST: { weight: 25, description: 'Add plot twist' },
  NEW_CHARACTER: { weight: 25, description: 'Introduce new character' },
  CHALLENGE: { weight: 20, description: 'Create surprise/challenge' },
} as const;

// File Upload Constants
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024,
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf'],
  },
  UPLOAD_PATHS: {
    AVATARS: '/uploads/avatars/',
    STORY_IMAGES: '/uploads/stories/',
    EXPORTS: '/uploads/exports/',
  },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/signin',
    LOGOUT: '/api/auth/signout',
    REGISTER: '/api/user/register',
  },
  STORIES: {
    CREATE: '/api/stories',
    LIST: '/api/stories',
    GET: '/api/stories/:id',
    UPDATE: '/api/stories/:id',
    DELETE: '/api/stories/:id',
    AI_COLLABORATE: '/api/stories/ai-collaborate',
    ASSESS: '/api/ai/assess',
  },
  SUBSCRIPTION: {
    CREATE_CHECKOUT: '/api/subscription/create-checkout',
    CANCEL: '/api/subscription/cancel',
    WEBHOOKS: '/api/subscription/webhooks',
  },
  EXPORT: {
    PDF: '/api/export/pdf/:id',
    WORD: '/api/export/word/:id',
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  STORY_LIMIT_REACHED: 'You have reached your story limit. Please upgrade your plan.',
  INVALID_AGE: 'Invalid age. Must be between 2 and 18.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a valid image or PDF.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  EMAIL_ALREADY_USED: 'This email is already registered. Please use a different email.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  STORY_CREATED: 'Story created successfully!',
  STORY_UPDATED: 'Story updated successfully!',
  STORY_DELETED: 'Story deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  SUBSCRIPTION_CREATED: 'Subscription created successfully!',
  SUBSCRIPTION_CANCELLED: 'Subscription cancelled successfully!',
  EMAIL_SENT: 'Email sent successfully!',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  },
  STORY_TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
  STORY_CONTENT: {
    MIN_LENGTH: 50,
    MAX_LENGTH: 2000,
  },
} as const;

// Level System Constants
export const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700,
  3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450,
] as const;

export const LEVEL_REWARDS: Record<number, string[]> = {
  1: ['Welcome to MINTOONS!', 'Access to story creation'],
  2: ['Basic achievement tracking', 'Profile customization'],
  3: ['Advanced story elements', 'Comment on stories'],
  4: ['Story sharing enabled', 'Basic analytics'],
  5: ['Mentor feedback access', 'Story templates'],
  10: ['Advanced analytics', 'Export stories as PDF'],
  15: ['Premium story elements', 'Collaboration features'],
  20: ['Master storyteller badge', 'Special achievements'],
  25: ['Elite writer status', 'Priority support'],
  30: ['Legendary achievements', 'Beta feature access'],
  50: ['Hall of Fame entry', 'Lifetime benefits'],
};

// Time Constants
export const TIME_CONSTANTS = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
} as const;

// Streak Milestones
export const STREAK_MILESTONES = [
  { days: 3, name: 'Getting Started', points: 15, description: 'Write for 3 consecutive days' },
  { days: 7, name: 'Weekly Writer', points: 50, description: 'Complete your first week' },
  { days: 14, name: 'Dedicated Author', points: 100, description: 'Two weeks of consistent writing' },
  { days: 30, name: 'Monthly Master', points: 250, description: 'A full month of writing' },
  { days: 60, name: 'Persistent Writer', points: 500, description: 'Two months of dedication' },
  { days: 90, name: 'Quarterly Champion', points: 750, description: 'Three months of excellence' },
  { days: 180, name: 'Half-Year Hero', points: 1500, description: 'Six months of commitment' },
  { days: 365, name: 'Annual Legend', points: 3000, description: 'A full year of writing' },
] as const;

// Story Prompts
export const STORY_PROMPTS = {
  GENERAL: [
    'What happens next in your story?',
    'How does your character feel right now?',
    'What does your character decide to do?',
    'What surprise appears in the story?',
  ],
  CHARACTER: [
    'Who does your character meet?',
    'What makes this character special?',
    'How do they become friends?',
    'What do they discover together?',
  ],
  SETTING: [
    'Where does your character go next?',
    'What does this new place look like?',
    'What sounds do they hear?',
    'How does this place make them feel?',
  ],
  PLOT: [
    'What challenge appears?',
    'How does your character solve the problem?',
    'What unexpected thing happens?',
    'What does your character learn?',
  ],
} as const;

// Tracking Events
export const TRACKING_EVENTS = {
  USER_REGISTER: 'user_register',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  STORY_CREATE: 'story_create',
  STORY_EDIT: 'story_edit',
  STORY_COMPLETE: 'story_complete',
  STORY_PUBLISH: 'story_publish',
  STORY_DELETE: 'story_delete',
  STORY_VIEW: 'story_view',
  STORY_LIKE: 'story_like',
  STORY_SHARE: 'story_share',
  AI_RESPONSE: 'ai_response',
  AI_ASSESSMENT: 'ai_assessment',
  AI_COST: 'ai_cost',
  PAGE_VIEW: 'page_view',
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  DOWNLOAD: 'download',
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
  PAYMENT_FAILED: 'payment_failed',
} as const;