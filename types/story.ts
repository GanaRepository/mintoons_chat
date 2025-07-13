// types/story.ts - Story-related types
import { StoryAssessment } from './assessment';

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

export interface Story {
  /* IDs */
  _id: string;

  /* Core */
  title: string;
  content: string;
  elements: StoryElements;
  status: StoryStatus;
  targetWords?: number; // Add this optional property

  /* Author */
  authorId: string;
  authorName: string;
  authorAge: number;
  authorStoryCount?: number; // Add this
  authorPoints?: number; // Add this

  /* Metrics & social */
  wordCount: number;
  readingTime: number;
  likes: number;
  likedBy?: string[]; // 👈 for “isLiked” check
  comments?: any[]; // 👈 total comment count
  views: number;

  /* AI collaboration */
  aiTurns: AITurn[];
  currentTurn: number;
  assessment?: StoryAssessment;

  /* Mentor feedback */
  mentorId?: string;
  mentorComments: string[];
  hasUnreadComments: boolean;

  /* Related content */
  relatedStories?: Array<{
    // Add missing property
    id: string;
    title: string;
    authorName: string;
  }>;

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
  _id: string;
  title: string;
  content: string;
  elements: Record<string, string>;
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
