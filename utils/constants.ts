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
  AI_RESPONSE_LENGTH: 2, // sentences
  ASSESSMENT_THRESHOLD: 300, // words before AI assessment
} as const;

// Story Elements for 6-Element Selection
export const STORY_ELEMENTS = {
  GENRES: [
    {
      id: 'adventure',
      name: 'Adventure',
      icon: '🗺️',
      description: 'Exciting journeys and discoveries',
    },
    {
      id: 'fantasy',
      name: 'Fantasy',
      icon: '🧙‍♂️',
      description: 'Magic, wizards, and mythical creatures',
    },
    {
      id: 'mystery',
      name: 'Mystery',
      icon: '🔍',
      description: 'Puzzles, clues, and detective work',
    },
    {
      id: 'friendship',
      name: 'Friendship',
      icon: '👫',
      description: 'Stories about friendship and teamwork',
    },
    {
      id: 'family',
      name: 'Family',
      icon: '👨‍👩‍👧‍👦',
      description: 'Family adventures and bonding',
    },
    {
      id: 'animal',
      name: 'Animal Tales',
      icon: '🐾',
      description: 'Stories featuring animal characters',
    },
    {
      id: 'superhero',
      name: 'Superhero',
      icon: '🦸‍♂️',
      description: 'Heroes with special powers',
    },
    {
      id: 'space',
      name: 'Space Adventure',
      icon: '🚀',
      description: 'Outer space exploration',
    },
  ],

  SETTINGS: [
    {
      id: 'forest',
      name: 'Enchanted Forest',
      icon: '🌲',
      description: 'Magical woods full of wonder',
    },
    {
      id: 'castle',
      name: 'Royal Castle',
      icon: '🏰',
      description: 'Majestic palace with secrets',
    },
    {
      id: 'ocean',
      name: 'Deep Ocean',
      icon: '🌊',
      description: 'Underwater world of mysteries',
    },
    {
      id: 'mountain',
      name: 'Snowy Mountains',
      icon: '🏔️',
      description: 'Tall peaks and hidden caves',
    },
    {
      id: 'city',
      name: 'Modern City',
      icon: '🏙️',
      description: 'Bustling urban environment',
    },
    {
      id: 'village',
      name: 'Cozy Village',
      icon: '🏘️',
      description: 'Small town with friendly neighbors',
    },
    {
      id: 'island',
      name: 'Tropical Island',
      icon: '🏝️',
      description: 'Paradise surrounded by water',
    },
    {
      id: 'space_station',
      name: 'Space Station',
      icon: '🛰️',
      description: 'High-tech orbital facility',
    },
  ],

  CHARACTERS: [
    {
      id: 'brave_child',
      name: 'Brave Child',
      icon: '🧒',
      description: 'Courageous young hero',
    },
    {
      id: 'wise_animal',
      name: 'Wise Animal',
      icon: '🦉',
      description: 'Smart animal companion',
    },
    {
      id: 'friendly_wizard',
      name: 'Friendly Wizard',
      icon: '🧙‍♂️',
      description: 'Magical helper with kind heart',
    },
    {
      id: 'robot_friend',
      name: 'Robot Friend',
      icon: '🤖',
      description: 'Helpful mechanical companion',
    },
    {
      id: 'fairy',
      name: 'Magical Fairy',
      icon: '🧚‍♀️',
      description: 'Tiny magical being',
    },
    {
      id: 'pirate',
      name: 'Friendly Pirate',
      icon: '🏴‍☠️',
      description: 'Adventure-seeking sailor',
    },
    {
      id: 'astronaut',
      name: 'Space Explorer',
      icon: '👨‍🚀',
      description: 'Brave space traveler',
    },
    {
      id: 'inventor',
      name: 'Young Inventor',
      icon: '🔬',
      description: 'Creative problem-solver',
    },
  ],

  MOODS: [
    {
      id: 'exciting',
      name: 'Exciting',
      icon: '⚡',
      description: 'Full of thrills and action',
    },
    {
      id: 'funny',
      name: 'Funny',
      icon: '😄',
      description: 'Humorous and lighthearted',
    },
    {
      id: 'mysterious',
      name: 'Mysterious',
      icon: '🌙',
      description: 'Full of secrets and intrigue',
    },
    {
      id: 'heartwarming',
      name: 'Heartwarming',
      icon: '❤️',
      description: 'Sweet and touching',
    },
    {
      id: 'magical',
      name: 'Magical',
      icon: '✨',
      description: 'Filled with wonder and magic',
    },
    {
      id: 'brave',
      name: 'Brave',
      icon: '🛡️',
      description: 'Courageous and heroic',
    },
    {
      id: 'curious',
      name: 'Curious',
      icon: '🔎',
      description: 'Full of discovery and learning',
    },
    {
      id: 'peaceful',
      name: 'Peaceful',
      icon: '🕊️',
      description: 'Calm and serene',
    },
  ],

  CONFLICTS: [
    {
      id: 'lost_treasure',
      name: 'Lost Treasure',
      icon: '💎',
      description: 'Finding something valuable that was lost',
    },
    {
      id: 'rescue_mission',
      name: 'Rescue Mission',
      icon: '🚁',
      description: 'Saving someone in trouble',
    },
    {
      id: 'solve_mystery',
      name: 'Solve Mystery',
      icon: '🕵️‍♂️',
      description: 'Uncovering hidden secrets',
    },
    {
      id: 'make_friends',
      name: 'Make New Friends',
      icon: '🤝',
      description: 'Building new friendships',
    },
    {
      id: 'overcome_fear',
      name: 'Overcome Fear',
      icon: '💪',
      description: 'Facing and conquering fears',
    },
    {
      id: 'save_environment',
      name: 'Save Environment',
      icon: '🌱',
      description: 'Protecting nature and animals',
    },
    {
      id: 'learn_skill',
      name: 'Learn New Skill',
      icon: '📚',
      description: 'Mastering something new',
    },
    {
      id: 'help_community',
      name: 'Help Community',
      icon: '🏠',
      description: 'Making a difference for others',
    },
  ],

  THEMES: [
    {
      id: 'friendship',
      name: 'Friendship',
      icon: '👫',
      description: 'The power of true friendship',
    },
    {
      id: 'courage',
      name: 'Courage',
      icon: '🦁',
      description: 'Being brave when it matters',
    },
    {
      id: 'kindness',
      name: 'Kindness',
      icon: '💖',
      description: 'The importance of being kind',
    },
    {
      id: 'perseverance',
      name: 'Never Give Up',
      icon: '🎯',
      description: 'Keep trying even when things are hard',
    },
    {
      id: 'teamwork',
      name: 'Teamwork',
      icon: '👥',
      description: 'Working together to achieve goals',
    },
    {
      id: 'creativity',
      name: 'Creativity',
      icon: '🎨',
      description: 'Using imagination to solve problems',
    },
    {
      id: 'honesty',
      name: 'Honesty',
      icon: '💯',
      description: 'The value of telling the truth',
    },
    {
      id: 'family',
      name: 'Family Love',
      icon: '👨‍👩‍👧‍👦',
      description: 'The special bond of family',
    },
  ],
} as const;

