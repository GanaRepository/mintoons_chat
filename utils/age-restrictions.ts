import { AGE_GROUPS } from './constants';

export interface AgeGroup {
  min: number;
  max: number;
  label: string;
}

export interface ContentRating {
  minAge: number;
  maxAge: number;
  restrictions: string[];
  allowedFeatures: string[];
}

/**
 * Get age group for a given age using constants
 */
export function getAgeGroup(age: number): AgeGroup | null {
  const groups = Object.values(AGE_GROUPS);
  return groups.find(group => age >= group.min && age <= group.max) || null;
}

/**
 * Check if age is valid for platform
 */
export function isValidAge(age: number): boolean {
  return age >= 2 && age <= 18;
}

/**
 * Check if user needs parental consent (COPPA compliance)
 */
export function needsParentalConsent(age: number): boolean {
  return age < 13;
}

/**
 * Get content rating based on age
 */
export function getContentRating(age: number): ContentRating {
  const ageGroup = getAgeGroup(age);
  
  if (!ageGroup) {
    return {
      minAge: 2,
      maxAge: 18,
      restrictions: ['Content under review'],
      allowedFeatures: ['Basic access'],
    };
  }

  if (ageGroup === AGE_GROUPS.TODDLER) {
    return {
      minAge: 2,
      maxAge: 4,
      restrictions: [
        'No scary content',
        'Simple vocabulary only',
        'No violence or conflict',
        'Bright, cheerful themes only',
        'Adult supervision required',
      ],
      allowedFeatures: [
        'Basic story creation',
        'Picture-based selections',
        'Audio narration',
        'Simple AI responses',
      ],
    };
  }

  if (ageGroup === AGE_GROUPS.PRESCHOOL) {
    return {
      minAge: 5,
      maxAge: 6,
      restrictions: [
        'Mild adventure themes only',
        'Age-appropriate vocabulary',
        'No intense emotions',
        'Positive resolutions required',
      ],
      allowedFeatures: [
        'Story creation with guidance',
        'Basic achievement system',
        'Simple mentor feedback',
        'PDF download',
      ],
    };
  }

  if (ageGroup === AGE_GROUPS.EARLY_ELEMENTARY) {
    return {
      minAge: 7,
      maxAge: 9,
      restrictions: [
        'Light conflict acceptable',
        'Educational themes preferred',
        'No romantic content',
        'Problem-solving focus',
      ],
      allowedFeatures: [
        'Full story creation',
        'AI collaboration',
        'Achievement badges',
        'Mentor commenting',
        'Story sharing (moderated)',
      ],
    };
  }

  if (ageGroup === AGE_GROUPS.LATE_ELEMENTARY) {
    return {
      minAge: 10,
      maxAge: 12,
      restrictions: [
        'Moderate adventure themes',
        'Age-appropriate challenges',
        'Friendship focus',
        'Positive role models',
      ],
      allowedFeatures: [
        'Advanced story features',
        'Complex AI interactions',
        'Full achievement system',
        'Detailed mentor feedback',
        'Export options',
        'Progress analytics',
      ],
    };
  }

  if (ageGroup === AGE_GROUPS.MIDDLE_SCHOOL) {
    return {
      minAge: 13,
      maxAge: 15,
      restrictions: [
        'Teen-appropriate content',
        'Mild romantic themes allowed',
        'Coming-of-age themes',
        'Real-world issues (age-appropriate)',
      ],
      allowedFeatures: [
        'All story features',
        'Advanced AI collaboration',
        'Peer story sharing',
        'Mentor discussions',
        'Creative challenges',
        'Story contests',
      ],
    };
  }

  if (ageGroup === AGE_GROUPS.HIGH_SCHOOL) {
    return {
      minAge: 16,
      maxAge: 18,
      restrictions: [
        'Young adult content',
        'Complex themes allowed',
        'Mature storytelling',
        'Real-world preparation',
      ],
      allowedFeatures: [
        'Full platform access',
        'Advanced story analysis',
        'Publication opportunities',
        'Mentor collaboration',
        'Creative workshops',
        'Career guidance',
      ],
    };
  }

  // Default fallback
  return {
    minAge: 2,
    maxAge: 18,
    restrictions: ['Content under review'],
    allowedFeatures: ['Basic access'],
  };
}

