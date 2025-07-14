export interface StoryAssessment {
  _id: string;
  storyId: string;
  userId: string;

  // AI Assessment Scores (0-100)
  grammarScore: number;
  creativityScore: number;
  overallScore: number;

  // Detailed Analysis
  feedback: string;
  suggestions: string[];
  strengths: string[];
  improvements: string[];

  // Age-appropriate analysis
  readingLevel: string;
  vocabularyComplexity: 'basic' | 'intermediate' | 'advanced';
  ageAppropriate: boolean;

  // Story Structure Analysis
  hasIntroduction: boolean;
  hasConflict: boolean;
  hasResolution: boolean;
  plotCoherence: number; // 0-100
  characterDevelopment: number; // 0-100

  // Writing Mechanics
  grammarIssues: GrammarIssue[];
  spellingErrors: SpellingError[];
  punctuationIssues: PunctuationIssue[];
  sentenceStructure: number; // 0-100

  // Creativity Metrics
  originalityScore: number; // 0-100
  imaginationUse: number; // 0-100
  descriptiveLanguage: number; // 0-100
  dialogueQuality: number; // 0-100

  // Engagement Metrics
  emotionalImpact: number; // 0-100
  readerEngagement: number; // 0-100
  storyPacing: number; // 0-100

  // Mentor Override (if mentor reviews)
  mentorOverride?: MentorAssessment;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface GrammarIssue {
  type:
    | 'subject_verb_disagreement'
    | 'tense_inconsistency'
    | 'sentence_fragment'
    | 'run_on_sentence';
  description: string;
  suggestion: string;
  position: {
    start: number;
    end: number;
  };
  severity: 'low' | 'medium' | 'high';
}

export interface SpellingError {
  word: string;
  suggestions: string[];
  position: {
    start: number;
    end: number;
  };
  confidence: number; // 0-1
}

export interface PunctuationIssue {
  type:
    | 'missing_comma'
    | 'missing_period'
    | 'quotation_marks'
    | 'capitalization';
  description: string;
  suggestion: string;
  position: {
    start: number;
    end: number;
  };
}

export interface MentorAssessment {
  mentorId: string;
  mentorName: string;

  // Mentor's scores (can override AI)
  grammarFeedback: number;
  creativityRating: number;
  effortScore: number;

  // Mentor-specific feedback
  improvementAreas: string[];
  encouragement: string;
  personalizedFeedback: string;

  // Recommendations
  nextStepsRecommendations: string[];
  skillsToWorkOn: string[];

  // Timestamps
  reviewedAt: Date;
  lastUpdated: Date;
}

export interface AssessmentCriteria {
  grammar: {
    weight: number;
    factors: string[];
    ageAdjustments: Record<string, number>;
  };
  creativity: {
    weight: number;
    factors: string[];
    ageAdjustments: Record<string, number>;
  };
  overall: {
    weight: number;
    factors: string[];
    ageAdjustments: Record<string, number>;
  };
}

export interface AssessmentTemplate {
  ageGroup: string;
  minAge: number;
  maxAge: number;
  criteria: AssessmentCriteria;
  feedbackTemplates: {
    excellent: string[];
    good: string[];
    fair: string[];
    needsImprovement: string[];
  };
  suggestionBank: string[];
}

export interface AssessmentHistory {
  userId: string;
  assessments: StoryAssessment[];
  averageScores: {
    grammar: number;
    creativity: number;
    overall: number;
  };
  improvementTrend: {
    grammar: number; // percentage change
    creativity: number;
    overall: number;
  };
  streaks: {
    improvingGrammar: number;
    improvingCreativity: number;
    consistentQuality: number;
  };
}

export interface AssessmentInsights {
  userId: string;
  totalAssessments: number;
  averageScore: number;
  bestPerformingArea: string;
  areasForImprovement: string[];
  progressOverTime: {
    date: Date;
    grammarScore: number;
    creativityScore: number;
    overallScore: number;
  }[];
  comparisonToPeers: {
    percentile: number;
    ageGroup: string;
  };
}