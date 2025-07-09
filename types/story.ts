// types/story.ts - Story-related types
export type StoryStatus =
  | 'draft'
  | 'in_progress'
  | 'completed'
  | 'published'
  | 'archived';

export interface StoryElement {
  id: string;
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
}

export interface Story {
  _id: string;
  title: string;
  content: string;
  elements: StoryElements;
  status: StoryStatus;

  // Author information
  authorId: string;
  authorName: string;
  authorAge: number;

  // Story metrics
  wordCount: number;
  readingTime: number;

  // AI collaboration data
  aiTurns: AITurn[];
  currentTurn: number;

  // Assessment
  assessment?: StoryAssessment;

  // Social features
  isPublic: boolean;
  likes: number;
  views: number;

  // Mentor feedback
  mentorId?: string;
  mentorComments: string[];
  hasUnreadComments: boolean;

  // Timestamps
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
  initialContent?: string;
}

export interface StoryUpdateData {
  title?: string;
  content?: string;
  status?: StoryStatus;
  isPublic?: boolean;
}

export interface StoryFilters {
  status?: StoryStatus;
  authorId?: string;
  genre?: string;
  isPublic?: boolean;
  hasAssessment?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'wordCount' | 'likes';
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

export interface PublicStory {
  _id: string;
  title: string;
  content: string;
  authorName: string;
  authorAge: number;
  elements: StoryElements;
  wordCount: number;
  readingTime: number;
  likes: number;
  views: number;
  publishedAt: Date;
  excerpt: string;
}

export interface SampleStory {
  id: string;
  title: string;
  content: string;
  elements: StoryElements;
  authorName: string;
  authorAge: number;
  readingTime: number;
  illustration?: string;
  isNew?: boolean;
}
