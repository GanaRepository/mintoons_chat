// lib/ai/content-filter.ts - Age-appropriate content filtering
import { getContentRating, filterAIResponse } from '@/utils/age-restrictions';

interface ContentFlags {
  isAppropriate: boolean;
  reasons: string[];
  safetyScore: number;
  suggestedModifications: string[];
}

interface FilterRule {
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high';
  replacement?: string;
  reason: string;
}

export class ContentFilter {
  private filterRules: FilterRule[] = [
    // Violence and aggression
    {
      pattern:
        /\b(kill|hurt|pain|blood|violence|fight|attack|weapon|gun|knife|sword)\b/gi,
      severity: 'high',
      replacement: 'challenge',
      reason: 'Violence content',
    },
    {
      pattern:
        /\b(scary|frightening|terrifying|horror|nightmare|monster|ghost|zombie)\b/gi,
      severity: 'medium',
      replacement: 'mysterious',
      reason: 'Scary content',
    },

    // Negative emotions (for very young children)
    {
      pattern: /\b(hate|stupid|dumb|idiot|ugly|disgusting)\b/gi,
      severity: 'medium',
      replacement: 'different',
      reason: 'Negative language',
    },
    {
      pattern: /\b(sad|crying|alone|lost|afraid)\b/gi,
      severity: 'low',
      replacement: 'curious',
      reason: 'Negative emotions',
    },

    // Death and loss
    {
      pattern: /\b(die|death|dead|funeral|grave|cemetery)\b/gi,
      severity: 'high',
      replacement: 'sleep',
      reason: 'Death references',
    },

    // Inappropriate relationships
    {
      pattern: /\b(boyfriend|girlfriend|romantic|dating|kiss|love)\b/gi,
      severity: 'medium',
      replacement: 'friend',
      reason: 'Romantic content',
    },

    // Adult themes
    {
      pattern: /\b(alcohol|beer|wine|drunk|smoke|cigarette|drugs)\b/gi,
      severity: 'high',
      replacement: 'juice',
      reason: 'Adult substances',
    },
    {
      pattern: /\b(money|rich|poor|expensive|cheap|buy|sell|business)\b/gi,
      severity: 'low',
      replacement: 'share',
      reason: 'Financial themes',
    },
  ];

  private positiveReplacements: Record<string, string[]> = {
    challenge: ['adventure', 'puzzle', 'quest', 'exploration'],
    mysterious: ['interesting', 'curious', 'magical', 'wonderful'],
    different: ['unique', 'special', 'creative', 'interesting'],
    curious: ['excited', 'interested', 'wondering', 'thinking'],
    sleep: ['rest', 'dream', 'relax', 'peaceful'],
    friend: ['buddy', 'companion', 'helper', 'teammate'],
    juice: ['water', 'snack', 'treat', 'refreshment'],
    share: ['give', 'help', 'care', 'support'],
  };

  /**
   * Filter content based on age and safety rules
   */
  filterContent(
    content: string,
    userAge: number
  ): {
    filteredContent: string;
    flags: ContentFlags;
  } {
    const contentRating = getContentRating(userAge);
    let filteredContent = content;
    const flags: ContentFlags = {
      isAppropriate: true,
      reasons: [],
      safetyScore: 100,
      suggestedModifications: [],
    };

    // Apply age-specific filtering
    for (const rule of this.filterRules) {
      if (this.shouldApplyRule(rule, userAge)) {
        const matches = content.match(rule.pattern);

        if (matches) {
          flags.isAppropriate = false;
          flags.reasons.push(rule.reason);
          flags.safetyScore -=
            rule.severity === 'high'
              ? 30
              : rule.severity === 'medium'
                ? 20
                : 10;

          // Apply replacement
          if (rule.replacement) {
            const replacement = this.getContextualReplacement(rule.replacement);
            filteredContent = filteredContent.replace(
              rule.pattern,
              replacement
            );
            flags.suggestedModifications.push(
              `Replaced ${matches[0] || 'text'} with ${replacement}`
            );
          }
        }
      }
    }

    // Apply positive tone enhancement for younger children
    if (userAge <= 8) {
      filteredContent = this.enhancePositiveTone(filteredContent);
    }

    // Ensure minimum safety score
    flags.safetyScore = Math.max(0, flags.safetyScore);
    flags.isAppropriate = flags.safetyScore >= 70;

    return { filteredContent, flags };
  }

