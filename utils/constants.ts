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

// Achievement Types
export const ACHIEVEMENTS = {
  FIRST_STORY: {
    id: 'first_story',
    name: 'First Story',
    description: 'Completed your very first story!',
    icon: '📝',
    points: 10,
  },
  CREATIVE_WRITER: {
    id: 'creative_writer',
    name: 'Creative Writer',
    description: 'Scored 90+ on creativity assessment',
    icon: '🎨',
    points: 25,
  },
  GRAMMAR_MASTER: {
    id: 'grammar_master',
    name: 'Grammar Master',
    description: 'Perfect grammar score!',
    icon: '📚',
    points: 25,
  },
  STREAK_MASTER: {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Written stories for 7 days in a row',
    icon: '🔥',
    points: 50,
  },
  PROLIFIC_WRITER: {
    id: 'prolific_writer',
    name: 'Prolific Writer',
    description: 'Completed 10 stories',
    icon: '✍️',
    points: 100,
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
