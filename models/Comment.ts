// models/Comment.ts - Google Docs-style commenting system
import mongoose, { Schema, Document } from 'mongoose';
import type { Comment as CommentType } from '@types/comment';

export interface CommentDocument extends Omit<CommentType, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
  addReply(replyData: any): Promise<CommentDocument>;
  markAsResolved(userId: string): Promise<void>;
  markAsHelpful(userId: string): Promise<void>;
}

const commentSchema = new Schema<CommentDocument>(
  {
    storyId: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
      index: true,
    },

    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

    // Comment content
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [1000, 'Comment must be no more than 1000 characters'],
    },

    type: {
      type: String,
      enum: [
        'grammar',
        'creativity',
        'suggestion',
        'praise',
        'improvement',
        'question',
      ],
      required: true,
    },

    // Google Docs-style highlighting
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

    // Threading for replies
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },

    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],

    // Status and resolution
    status: {
      type: String,
      enum: ['active', 'resolved', 'archived'],
      default: 'active',
    },

    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    resolvedAt: {
      type: Date,
    },

    // Reactions and engagement
    isHelpful: {
      type: Boolean,
      default: false,
    },

    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    helpfulBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Visibility
    isPrivate: {
      type: Boolean,
      default: false,
    },

    isHighPriority: {
      type: Boolean,
      default: false,
    },

    // Moderation
    isFlagged: {
      type: Boolean,
      default: false,
    },

    flaggedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    flaggedReason: {
      type: String,
      trim: true,
    },

    flaggedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
commentSchema.index({ storyId: 1, parentCommentId: 1 });
commentSchema.index({ authorId: 1, createdAt: -1 });
commentSchema.index({ status: 1 });
commentSchema.index({ type: 1 });
commentSchema.index({ isHighPriority: 1, createdAt: -1 });

// Virtual for reply count
commentSchema.virtual('replyCount').get(function (this: CommentDocument) {
  return this.replies.length;
});

// Virtual for age-appropriate content check
commentSchema.virtual('isAgeAppropriate').get(function (this: CommentDocument) {
  // Simple check for inappropriate content
  const inappropriateWords = ['stupid', 'dumb', 'bad', 'terrible', 'awful'];
  const content = this.content.toLowerCase();
  return !inappropriateWords.some(word => content.includes(word));
});

// Pre-save middleware for content filtering
commentSchema.pre('save', function (this: CommentDocument, next) {
  // Filter content based on child safety
  if (this.isModified('content')) {
    // Replace potentially harsh words with more encouraging alternatives
    const replacements: Record<string, string> = {
      wrong: 'could be improved',
      bad: 'needs work',
      terrible: 'needs improvement',
      awful: 'could be better',
      stupid: 'unclear',
      dumb: 'confusing',
    };

    let filteredContent = this.content;
    Object.entries(replacements).forEach(([harsh, gentle]) => {
      const regex = new RegExp(`\\b${harsh}\\b`, 'gi');
      filteredContent = filteredContent.replace(regex, gentle);
    });

    this.content = filteredContent;
  }

  next();
});

// Post-save middleware to update story's unread comments flag
commentSchema.post('save', async function (this: CommentDocument) {
  if (this.isNew) {
    try {
      const Story = mongoose.model('Story');
      await Story.findByIdAndUpdate(this.storyId, {
        hasUnreadComments: true,
        $push: { mentorComments: this._id },
      });

      // Create notification for story author
      const Notification = mongoose.model('Notification');
      const story = await Story.findById(this.storyId).populate('authorId');

      if (story && story.authorId) {
        await Notification.create({
          userId: story.authorId._id,
          type: 'mentor_comment',
          title: 'New Comment on Your Story',
          message: `${this.authorName} commented on "${story.title}"`,
          data: {
            storyId: this.storyId,
            commentId: this._id,
            commentType: this.type,
            commentPreview: this.content.slice(0, 100),
          },
        });
      }
    } catch (error) {
      console.error('Error updating story after comment save:', error);
    }
  }
});

// Method to add reply
commentSchema.methods.addReply = async function (
  this: CommentDocument,
  replyData: any
): Promise<CommentDocument> {
  const Comment = mongoose.model('Comment');

  const reply = await Comment.create({
    ...replyData,
    parentCommentId: this._id,
    storyId: this.storyId,
  });

  this.replies.push(reply._id);
  await this.save();

  return reply;
};

// Method to mark as resolved
commentSchema.methods.markAsResolved = async function (
  this: CommentDocument,
  userId: string
): Promise<void> {
  this.status = 'resolved';
  this.resolvedBy = new mongoose.Types.ObjectId(userId);
  this.resolvedAt = new Date();
  await this.save();
};

// Method to mark as helpful
commentSchema.methods.markAsHelpful = async function (
  this: CommentDocument,
  userId: string
): Promise<void> {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  if (!this.helpfulBy.includes(userObjectId)) {
    this.helpfulBy.push(userObjectId);
    this.helpfulCount += 1;
    this.isHelpful = true;
    await this.save();
  }
};

// Static method to get comments for story
commentSchema.statics.getStoryComments = function (storyId: string) {
  return this.find({
    storyId,
    parentCommentId: null, // Only top-level comments
  })
    .populate('replies')
    .populate('authorId', 'firstName lastName avatar')
    .sort({ createdAt: 1 });
};

// Static method to get mentor activity
commentSchema.statics.getMentorActivity = function (
  mentorId: string,
  days: number = 7
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.find({
    authorId: mentorId,
    createdAt: { $gte: startDate },
  })
    .populate('storyId', 'title authorName')
    .sort({ createdAt: -1 });
};

const Comment =
  mongoose.models.Comment ||
  mongoose.model<CommentDocument>('Comment', commentSchema);
export default Comment;
