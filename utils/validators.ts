// // utils/validators.ts - Zod validation schemas
// import { z } from 'zod';
// import { VALIDATION_RULES, USER_ROLES, STORY_STATUS } from './constants';

// // Base schemas
// export const emailSchema = z
//   .string()
//   .email('Please enter a valid email address')
//   .min(1, 'Email is required');

// export const passwordSchema = z
//   .string()
//   .min(
//     VALIDATION_RULES.PASSWORD.MIN_LENGTH,
//     `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`
//   )
//   .regex(
//     VALIDATION_RULES.PASSWORD.PATTERN,
//     'Password must contain at least one lowercase letter, one uppercase letter, and one number'
//   );

// export const nameSchema = z
//   .string()
//   .min(
//     VALIDATION_RULES.NAME.MIN_LENGTH,
//     `Name must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters`
//   )
//   .max(
//     VALIDATION_RULES.NAME.MAX_LENGTH,
//     `Name must be no more than ${VALIDATION_RULES.NAME.MAX_LENGTH} characters`
//   )
//   .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

// export const ageSchema = z
//   .number()
//   .min(2, 'Age must be at least 2')
//   .max(18, 'Age must be no more than 18');

// // User Registration Schema
// export const userRegistrationSchema = z
//   .object({
//     firstName: nameSchema,
//     lastName: nameSchema,
//     email: emailSchema,
//     password: passwordSchema,
//     confirmPassword: z.string(),
//     age: ageSchema,
//     role: z
//       .enum([USER_ROLES.CHILD, USER_ROLES.MENTOR, USER_ROLES.ADMIN])
//       .default(USER_ROLES.CHILD),
//     parentEmail: z.string().email().optional(),
//     termsAccepted: z.boolean().refine(val => val === true, {
//       message: 'You must accept the terms and conditions',
//     }),
//   })
//   .refine(data => data.password === data.confirmPassword, {
//     message: "Passwords don't match",
//     path: ['confirmPassword'],
//   })
//   .refine(
//     data => {
//       // Require parent email for children under 13
//       if (data.age < 13 && !data.parentEmail) {
//         return false;
//       }
//       return true;
//     },
//     {
//       message: 'Parent email is required for children under 13',
//       path: ['parentEmail'],
//     }
//   );

// // User Login Schema
// export const userLoginSchema = z.object({
//   email: emailSchema,
//   password: z.string().min(1, 'Password is required'),
// });

// // Password Reset Schema
// export const passwordResetSchema = z.object({
//   email: emailSchema,
// });

// export const passwordResetConfirmSchema = z
//   .object({
//     token: z.string().min(1, 'Reset token is required'),
//     password: passwordSchema,
//     confirmPassword: z.string(),
//   })
//   .refine(data => data.password === data.confirmPassword, {
//     message: "Passwords don't match",
//     path: ['confirmPassword'],
//   });

// // Profile Update Schema
// export const profileUpdateSchema = z.object({
//   firstName: nameSchema.optional(),
//   lastName: nameSchema.optional(),
//   email: emailSchema.optional(),
//   age: ageSchema.optional(),
//   bio: z
//     .string()
//     .max(500, 'Bio must be no more than 500 characters')
//     .optional(),
//   avatar: z.string().url().optional(),
// });

// // Story Creation Schema
// export const storyCreationSchema = z.object({
//   title: z
//     .string()
//     .min(
//       VALIDATION_RULES.STORY_TITLE.MIN_LENGTH,
//       `Title must be at least ${VALIDATION_RULES.STORY_TITLE.MIN_LENGTH} characters`
//     )
//     .max(
//       VALIDATION_RULES.STORY_TITLE.MAX_LENGTH,
//       `Title must be no more than ${VALIDATION_RULES.STORY_TITLE.MAX_LENGTH} characters`
//     ),

//   elements: z.object({
//     genre: z.string().min(1, 'Please select a genre'),
//     setting: z.string().min(1, 'Please select a setting'),
//     character: z.string().min(1, 'Please select a character'),
//     mood: z.string().min(1, 'Please select a mood'),
//     conflict: z.string().min(1, 'Please select a conflict'),
//     theme: z.string().min(1, 'Please select a theme'),
//   }),

