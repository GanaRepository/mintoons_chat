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
  authorId: string;
  authorName: string;
  authorRole: 'mentor' | 'admin';
  content: string;
  type: CommentType;

  highlightedText?: string;
  highlightPosition?: {
    start: number;
    end: number;
  };

  parentCommentId?: string;
  replies: string[];

  status: CommentStatus;
  resolvedBy?: string;
  resolvedAt?: Date;

  likes?: string[];
  isHelpful: boolean;
  helpfulCount: number;

  isPrivate: boolean;
  isHighPriority: boolean;

  replyCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface CommentWithReplies extends Omit<Comment, 'replies'> {
  replies: Comment[];
}

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
  authorId: string;
  authorName: string;
  authorRole: 'mentor' | 'admin';
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
  parentCommentId?: string;
  isResolved?: boolean;
  isHighPriority?: boolean;
  isPrivate?: boolean;
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
  commentsByStatus: Record<CommentStatus, number>;
  averageCommentsPerStory: number;
  resolvedComments: number;
  resolutionRate: number;
  helpfulComments: number;
  privateComments: number;
  highPriorityComments: number;
  mostActiveCommenters: {
    authorId: string;
    authorName: string;
    commentCount: number;
    authorRole: 'mentor' | 'admin';
  }[];
}

export interface CommentNotification {
  _id: string;
  userId: string;
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
  averageResponseTime: number;
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

export interface ReplyCreationData {
  content: string;
  authorId: string;
  authorName: string;
  authorRole: 'mentor' | 'admin';
  isPrivate?: boolean;
}