// Age Groups for Content Filtering
export const AGE_GROUPS = {
  TODDLER: { min: 2, max: 4, label: 'Toddler (2-4)' },
  PRESCHOOL: { min: 5, max: 6, label: 'Preschool (5-6)' },
  EARLY_ELEMENTARY: { min: 7, max: 9, label: 'Early Elementary (7-9)' },
  LATE_ELEMENTARY: { min: 10, max: 12, label: 'Late Elementary (10-12)' },
  MIDDLE_SCHOOL: { min: 13, max: 15, label: 'Middle School (13-15)' },
  HIGH_SCHOOL: { min: 16, max: 18, label: 'High School (16-18)' },
} as const;

// User Roles
export const USER_ROLES = {
  CHILD: 'child',
  MENTOR: 'mentor',
  ADMIN: 'admin',
} as const;

// Story Status
export const STORY_STATUS = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
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
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
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

// Replace your ACHIEVEMENTS constant with this complete version:
export const ACHIEVEMENTS = {
  first_story: {
    id: 'first_story',
    name: 'First Story',
    description: 'Completed your very first story!',
    icon: '📝',
    points: 10,
    type: 'story_milestone' as const,
    rarity: 'common' as const,
    criteria: {
      storiesCompleted: 1,
    },
    color: 'blue',
    unlockedMessage: 'Congratulations on your first story!',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    unlockedAt: null,
    prerequisites: [],
  },
  creative_writer: {
    id: 'creative_writer',
    name: 'Creative Writer',
    description: 'Scored 90+ on creativity assessment',
    icon: '🎨',
    points: 25,
    type: 'creativity' as const,
    rarity: 'uncommon' as const,
    criteria: {
      creativityScore: 90,
    },
    color: 'purple',
    unlockedMessage: 'Your creativity shines!',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    unlockedAt: null,
    prerequisites: [],
  },
  grammar_master: {
    id: 'grammar_master',
    name: 'Grammar Master',
    description: 'Perfect grammar score!',
    icon: '📚',
    points: 50,
    type: 'grammar' as const,
    rarity: 'rare' as const,
    criteria: {
      grammarScore: 100,
    },
    color: 'green',
    unlockedMessage: 'Perfect grammar achieved!',
    isActive: true,
    sortOrder: 3,
    createdAt: new Date(),
    unlockedAt: null,
    prerequisites: [],
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
  STORY_LIMIT_REACHED:
    'You have reached your story limit. Please upgrade your plan.',
  INVALID_AGE: 'Invalid age. Must be between 2 and 18.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a valid image or PDF.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  EMAIL_ALREADY_USED:
    'This email is already registered. Please use a different email.',
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
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, // At least 1 lowercase, 1 uppercase, 1 number
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

// Socket.io Events
export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  // Story collaboration
  JOIN_STORY: 'joinStory',
  LEAVE_STORY: 'leaveStory',
  STORY_UPDATE: 'storyUpdate',

  // Comments
  NEW_COMMENT: 'newComment',
  UPDATE_COMMENT: 'updateComment',
  DELETE_COMMENT: 'deleteComment',

  // Typing indicators
  TYPING_START: 'typingStart',
  TYPING_STOP: 'typingStop',

  // Notifications
  NEW_NOTIFICATION: 'newNotification',
  NOTIFICATION_READ: 'notificationRead',

  // Achievements
  ACHIEVEMENT_UNLOCKED: 'achievementUnlocked',
} as const;

// Time Constants
export const TIME_CONSTANTS = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
} as const;

