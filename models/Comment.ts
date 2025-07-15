import * as mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';

export interface CommentDocument extends Document {
  _id: mongoose.Types.ObjectId;
  storyId: string;
  authorId: string;
  authorName: string;
  authorRole: 'mentor' | 'admin';
  content: string;
  type: 'grammar' | 'creativity' | 'suggestion' | 'praise' | 'improvement' | 'question';
  highlightedText?: string;
  highlightPosition?: {
    start: number;
    end: number;
  };
  parentCommentId?: string;
  replies: string[];
  status: 'active' | 'resolved' | 'archived';
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

  addReply(replyData: any): Promise<CommentDocument>;
  markAsResolved(userId: string): Promise<void>;
  markAsHelpful(userId: string): Promise<void>;
}

const commentSchema = new Schema<CommentDocument>(
  {
    storyId: {
      type: String,
      required: true,
      // ...existing code...
    },
    authorId: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorRole: {
      type: String,
      enum: ['mentor', 'admin'],
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [1000, 'Comment must be no more than 1000 characters'],
    },
    type: {
      type: String,
      enum: ['grammar', 'creativity', 'suggestion', 'praise', 'improvement', 'question'],
      required: true,
    },
    highlightedText: {
      type: String,
      trim: true,
      maxlength: [500, 'Highlighted text must be no more than 500 characters'],
    },
    highlightPosition: {
      start: {
        type: Number,
        min: 0,
      },
      end: {
        type: Number,
        min: 0,
      },
    },
    parentCommentId: {
      type: String,
      default: null,
    },
    replies: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'resolved', 'archived'],
      default: 'active',
      // ...existing code...
    },
    resolvedBy: {
      type: String,
    },
    resolvedAt: {
      type: Date,
    },
    likes: [
      {
        type: String,
      },
    ],
    isHelpful: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPrivate: {
      type: Boolean,
      default: false,
      // ...existing code...
    },
    isHighPriority: {
      type: Boolean,
      default: false,
      // ...existing code...
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc: any, ret: any) {
        ret._id = ret._id?.toString();
        if (ret.storyId) ret.storyId = ret.storyId.toString();
        if (ret.authorId) ret.authorId = ret.authorId.toString();
        if (ret.parentCommentId) ret.parentCommentId = ret.parentCommentId.toString();
        if (ret.resolvedBy) ret.resolvedBy = ret.resolvedBy.toString();
        if (ret.replies) ret.replies = ret.replies.map((id: any) => id?.toString());
        if (ret.likes) ret.likes = ret.likes.map((id: any) => id?.toString());
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

commentSchema.index({ storyId: 1, createdAt: -1 });
commentSchema.index({ authorId: 1 });
commentSchema.index({ type: 1 });
commentSchema.index({ status: 1 });
commentSchema.index({ parentCommentId: 1 });

commentSchema.virtual('replyCount').get(function (this: CommentDocument) {
  return this.replies?.length || 0;
});

commentSchema.methods.addReply = async function (
  this: CommentDocument,
  replyData: any
): Promise<CommentDocument> {
  const reply = new Comment({
    ...replyData,
    parentCommentId: this._id.toString(),
  });

  await reply.save();

  this.replies.push(reply._id.toString());
  await this.save();

  return reply;
};

commentSchema.methods.markAsResolved = async function (
  this: CommentDocument,
  userId: string
): Promise<void> {
  this.status = 'resolved';
  this.resolvedBy = userId;
  this.resolvedAt = new Date();
  await this.save();
};

commentSchema.methods.markAsHelpful = async function (
  this: CommentDocument,
  userId: string
): Promise<void> {
  if (!this.likes) this.likes = [];

  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    this.isHelpful = true;
    this.helpfulCount = this.likes.length;
    await this.save();
  }
};

const Comment =
  mongoose.models.Comment ||
  mongoose.model<CommentDocument>('Comment', commentSchema);
export default Comment;