//   content: z
//     .string()
//     .min(
//       VALIDATION_RULES.STORY_CONTENT.MIN_LENGTH,
//       `Story must be at least ${VALIDATION_RULES.STORY_CONTENT.MIN_LENGTH} characters`
//     )
//     .max(
//       VALIDATION_RULES.STORY_CONTENT.MAX_LENGTH,
//       `Story must be no more than ${VALIDATION_RULES.STORY_CONTENT.MAX_LENGTH} characters`
//     ),

//   status: z
//     .enum([
//       STORY_STATUS.DRAFT,
//       STORY_STATUS.IN_PROGRESS,
//       STORY_STATUS.COMPLETED,
//     ])
//     .default(STORY_STATUS.DRAFT),
// });

// // Story Update Schema
// export const storyUpdateSchema = z.object({
//   title: z
//     .string()
//     .min(VALIDATION_RULES.STORY_TITLE.MIN_LENGTH)
//     .max(VALIDATION_RULES.STORY_TITLE.MAX_LENGTH)
//     .optional(),

//   content: z
//     .string()
//     .min(VALIDATION_RULES.STORY_CONTENT.MIN_LENGTH)
//     .max(VALIDATION_RULES.STORY_CONTENT.MAX_LENGTH)
//     .optional(),

//   status: z
//     .enum([
//       STORY_STATUS.DRAFT,
//       STORY_STATUS.IN_PROGRESS,
//       STORY_STATUS.COMPLETED,
//       STORY_STATUS.PUBLISHED,
//     ])
//     .optional(),
// });

// // AI Collaboration Schema
// export const aiCollaborationSchema = z.object({
//   storyId: z.string().min(1, 'Story ID is required'),
//   userInput: z
//     .string()
//     .min(10, 'Please write at least 10 characters')
//     .max(200, 'Please keep your input under 200 characters'),
//   turnNumber: z.number().min(1),
// });

// // Comment Schema
// export const commentSchema = z.object({
//   storyId: z.string().min(1, 'Story ID is required'),
//   content: z
//     .string()
//     .min(1, 'Comment cannot be empty')
//     .max(1000, 'Comment must be no more than 1000 characters'),
//   highlightedText: z.string().optional(),
//   commentType: z
//     .enum(['grammar', 'creativity', 'suggestion', 'praise', 'improvement'])
//     .optional(),
// });

// // Contact Form Schema
// export const contactFormSchema = z.object({
//   name: nameSchema,
//   email: emailSchema,
//   subject: z
//     .string()
//     .min(5, 'Subject must be at least 5 characters')
//     .max(100, 'Subject must be no more than 100 characters'),
//   message: z
//     .string()
//     .min(20, 'Message must be at least 20 characters')
//     .max(1000, 'Message must be no more than 1000 characters'),
// });

// // File Upload Schema
// export const fileUploadSchema = z.object({
//   file: z
//     .any()
//     .refine(
//       file => file?.size <= 10 * 1024 * 1024,
//       'File size must be less than 10MB'
//     )
//     .refine(
//       file =>
//         [
//           'image/jpeg',
//           'image/png',
//           'image/gif',
//           'image/webp',
//           'application/pdf',
//         ].includes(file?.type),
//       'File must be an image (JPEG, PNG, GIF, WebP) or PDF'
//     ),
// });

// // Subscription Schema
// export const subscriptionSchema = z.object({
//   priceId: z.string().min(1, 'Price ID is required'),
//   tierId: z.enum(['FREE', 'BASIC', 'PREMIUM', 'PRO']),
// });

// // Admin User Management Schema
// export const adminUserManagementSchema = z.object({
//   userId: z.string().min(1, 'User ID is required'),
//   role: z.enum([USER_ROLES.CHILD, USER_ROLES.MENTOR, USER_ROLES.ADMIN]),
//   isActive: z.boolean().optional(),
//   subscriptionTier: z.enum(['FREE', 'BASIC', 'PREMIUM', 'PRO']).optional(),
// });

// // Mentor Assignment Schema
// export const mentorAssignmentSchema = z.object({
//   mentorId: z.string().min(1, 'Mentor ID is required'),
//   studentIds: z
//     .array(z.string().min(1, 'Student ID is required'))
//     .min(1, 'At least one student must be assigned'),
// });