/**
 * Filter AI response content based on age
 */
export function filterAIResponse(response: string, age: number): string {
  const rating = getContentRating(age);

  // Apply age-specific filtering
  if (age <= 6) {
    // Remove any potentially scary words
    const scaryWords = ['dark', 'scary', 'monster', 'afraid', 'danger', 'lost'];
    let filtered = response;

    scaryWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      filtered = filtered.replace(regex, getPositiveAlternative(word));
    });

    return filtered;
  }

  if (age <= 12) {
    // Ensure positive, educational content
    return ensurePositiveTone(response);
  }

  // For teens, minimal filtering
  return response;
}

/**
 * Get positive alternative for potentially concerning words
 */
function getPositiveAlternative(word: string): string {
  const alternatives: Record<string, string> = {
    dark: 'shadowy',
    scary: 'mysterious',
    monster: 'creature',
    afraid: 'curious',
    danger: 'adventure',
    lost: 'exploring',
  };

  return alternatives[word.toLowerCase()] || word;
}

/**
 * Ensure response has positive tone
 */
function ensurePositiveTone(response: string): string {
  // Add encouraging words if response seems neutral
  const encouragingStarters = [
    "That's a great idea!",
    'How creative!',
    'I love that!',
    'What an interesting choice!',
  ];

  // Simple check - if response doesn't start with encouragement, add some
  const hasPositiveStart = /^(great|wonderful|amazing|fantastic|excellent|love|perfect)/i.test(response);

  if (!hasPositiveStart) {
    const starter = encouragingStarters[Math.floor(Math.random() * encouragingStarters.length)];
    return `${starter} ${response}`;
  }

  return response;
}

/**
 * Check if feature is allowed for age group
 */
export function isFeatureAllowed(feature: string, age: number): boolean {
  const rating = getContentRating(age);
  return rating.allowedFeatures.includes(feature);
}

/**
 * Get story length recommendations by age
 */
export function getAgeAppropriateTarget(age: number): number {
  const ageGroup = getAgeGroup(age);
  
  if (ageGroup === AGE_GROUPS.TODDLER) return 100;
  if (ageGroup === AGE_GROUPS.PRESCHOOL) return 200;
  if (ageGroup === AGE_GROUPS.EARLY_ELEMENTARY) return 300;
  if (ageGroup === AGE_GROUPS.LATE_ELEMENTARY) return 500;
  if (ageGroup === AGE_GROUPS.MIDDLE_SCHOOL) return 700;
  if (ageGroup === AGE_GROUPS.HIGH_SCHOOL) return 900;
  
  return 300; // Default
}

/**
 * Get AI complexity level based on age
 */
export function getAIComplexityLevel(age: number): 'simple' | 'moderate' | 'advanced' {
  if (age <= 6) return 'simple';
  if (age <= 12) return 'moderate';
  return 'advanced';
}

/**
 * Get vocabulary level for AI responses
 */
export function getVocabularyLevel(age: number): 'basic' | 'intermediate' | 'advanced' {
  if (age <= 8) return 'basic';
  if (age <= 14) return 'intermediate';
  return 'advanced';
}

/**
 * Check if content should be pre-moderated
 */
export function requiresPreModeration(age: number): boolean {
  return age <= 10;
}

/**
 * Get parental notification requirements
 */
export function getParentalNotificationLevel(age: number): 'none' | 'summary' | 'detailed' {
  if (age >= 16) return 'none';
  if (age >= 13) return 'summary';
  return 'detailed';
}

/**
 * Validate age against minimum requirements
 */
export function validateMinimumAge(age: number, feature: string): boolean {
  const minimumAges: Record<string, number> = {
    story_creation: 2,
    ai_collaboration: 4,
    mentor_feedback: 5,
    story_sharing: 7,
    peer_interaction: 13,
    publication: 16,
  };

  return age >= (minimumAges[feature] || 2);
}