  /**
   * Validate story content before saving
   */
  validateStoryContent(
    content: string,
    userAge: number
  ): {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const { flags } = this.filterContent(content, userAge);

    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!flags.isAppropriate) {
      issues.push('Content contains age-inappropriate material');
      recommendations.push(
        'Consider using more positive and age-appropriate language'
      );
    }

    if (flags.safetyScore < 50) {
      issues.push('Content safety score is too low');
      recommendations.push(
        'Focus on themes of friendship, adventure, and problem-solving'
      );
    }

    // Check for educational value
    if (!this.hasEducationalValue(content, userAge)) {
      recommendations.push(
        'Try to include themes that promote learning and growth'
      );
    }

    return {
      isValid: flags.safetyScore >= 70,
      issues,
      recommendations,
    };
  }

  /**
   * Generate age-appropriate prompts
   */
  generateAgeAppropriatePrompt(basePrompt: string, userAge: number): string {
    const { filteredContent } = this.filterContent(basePrompt, userAge);

    // Add age-specific encouragement
    if (userAge <= 6) {
      return `${filteredContent} Remember to keep your story happy and fun!`;
    } else if (userAge <= 12) {
      return `${filteredContent} Think about how your character learns and grows!`;
    } else {
      return `${filteredContent} Consider the deeper meaning and character development!`;
    }
  }

  /**
   * Check if content promotes positive values
   */
  promotesPositiveValues(content: string): {
    score: number;
    values: string[];
  } {
    const positivePatterns = [
      {
        pattern: /\b(friend|friendship|help|kind|care|share|love|family)\b/gi,
        value: 'Friendship & Kindness',
      },
      {
        pattern: /\b(brave|courage|try|persist|overcome|solve|achieve)\b/gi,
        value: 'Courage & Perseverance',
      },
      {
        pattern: /\b(learn|grow|discover|explore|curious|wonder|question)\b/gi,
        value: 'Learning & Growth',
      },
      {
        pattern: /\b(team|together|cooperate|collaborate|support|unite)\b/gi,
        value: 'Teamwork',
      },
      {
        pattern: /\b(honest|truth|trust|reliable|responsible|fair)\b/gi,
        value: 'Honesty & Integrity',
      },
      {
        pattern: /\b(creative|imagine|invent|artistic|original|unique)\b/gi,
        value: 'Creativity',
      },
    ];

    let score = 0;
    const values: string[] = [];

    for (const pattern of positivePatterns) {
      const matches = content.match(pattern.pattern);
      if (matches && matches.length > 0) {
        score += matches.length * 10;
        if (!values.includes(pattern.value)) {
          values.push(pattern.value);
        }
      }
    }

    return {
      score: Math.min(100, score),
      values,
    };
  }

  private shouldApplyRule(rule: FilterRule, userAge: number): boolean {
    // Apply stricter rules for younger children
    if (userAge <= 6) {
      return true; // Apply all rules
    } else if (userAge <= 12) {
      return rule.severity === 'high' || rule.severity === 'medium';
    } else {
      return rule.severity === 'high';
    }
  }

  private getContextualReplacement(baseReplacement?: string): string {
    if (!baseReplacement) return '';
    const alternatives = this.positiveReplacements[baseReplacement];
    return alternatives && alternatives.length > 0
      ? alternatives[Math.floor(Math.random() * alternatives.length)]!
      : baseReplacement; // Ensure baseReplacement is returned as a default
  }

  private enhancePositiveTone(content: string): string {
    // Add encouraging adjectives and positive framing
    const encouragingPrefixes = [
      'wonderful',
      'amazing',
      'fantastic',
      'incredible',
      'marvelous',
      'delightful',
    ];

    // Simple enhancement - could be more sophisticated
    if (!content.match(/\b(wonderful|amazing|fantastic|great|awesome)\b/gi)) {
      const prefix =
        encouragingPrefixes[
          Math.floor(Math.random() * encouragingPrefixes.length)
        ] ?? 'wonderful';
      return content.replace(
        /\b(adventure|journey|story|tale)\b/gi,
        `${prefix} $1`
      );
    }

    return content;
  }

  private hasEducationalValue(content: string, userAge: number): boolean {
    const educationalPatterns = [
      /\b(learn|teach|discover|explore|solve|problem|think|understand)\b/gi,
      /\b(science|nature|animal|plant|space|ocean|environment)\b/gi,
      /\b(friend|family|community|help|share|cooperate)\b/gi,
      /\b(creative|art|music|dance|build|create|imagine)\b/gi,
    ];

    return educationalPatterns.some(pattern => pattern.test(content));
  }
}

// Export singleton instance
export const contentFilter = new ContentFilter();
