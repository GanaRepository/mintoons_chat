// types/comment.ts - Comment system types
export type CommentType =
  | 'grammar'
  | 'creativity'
  | 'suggestion'
  | 'praise'
  | 'improvement'
  | 'question';

export type CommentStatus = 'active' | 'resolved' | 'archived';

// Main comment interface that matches the model exactly
export interface Comment {
  _id: string;
  storyId: string;
  authorId: string; // mentor or admin ID
  authorName: string;
  authorRole: 'mentor' | 'admin';

  // Comment content
  content: string;
  type: CommentType;

  // Google Docs-style highlighting
  highlightedText?: string;
  highlightPosition?: {
    start: number;
    end: number;
  };

  // Threading for replies - Fixed field names to match model
  parentCommentId?: string; // Model uses parentCommentId, not parentId
  replies: string[]; // Array of Comment IDs, not full Comment objects

  // Status and resolution
  status: CommentStatus;
  resolvedBy?: string;
  resolvedAt?: Date;

  // Reactions and engagement
  likes?: string[]; // Array of User IDs who liked
  isHelpful: boolean;
  helpfulCount: number;

  // Visibility
  isPrivate: boolean; // Only visible to author and mentors
  isHighPriority: boolean;

  // Virtual field from model
  replyCount: number; // Virtual field: replies.length

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// For populated comment data (when replies are populated)
export interface CommentWithReplies extends Omit<Comment, 'replies'> {
  replies: Comment[]; // Populated reply objects
}

// For populated comment data (when author is populated)
export interface CommentWithAuthor extends Comment {
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface CommentThread {
  parentComment: CommentWithReplies;
  totalReplies: number;
  lastReplyAt: Date;
  isResolved: boolean;
}

export interface CommentCreationData {
  storyId: string;
  authorId: string; // Required field from model
  authorName: string; // Required field from model
  authorRole: 'mentor' | 'admin'; // Required field from model
  content: string;
  type: CommentType;
  highlightedText?: string;
  highlightPosition?: {
    start: number;
    end: number;
  };
  parentCommentId?: string;
  isPrivate?: boolean;
  isHighPriority?: boolean;
}

export interface CommentUpdateData {
  content?: string;
  type?: CommentType;
  status?: CommentStatus;
  isPrivate?: boolean;
  isHighPriority?: boolean;
}

export interface CommentFilters {
  storyId?: string;
  authorId?: string;
  type?: CommentType;
  status?: CommentStatus;
  parentCommentId?: string; // Filter for top-level vs replies
  isResolved?: boolean;
  isHighPriority?: boolean;
  isPrivate?: boolean; // Added from model
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'helpfulCount';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CommentStats {
  totalComments: number;
  commentsByType: Record<CommentType, number>;
  commentsByStatus: Record<CommentStatus, number>; // Added
  averageCommentsPerStory: number;
  resolvedComments: number;
  resolutionRate: number;
  helpfulComments: number; // Added
  privateComments: number; // Added
  highPriorityComments: number; // Added
  mostActiveCommenters: {
    authorId: string;
    authorName: string;
    commentCount: number;
    authorRole: 'mentor' | 'admin'; // Added
  }[];
}

export interface CommentNotification {
  _id: string;
  userId: string; // story author
  commentId: string;
  storyId: string;
  commentAuthor: string;
  commentType: CommentType;
  commentPreview: string;
  isRead: boolean;
  createdAt: Date;
}

export interface CommentActivity {
  userId: string;
  recentComments: Comment[];
  pendingReplies: Comment[];
  unresolvedComments: Comment[];
  commentsThisWeek: number;
  averageResponseTime: number; // in hours
}

export interface MentorCommentingGuidelines {
  ageGroup: string;
  toneGuidelines: string[];
  exampleComments: {
    type: CommentType;
    examples: string[];
  }[];
  avoidPhrases: string[];
  encouragementTips: string[];
}

// Additional interfaces for specific use cases
export interface CommentSearchResult {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface StoryComments {
  storyId: string;
  comments: CommentWithReplies[];
  totalComments: number;
  unresolvedCount: number;
  highPriorityCount: number;
}

export interface MentorCommentActivity {
  mentorId: string;
  mentorName: string;
  period: {
    start: Date;
    end: Date;
  };
  comments: Array<{
    _id: string;
    content: string;
    type: CommentType;
    storyTitle: string;
    storyAuthor: string;
    createdAt: Date;
    isResolved: boolean;
  }>;
  stats: {
    totalComments: number;
    resolvedComments: number;
    averageResolutionTime: number;
    commentsByType: Record<CommentType, number>;
  };
}

// For reply creation
export interface ReplyCreationData {
  content: string;
  authorId: string;
  authorName: string;
  authorRole: 'mentor' | 'admin';
  isPrivate?: boolean;
}
