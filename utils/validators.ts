import { z } from 'zod';
import { 
  VALIDATION_RULES, 
  USER_ROLES, 
  STORY_STATUS, 
  COMMENT_TYPES,
  FILE_CONFIG,
  ACHIEVEMENT_TYPES,
  ACHIEVEMENT_RARITY,
  AI_MODELS,
  AI_PROVIDERS,
  EMAIL_TYPES,
  NOTIFICATION_TYPES,
  SUBSCRIPTION_TIERS,
  SUBSCRIPTION_STATUS 
} from './constants';

// Base field-level schemas
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(VALIDATION_RULES.PASSWORD.MIN_LENGTH, `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`)
  .regex(VALIDATION_RULES.PASSWORD.PATTERN, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

export const nameSchema = z
  .string()
  .min(VALIDATION_RULES.NAME.MIN_LENGTH, `Name must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters`)
  .max(VALIDATION_RULES.NAME.MAX_LENGTH, `Name must be no more than ${VALIDATION_RULES.NAME.MAX_LENGTH} characters`)
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

export const ageSchema = z.preprocess(
  val => (typeof val === 'string' ? Number(val) : val),
  z.number().min(2, 'Age must be at least 2').max(18, 'Age must be no more than 18')
);

// User Registration schema
export const userRegistrationSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    age: ageSchema,
    role: z.enum([USER_ROLES.CHILD, USER_ROLES.MENTOR, USER_ROLES.ADMIN]).default(USER_ROLES.CHILD),
    parentEmail: z.string().email().optional(),
    termsAccepted: z.boolean().refine(v => v === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine(data => {
    if (data.age < 13 && !data.parentEmail) return false;
    return true;
  }, {
    message: 'Parent email is required for children under 13',
    path: ['parentEmail'],
  });

// Auth schemas
export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const passwordResetSchema = z.object({
  email: emailSchema,
});

export const passwordResetConfirmSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const profileUpdateSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema.optional(),
  age: ageSchema.optional(),
  bio: z.string().max(500, 'Bio must be no more than 500 characters').optional(),
  avatar: z.string().url().optional(),
});

// Story schemas
export const storyCreationSchema = z.object({
  title: z
    .string()
    .min(VALIDATION_RULES.STORY_TITLE.MIN_LENGTH, `Title must be at least ${VALIDATION_RULES.STORY_TITLE.MIN_LENGTH} characters`)
    .max(VALIDATION_RULES.STORY_TITLE.MAX_LENGTH, `Title must be no more than ${VALIDATION_RULES.STORY_TITLE.MAX_LENGTH} characters`),
  elements: z.object({
    genre: z.string().min(1, 'Please select a genre'),
    setting: z.string().min(1, 'Please select a setting'),
    character: z.string().min(1, 'Please select a character'),
    mood: z.string().min(1, 'Please select a mood'),
    conflict: z.string().min(1, 'Please select a conflict'),
    theme: z.string().min(1, 'Please select a theme'),
  }),
  content: z
    .string()
    .min(VALIDATION_RULES.STORY_CONTENT.MIN_LENGTH, `Story must be at least ${VALIDATION_RULES.STORY_CONTENT.MIN_LENGTH} characters`)
    .max(VALIDATION_RULES.STORY_CONTENT.MAX_LENGTH, `Story must be no more than ${VALIDATION_RULES.STORY_CONTENT.MAX_LENGTH} characters`),
  status: z.enum([STORY_STATUS.DRAFT, STORY_STATUS.IN_PROGRESS, STORY_STATUS.COMPLETED]).default(STORY_STATUS.DRAFT),
});

export const storyUpdateSchema = z.object({
  title: z
    .string()
    .min(VALIDATION_RULES.STORY_TITLE.MIN_LENGTH)
    .max(VALIDATION_RULES.STORY_TITLE.MAX_LENGTH)
    .optional(),
  content: z
    .string()
    .min(VALIDATION_RULES.STORY_CONTENT.MIN_LENGTH)
    .max(VALIDATION_RULES.STORY_CONTENT.MAX_LENGTH)
    .optional(),
  status: z.enum([STORY_STATUS.DRAFT, STORY_STATUS.IN_PROGRESS, STORY_STATUS.COMPLETED, STORY_STATUS.PUBLISHED]).optional(),
});

export const aiCollaborationSchema = z.object({
  storyId: z.string().min(1, 'Story ID is required'),
  userInput: z
    .string()
    .min(10, 'Please write at least 10 characters')
    .max(200, 'Please keep your input under 200 characters'),
  turnNumber: z.number().min(1),
});