// // Story Assessment Schema
// export const storyAssessmentSchema = z.object({
//   storyId: z.string().min(1, 'Story ID is required'),
//   grammarScore: z.number().min(0).max(100),
//   creativityScore: z.number().min(0).max(100),
//   overallScore: z.number().min(0).max(100),
//   feedback: z.string().min(10, 'Feedback must be at least 10 characters'),
//   suggestions: z.array(z.string()).optional(),
//   strengths: z.array(z.string()).optional(),
//   improvements: z.array(z.string()).optional(),
// });

// // Search/Filter Schemas
// export const storyFilterSchema = z.object({
//   status: z
//     .enum([
//       STORY_STATUS.DRAFT,
//       STORY_STATUS.IN_PROGRESS,
//       STORY_STATUS.COMPLETED,
//       STORY_STATUS.PUBLISHED,
//     ])
//     .optional(),
//   genre: z.string().optional(),
//   dateFrom: z.string().datetime().optional(),
//   dateTo: z.string().datetime().optional(),
//   search: z.string().optional(),
//   sortBy: z
//     .enum(['createdAt', 'updatedAt', 'title', 'wordCount'])
//     .default('createdAt'),
//   sortOrder: z.enum(['asc', 'desc']).default('desc'),
//   limit: z.number().min(1).max(100).default(10),
//   offset: z.number().min(0).default(0),
// });

// // Notification Schema
// export const notificationSchema = z.object({
//   userId: z.string().min(1, 'User ID is required'),
//   type: z.enum([
//     'story_completed',
//     'mentor_comment',
//     'achievement_unlocked',
//     'subscription_expiring',
//   ]),
//   title: z.string().min(1, 'Title is required'),
//   message: z.string().min(1, 'Message is required'),
//   data: z.record(z.any()).optional(),
// });

// // Export validation helper functions
// export const validateUserRegistration = (data: unknown) =>
//   userRegistrationSchema.parse(data);
// export const validateUserLogin = (data: unknown) => userLoginSchema.safeParse(data);
// export const validateStoryCreation = (data: unknown) =>
//   storyCreationSchema.parse(data);
// export const validateComment = (data: unknown) => commentSchema.parse(data);
// export const validateContactForm = (data: unknown) =>
//   contactFormSchema.parse(data);

// // Partial validation for forms
// export const validateEmailOnly = (email: string) => emailSchema.parse(email);
// export const validatePasswordOnly = (password: string) =>
//   passwordSchema.parse(password);
// export const validateAgeOnly = (age: number) => ageSchema.parse(age);

// // Custom validation helpers
// export function isValidObjectId(id: string): boolean {
//   return /^[0-9a-fA-F]{24}$/.test(id);
// }

// export function isValidStoryWordCount(wordCount: number): boolean {
//   return wordCount >= 300 && wordCount <= 600;
// }

// export function isValidAge(age: number): boolean {
//   return age >= 2 && age <= 18;
// }

// export function isValidTier(tier: string): boolean {
//   return ['FREE', 'BASIC', 'PREMIUM', 'PRO'].includes(tier.toUpperCase());
// }

// export function isValidRole(role: string): boolean {
//   return Object.values(USER_ROLES).includes(role as any);
// }

// utils/validators.ts
import { z } from 'zod';
import { VALIDATION_RULES, USER_ROLES, STORY_STATUS } from './constants';
import type { RegisterData } from '@/types/auth'; // optional, for stronger typing

/* ────────────────────────────────────────────────────
   Base field-level schemas
   ──────────────────────────────────────────────────── */
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(
    VALIDATION_RULES.PASSWORD.MIN_LENGTH,
    `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`
  )
  .regex(
    VALIDATION_RULES.PASSWORD.PATTERN,
    'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  );

export const nameSchema = z
  .string()
  .min(
    VALIDATION_RULES.NAME.MIN_LENGTH,
    `Name must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters`
  )
  .max(
    VALIDATION_RULES.NAME.MAX_LENGTH,
    `Name must be no more than ${VALIDATION_RULES.NAME.MAX_LENGTH} characters`
  )
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

export const ageSchema = z
  .number()
  .min(2, 'Age must be at least 2')
  .max(18, 'Age must be no more than 18');

/* ────────────────────────────────────────────────────
   User Registration schema
   ──────────────────────────────────────────────────── */
export const userRegistrationSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    age: ageSchema,
    role: z
      .enum([USER_ROLES.CHILD, USER_ROLES.MENTOR, USER_ROLES.ADMIN])
      .default(USER_ROLES.CHILD),
    parentEmail: z.string().email().optional(),
    termsAccepted: z.boolean().refine(v => v === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine(
    data => {
      // Parent email is required for children < 13
      if (data.age < 13 && !data.parentEmail) return false;
      return true;
    },
    {
      message: 'Parent email is required for children under 13',
      path: ['parentEmail'],
    }
  );

/* ────────────────────────────────────────────────────
   Auth / profile / story schemas
   ──────────────────────────────────────────────────── */
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
  bio: z
    .string()
    .max(500, 'Bio must be no more than 500 characters')
    .optional(),
  avatar: z.string().url().optional(),
});