// Add these functions to utils/constants.ts
export function getAchievementProgress(
  achievementId: string,
  user: any
): { current: number; target: number } {
  const achievement = ACHIEVEMENTS[achievementId as keyof typeof ACHIEVEMENTS];
  if (!achievement) return { current: 0, target: 0 };

  switch (achievementId) {
    case 'first_story':
      return { current: Math.min(user.storyCount || 0, 1), target: 1 };
    case 'creative_writer':
      return { current: user.bestCreativityScore || 0, target: 90 };
    case 'grammar_master':
      return { current: user.bestGrammarScore || 0, target: 100 };
    default:
      return { current: 0, target: 1 };
  }
}

export function isAchievementUnlocked(
  achievementId: string,
  user: any
): boolean {
  const progress = getAchievementProgress(achievementId, user);
  return progress.current >= progress.target;
}

// Add these to utils/constants.ts

// Level System Constants
export const LEVEL_THRESHOLDS = [
  0, // Level 1: 0 points
  100, // Level 2: 100 points
  250, // Level 3: 250 points
  450, // Level 4: 450 points
  700, // Level 5: 700 points
  1000, // Level 6: 1000 points
  1350, // Level 7: 1350 points
  1750, // Level 8: 1750 points
  2200, // Level 9: 2200 points
  2700, // Level 10: 2700 points
  3250, // Level 11: 3250 points
  3850, // Level 12: 3850 points
  4500, // Level 13: 4500 points
  5200, // Level 14: 5200 points
  5950, // Level 15: 5950 points
  6750, // Level 16: 6750 points
  7600, // Level 17: 7600 points
  8500, // Level 18: 8500 points
  9450, // Level 19: 9450 points
  10450, // Level 20: 10450 points
  // Continue pattern for higher levels...
] as const;

// Change from 'as const' to regular object to make it mutable
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

// Add these to utils/constants.ts

// Streak Milestones
export const STREAK_MILESTONES = [
  {
    days: 3,
    name: 'Getting Started',
    points: 15,
    description: 'Write for 3 consecutive days',
  },
  {
    days: 7,
    name: 'Weekly Writer',
    points: 50,
    description: 'Complete your first week',
  },
  {
    days: 14,
    name: 'Dedicated Author',
    points: 100,
    description: 'Two weeks of consistent writing',
  },
  {
    days: 30,
    name: 'Monthly Master',
    points: 250,
    description: 'A full month of writing',
  },
  {
    days: 60,
    name: 'Persistent Writer',
    points: 500,
    description: 'Two months of dedication',
  },
  {
    days: 90,
    name: 'Quarterly Champion',
    points: 750,
    description: 'Three months of excellence',
  },
  {
    days: 180,
    name: 'Half-Year Hero',
    points: 1500,
    description: 'Six months of commitment',
  },
  {
    days: 365,
    name: 'Annual Legend',
    points: 3000,
    description: 'A full year of writing',
  },
] as const;

// Streak Rewards
export const STREAK_REWARDS = {
  3: {
    points: 15,
    title: 'Getting Started',
    message: 'Great job on your first 3-day streak!',
  },
  7: {
    points: 50,
    title: 'Weekly Writer',
    message: "Amazing! You've completed your first week of writing.",
  },
  14: {
    points: 100,
    title: 'Dedicated Author',
    message: 'Incredible dedication! Two weeks of consistent writing.',
  },
  30: {
    points: 250,
    title: 'Monthly Master',
    message: 'Outstanding! A full month of daily writing.',
  },
  60: {
    points: 500,
    title: 'Persistent Writer',
    message: 'Exceptional! Two months of unwavering commitment.',
  },
  90: {
    points: 750,
    title: 'Quarterly Champion',
    message: 'Legendary! Three months of writing excellence.',
  },
  180: {
    points: 1500,
    title: 'Half-Year Hero',
    message: 'Phenomenal! Six months of consistent creativity.',
  },
  365: {
    points: 3000,
    title: 'Annual Legend',
    message: 'LEGENDARY STATUS! A full year of daily writing!',
  },
} as const;