// Comment schema
export const commentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be no more than 1000 characters'),
  type: z.enum([COMMENT_TYPES.GRAMMAR, COMMENT_TYPES.CREATIVITY, COMMENT_TYPES.SUGGESTION, COMMENT_TYPES.PRAISE, COMMENT_TYPES.IMPROVEMENT, COMMENT_TYPES.QUESTION]).optional().default(COMMENT_TYPES.PRAISE),
  parentId: z.string().optional(),
  highlightedText: z.string().optional(),
});

// Contact form schema
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be no more than 100 characters'),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(1000, 'Message must be no more than 1000 characters'),
});

// File upload schema
export const fileUploadSchema = z.object({
  file: z
    .any()
    .refine(file => file?.size <= FILE_CONFIG.MAX_SIZE, 'File size must be less than 10MB')
    .refine(
      file => [...FILE_CONFIG.ALLOWED_TYPES.IMAGES, ...FILE_CONFIG.ALLOWED_TYPES.DOCUMENTS].includes(file?.type),
      'File must be an image (JPEG, PNG, GIF, WebP) or PDF'
    ),
});

// Achievement schema
export const achievementSchema = z.object({
  name: z.string().min(1, 'Achievement name is required').max(100, 'Name must be no more than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be no more than 500 characters'),
  icon: z.string().min(1, 'Icon is required'),
  type: z.enum([ACHIEVEMENT_TYPES.STORY_MILESTONE, ACHIEVEMENT_TYPES.QUALITY_SCORE, ACHIEVEMENT_TYPES.STREAK, ACHIEVEMENT_TYPES.CREATIVITY, ACHIEVEMENT_TYPES.GRAMMAR, ACHIEVEMENT_TYPES.SPECIAL]),
  rarity: z.enum([ACHIEVEMENT_RARITY.COMMON, ACHIEVEMENT_RARITY.UNCOMMON, ACHIEVEMENT_RARITY.RARE, ACHIEVEMENT_RARITY.EPIC, ACHIEVEMENT_RARITY.LEGENDARY]).default(ACHIEVEMENT_RARITY.COMMON),
  points: z.number().min(1, 'Points must be at least 1').max(1000, 'Points must be no more than 1000'),
  criteria: z.object({
    storiesCompleted: z.number().min(0).optional(),
    grammarScore: z.number().min(0).max(100).optional(),
    creativityScore: z.number().min(0).max(100).optional(),
    overallScore: z.number().min(0).max(100).optional(),
    streakDays: z.number().min(0).optional(),
    totalWords: z.number().min(0).optional(),
    specificGenre: z.string().optional(),
    customCriteria: z.record(z.any()).optional(),
  }),
});

// AI Provider schema
export const aiProviderSchema = z.object({
  provider: z.enum([AI_PROVIDERS.OPENAI, AI_PROVIDERS.ANTHROPIC, AI_PROVIDERS.GOOGLE]),
  modelName: z.enum([AI_MODELS.GPT_4O_MINI, AI_MODELS.GPT_4O_NANO, AI_MODELS.CLAUDE_3_HAIKU, AI_MODELS.GEMINI_1_5_FLASH, AI_MODELS.O1_MINI, AI_MODELS.O3_MINI]),
  apiKey: z.string().min(1, 'API key is required'),
  maxTokens: z.number().min(100).max(4000).default(1000),
  temperature: z.number().min(0).max(2).default(0.7),
  costPerToken: z.number().min(0),
 priority: z.number().min(1).max(10).default(5),
 rateLimits: z.object({
   requestsPerMinute: z.number().min(1).default(60),
   requestsPerDay: z.number().min(1).default(1000),
   tokensPerDay: z.number().min(1).default(100000),
 }).optional(),
});

// Subscription schema
export const subscriptionSchema = z.object({
 userId: z.string().min(1, 'User ID is required'),
 tier: z.enum([SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.BASIC, SUBSCRIPTION_TIERS.PREMIUM, SUBSCRIPTION_TIERS.PRO]).default(SUBSCRIPTION_TIERS.FREE),
 status: z.enum([SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.CANCELED, SUBSCRIPTION_STATUS.PAST_DUE, SUBSCRIPTION_STATUS.TRIALING, SUBSCRIPTION_STATUS.INCOMPLETE]).default(SUBSCRIPTION_STATUS.ACTIVE),
 stripeSubscriptionId: z.string().optional(),
 stripeCustomerId: z.string().optional(),
 stripePriceId: z.string().optional(),
});

// Email template schema
export const emailTemplateSchema = z.object({
 name: z.string().min(1, 'Template name is required'),
 type: z.enum([EMAIL_TYPES.WELCOME, EMAIL_TYPES.PASSWORD_RESET, EMAIL_TYPES.STORY_COMPLETED, EMAIL_TYPES.MENTOR_COMMENT, EMAIL_TYPES.ACHIEVEMENT_UNLOCKED, EMAIL_TYPES.WEEKLY_PROGRESS, EMAIL_TYPES.SUBSCRIPTION_REMINDER, EMAIL_TYPES.SUBSCRIPTION_EXPIRED]),
 subject: z.string().min(1, 'Subject is required'),
 htmlContent: z.string().min(1, 'HTML content is required'),
 textContent: z.string().min(1, 'Text content is required'),
 variables: z.array(z.string()).default([]),
});