/* Story creation, update, collaboration … (unchanged) */
export const storyCreationSchema = z.object({
  title: z
    .string()
    .min(
      VALIDATION_RULES.STORY_TITLE.MIN_LENGTH,
      `Title must be at least ${VALIDATION_RULES.STORY_TITLE.MIN_LENGTH} characters`
    )
    .max(
      VALIDATION_RULES.STORY_TITLE.MAX_LENGTH,
      `Title must be no more than ${VALIDATION_RULES.STORY_TITLE.MAX_LENGTH} characters`
    ),
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
    .min(
      VALIDATION_RULES.STORY_CONTENT.MIN_LENGTH,
      `Story must be at least ${VALIDATION_RULES.STORY_CONTENT.MIN_LENGTH} characters`
    )
    .max(
      VALIDATION_RULES.STORY_CONTENT.MAX_LENGTH,
      `Story must be no more than ${VALIDATION_RULES.STORY_CONTENT.MAX_LENGTH} characters`
    ),
  status: z
    .enum([
      STORY_STATUS.DRAFT,
      STORY_STATUS.IN_PROGRESS,
      STORY_STATUS.COMPLETED,
    ])
    .default(STORY_STATUS.DRAFT),
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
  status: z
    .enum([
      STORY_STATUS.DRAFT,
      STORY_STATUS.IN_PROGRESS,
      STORY_STATUS.COMPLETED,
      STORY_STATUS.PUBLISHED,
    ])
    .optional(),
});

export const aiCollaborationSchema = z.object({
  storyId: z.string().min(1, 'Story ID is required'),
  userInput: z
    .string()
    .min(10, 'Please write at least 10 characters')
    .max(200, 'Please keep your input under 200 characters'),
  turnNumber: z.number().min(1),
});

export const commentSchema = z.object({
  storyId: z.string().min(1, 'Story ID is required'),
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be no more than 1000 characters'),
  highlightedText: z.string().optional(),
  commentType: z
    .enum(['grammar', 'creativity', 'suggestion', 'praise', 'improvement'])
    .optional(),
});

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

/* (Remaining schemas: fileUploadSchema, subscriptionSchema, adminUserManagementSchema,
   mentorAssignmentSchema, storyAssessmentSchema, storyFilterSchema, notificationSchema)
   — left unchanged for brevity but still present in your file
   ──────────────────────────────────────────────────── */

/* ────────────────────────────────────────────────────
   Top-level helper functions
   ──────────────────────────────────────────────────── */
// ✅  safeParse so callers can check `result.success`
export const validateUserRegistration = (data: unknown) =>
  userRegistrationSchema.safeParse(data);

export const validateUserLogin = (data: unknown) =>
  userLoginSchema.safeParse(data);

export const validateStoryCreation = (data: unknown) =>
  storyCreationSchema.parse(data);

export const validateComment = (data: unknown) => commentSchema.parse(data);

export const validateContactForm = (data: unknown) =>
  contactFormSchema.parse(data);

/* Partial helpers */
export const validateEmailOnly = (email: string) => emailSchema.parse(email);
export const validatePasswordOnly = (password: string) =>
  passwordSchema.parse(password);
export const validateAgeOnly = (age: number) => ageSchema.parse(age);

/* Custom utility helpers */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export function isValidStoryWordCount(wordCount: number): boolean {
  return wordCount >= 300 && wordCount <= 600;
}

export function isValidAge(age: number): boolean {
  return age >= 2 && age <= 18;
}

export function isValidTier(tier: string): boolean {
  return ['FREE', 'BASIC', 'PREMIUM', 'PRO'].includes(tier.toUpperCase());
}

export function isValidRole(role: string): boolean {
  return Object.values(USER_ROLES).includes(role as any);
}
