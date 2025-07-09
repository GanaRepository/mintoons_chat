// types/comment.ts - Comment system types
export type CommentType =
  | 'grammar'
  | 'creativity'
  | 'suggestion'
  | 'praise'
  | 'improvement'
  | 'question';
export type CommentStatus = 'active' | 'resolved' | 'archived';

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

  // Threading for replies
  parentCommentId?: string;
  replies: Comment[];

  // Status and resolution
  status: CommentStatus;
  resolvedBy?: string;
  resolvedAt?: Date;

  // Reactions and engagement
  isHelpful: boolean;
  helpfulCount: number;

  // Visibility
  isPrivate: boolean; // Only visible to author and mentors
  isHighPriority: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentThread {
  parentComment: Comment;
  replies: Comment[];
  totalReplies: number;
  lastReplyAt: Date;
  isResolved: boolean;
}

export interface CommentCreationData {
  storyId: string;
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
  isResolved?: boolean;
  isHighPriority?: boolean;
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
  averageCommentsPerStory: number;
  resolvedComments: number;
  resolutionRate: number;
  mostActiveCommenters: {
    authorId: string;
    authorName: string;
    commentCount: number;
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
