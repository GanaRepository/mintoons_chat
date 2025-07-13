// types/story.ts - Story-related types

export type StoryStatus =
  | 'draft'
  | 'in_progress'
  | 'completed'
  | 'published'
  | 'archived';

export interface StoryElement {
  _id: string;
  name: string;
  icon: string;
  description: string;
}

export interface StoryElements {
  genre: string;
  setting: string;
  character: string;
  mood: string;
  conflict: string;
  theme: string;
  [key: string]: string;
}

// Main story interface that matches the model exactly
export interface Story {
  /* IDs */
  _id: string;

  /* Core */
  title: string;
  content: string;
  elements: StoryElements;
  status: StoryStatus;

  /* Author */
  authorId: string;
  authorName: string;
  authorAge: number;

  /* Metrics & social */
  wordCount: number;
  readingTime: number;
  likes: number;
  likedBy: string[]; // Array of user IDs who liked the story
  views: number;
  viewedBy: Array<{
    userId: string;
    viewedAt: Date;
  }>; // Detailed view tracking from model

  /* AI collaboration */
  aiTurns: AITurn[];
  currentTurn: number;
  assessment?: string; // Reference to StoryAssessment ID (ObjectId as string)

  /* Mentor feedback */
  mentorId?: string;
  mentorComments: string[]; // Array of Comment IDs
  hasUnreadComments: boolean;

  /* Content moderation (missing from original types) */
  isModerated: boolean;
  moderationFlags: Array<{
    type: string;
    reason: string;
    flaggedBy: string;
    flaggedAt: Date;
  }>;

  /* Virtual fields from model */
  excerpt: string; // Virtual field: content preview
  ageGroup: string; // Virtual field: computed from authorAge
  isCompleted: boolean; // Virtual field: status === 'completed' || 'published'

  /* Visibility & timestamps */
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  completedAt?: Date;
}

export interface AITurn {
  turnNumber: number;
  userInput: string;
  aiResponse: string;
  responseType: 'continue' | 'plot_twist' | 'new_character' | 'challenge';
  wordCount: number;
  timestamp: Date;
}

export interface StoryCreationData {
  title: string;
  elements: StoryElements;
  authorId: string; // Required field from model
  authorName: string; // Required field from model
  authorAge: number; // Required field from model
  initialContent?: string;
}

export interface StoryUpdateData {
  title?: string;
  content?: string;
  status?: StoryStatus;
  isPublic?: boolean;
  elements?: Partial<StoryElements>; // Allow partial updates to elements
}

export interface StoryFilters {
  status?: StoryStatus;
  authorId?: string;
  genre?: string;
  isPublic?: boolean;
  hasAssessment?: boolean;
  isModerated?: boolean; // Added from model
  ageGroup?: string; // Can filter by virtual ageGroup
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  sortBy?:
    | 'createdAt'
    | 'updatedAt'
    | 'title'
    | 'wordCount'
    | 'likes'
    | 'views'
    | 'publishedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface StorySearchResult {
  stories: Story[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface StoryStats {
  totalStories: number;
  completedStories: number;
  averageWordCount: number;
  averageAssessmentScore: number;
  totalViews: number;
  totalLikes: number;
  popularGenres: { genre: string; count: number }[];
}

// Simplified interface for public story display (matches model's static methods)
export interface PublicStory {
  _id: string;
  title: string;
  excerpt: string; // Virtual field
  authorName: string;
  authorAge: number;
  ageGroup: string; // Virtual field
  elements: StoryElements;
  wordCount: number;
  readingTime: number;
  likes: number;
  views: number;
  publishedAt: Date;
}

export interface SampleStory {
  _id: string;
  title: string;
  content: string;
  elements: StoryElements; // Use proper type instead of Record
  authorName: string;
  authorAge: number;
  readingTime: number;
  minAge: number;
  maxAge: number;
  difficulty: string;
  genre: string;
  description: string;
  rating: number;
  learningGoals: string[];
}

// Additional interfaces for specific use cases
export interface StoryWithAuthor extends Story {
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface StoryDraft {
  title: string;
  elements: Partial<StoryElements>;
  content: string;
  authorId: string;
  lastSaved: Date;
}

export interface StoryInteraction {
  userId: string;
  storyId: string;
  type: 'like' | 'view' | 'comment' | 'share';
  timestamp: Date;
}

// For the search functionality
export interface StorySearchCriteria {
  query?: string;
  genre?: string;
  ageGroup?: string;
  authorAge?: {
    min: number;
    max: number;
  };
  wordCount?: {
    min: number;
    max: number;
  };
  publishedAfter?: Date;
  sortBy?: 'relevance' | 'recent' | 'popular' | 'likes';
}
