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
}

export interface AITurn {
  turnNumber: number;
  userInput: string;
  aiResponse: string;
  responseType: 'continue' | 'plot_twist' | 'new_character' | 'challenge';
  wordCount: number;
  timestamp: Date;
}

export interface Story {
  _id: string;
  title: string;
  content: string;
  elements: StoryElements;
  status: StoryStatus;

  authorId: string;
  authorName: string;
  authorAge: number;

  wordCount: number;
  readingTime: number;

  aiTurns: AITurn[];
  currentTurn: number;

  assessment?: string;

  isPublic: boolean;
  likes: number;
  likedBy: string[];
  views: number;
  viewedBy: Array<{
    userId: string;
    viewedAt: Date;
  }>;

  mentorId?: string;
  mentorComments: string[];
  hasUnreadComments: boolean;

  isModerated: boolean;
  moderationFlags: Array<{
    type: string;
    reason: string;
    flaggedBy: string;
    flaggedAt: Date;
  }>;

  excerpt: string;
  ageGroup: string;
  isCompleted: boolean;

  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  completedAt?: Date;
}

export interface StoryCreationData {
  title: string;
  elements: StoryElements;
  authorId: string;
  authorName: string;
  authorAge: number;
  initialContent?: string;
}

export interface StoryUpdateData {
  title?: string;
  content?: string;
  status?: StoryStatus;
  isPublic?: boolean;
  elements?: Partial<StoryElements>;
}

export interface StoryFilters {
  status?: StoryStatus;
  authorId?: string;
  genre?: string;
  isPublic?: boolean;
  hasAssessment?: boolean;
  isModerated?: boolean;
  ageGroup?: string;
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

export interface PublicStory {
  _id: string;
  title: string;
  excerpt: string;
  authorName: string;
  authorAge: number;
  ageGroup: string;
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
  elements: StoryElements;
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