// Notification schema
export const notificationSchema = z.object({
 userId: z.string().min(1, 'User ID is required'),
 type: z.enum([NOTIFICATION_TYPES.STORY_COMPLETED, NOTIFICATION_TYPES.MENTOR_COMMENT, NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED, NOTIFICATION_TYPES.SUBSCRIPTION_EXPIRING, NOTIFICATION_TYPES.WEEKLY_PROGRESS, NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT]),
 title: z.string().min(1, 'Title is required').max(200, 'Title must be no more than 200 characters'),
 message: z.string().min(1, 'Message is required').max(1000, 'Message must be no more than 1000 characters'),
 data: z.record(z.any()).default({}),
 priority: z.number().min(0).max(10).default(0),
 expiresAt: z.date().optional(),
});

// Assessment schema
export const storyAssessmentSchema = z.object({
 storyId: z.string().min(1, 'Story ID is required'),
 userId: z.string().min(1, 'User ID is required'),
 grammarScore: z.number().min(0).max(100),
 creativityScore: z.number().min(0).max(100),
 overallScore: z.number().min(0).max(100),
 feedback: z.string().min(1, 'Feedback is required'),
 suggestions: z.array(z.string()).default([]),
 strengths: z.array(z.string()).default([]),
 improvements: z.array(z.string()).default([]),
});

// Validation helper functions
export const validateUserRegistration = (data: unknown) => userRegistrationSchema.safeParse(data);
export const validateUserLogin = (data: unknown) => userLoginSchema.safeParse(data);
export const validateStoryCreation = (data: unknown) => storyCreationSchema.safeParse(data);
export const validateStoryUpdate = (data: unknown) => storyUpdateSchema.safeParse(data);
export const validateComment = (data: unknown) => commentSchema.safeParse(data);
export const validateContactForm = (data: unknown) => contactFormSchema.safeParse(data);
export const validateFileUpload = (data: unknown) => fileUploadSchema.safeParse(data);
export const validateAchievement = (data: unknown) => achievementSchema.safeParse(data);
export const validateAIProvider = (data: unknown) => aiProviderSchema.safeParse(data);
export const validateSubscription = (data: unknown) => subscriptionSchema.safeParse(data);
export const validateEmailTemplate = (data: unknown) => emailTemplateSchema.safeParse(data);
export const validateNotification = (data: unknown) => notificationSchema.safeParse(data);
export const validateStoryAssessment = (data: unknown) => storyAssessmentSchema.safeParse(data);

// Single field validators
export const validateEmailOnly = (email: string) => emailSchema.safeParse(email);
export const validatePasswordOnly = (password: string) => passwordSchema.safeParse(password);
export const validateAgeOnly = (age: number) => ageSchema.safeParse(age);
export const validateNameOnly = (name: string) => nameSchema.safeParse(name);

// Utility validation functions
export function isValidObjectId(id: string): boolean {
 return /^[0-9a-fA-F]{24}$/.test(id);
}

export function isValidStoryWordCount(wordCount: number): boolean {
 return wordCount >= VALIDATION_RULES.STORY_CONTENT.MIN_LENGTH && wordCount <= VALIDATION_RULES.STORY_CONTENT.MAX_LENGTH;
}

export function isValidAge(age: number): boolean {
 return age >= 2 && age <= 18;
}

export function isValidTier(tier: string): boolean {
 return Object.values(SUBSCRIPTION_TIERS).includes(tier as any);
}

export function isValidRole(role: string): boolean {
 return Object.values(USER_ROLES).includes(role as any);
}

export function isValidStoryStatus(status: string): boolean {
 return Object.values(STORY_STATUS).includes(status as any);
}

export function isValidCommentType(type: string): boolean {
 return Object.values(COMMENT_TYPES).includes(type as any);
}

export function isValidAchievementType(type: string): boolean {
 return Object.values(ACHIEVEMENT_TYPES).includes(type as any);
}

export function isValidAIProvider(provider: string): boolean {
 return Object.values(AI_PROVIDERS).includes(provider as any);
}

export function isValidAIModel(model: string): boolean {
 return Object.values(AI_MODELS).includes(model as any);
}

export function isValidEmailType(type: string): boolean {
 return Object.values(EMAIL_TYPES).includes(type as any);
}

export function isValidNotificationType(type: string): boolean {
 return Object.values(NOTIFICATION_TYPES).includes(type as any);
}