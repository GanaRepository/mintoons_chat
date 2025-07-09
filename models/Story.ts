// models/Story.ts - Story model with AI collaboration
import mongoose, { Schema, Document } from 'mongoose';
import type { Story as StoryType } from '@types/story';

export interface StoryDocument extends Omit<StoryType, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
  calculateWordCount(): void;
  calculateReadingTime(): void;
  addAITurn(
    userInput: string,
    aiResponse: string,
    responseType: string
  ): Promise<void>;
  incrementViews(): Promise<void>;
  addLike(userId: string): Promise<void>;
  removeLike(userId: string): Promise<void>;
}

const aiTurnSchema = new Schema(
  {
    turnNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    userInput: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'User input must be no more than 500 characters'],
    },

    aiResponse: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'AI response must be no more than 1000 characters'],
    },

    responseType: {
      type: String,
      enum: ['continue', 'plot_twist', 'new_character', 'challenge'],
      required: true,
    },

    wordCount: {
      type: Number,
      required: true,
      min: 0,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const storyElementsSchema = new Schema(
  {
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
    },

    setting: {
      type: String,
      required: [true, 'Setting is required'],
      trim: true,
    },

    character: {
      type: String,
      required: [true, 'Character is required'],
      trim: true,
    },

    mood: {
      type: String,
      required: [true, 'Mood is required'],
      trim: true,
    },

    conflict: {
      type: String,
      required: [true, 'Conflict is required'],
      trim: true,
    },

    theme: {
      type: String,
      required: [true, 'Theme is required'],
      trim: true,
    },
  },
  { _id: false }
);

const storySchema = new Schema<StoryDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title must be no more than 100 characters'],
    },

    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      minlength: [50, 'Story must be at least 50 characters'],
      maxlength: [10000, 'Story must be no more than 10,000 characters'],
    },

    elements: {
      type: storyElementsSchema,
      required: true,
    },

    status: {
      type: String,
      enum: ['draft', 'in_progress', 'completed', 'published', 'archived'],
      default: 'draft',
      required: true,
    },

    // Author information
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    authorName: {
      type: String,
      required: true,
      trim: true,
    },

    authorAge: {
      type: Number,
      required: true,
      min: 2,
      max: 18,
    },

    // Story metrics
    wordCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    readingTime: {
      type: Number,
      default: 0,
      min: 0,
    },

    // AI collaboration data
    aiTurns: [aiTurnSchema],

    currentTurn: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Assessment reference
    assessment: {
      type: Schema.Types.ObjectId,
      ref: 'StoryAssessment',
    },

    // Social features
    isPublic: {
      type: Boolean,
      default: false,
    },

    likes: {
      type: Number,
      default: 0,
      min: 0,
    },

    likedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    viewedBy: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Mentor feedback
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    mentorComments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],

    hasUnreadComments: {
      type: Boolean,
      default: false,
    },

    // Content flags
    isModerated: {
      type: Boolean,
      default: false,
    },

    moderationFlags: [
      {
        type: String,
        reason: String,
        flaggedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        flaggedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Timestamps
    publishedAt: {
      type: Date,
    },

    completedAt: {
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
storySchema.index({ authorId: 1, status: 1 });
storySchema.index({ status: 1, isPublic: 1 });
storySchema.index({ 'elements.genre': 1 });
storySchema.index({ createdAt: -1 });
storySchema.index({ likes: -1, views: -1 }); // For popular stories
storySchema.index({ publishedAt: -1 }); // For recent published stories

// Text index for search
storySchema.index({
  title: 'text',
  content: 'text',
  'elements.genre': 'text',
  'elements.theme': 'text',
});

// Virtual for excerpt
storySchema.virtual('excerpt').get(function (this: StoryDocument) {
  if (this.content.length <= 150) return this.content;
  return this.content.slice(0, 147) + '...';
});

// Virtual for age group
storySchema.virtual('ageGroup').get(function (this: StoryDocument) {
  if (this.authorAge >= 2 && this.authorAge <= 4) return 'toddler';
  if (this.authorAge >= 5 && this.authorAge <= 6) return 'preschool';
  if (this.authorAge >= 7 && this.authorAge <= 9) return 'early_elementary';
  if (this.authorAge >= 10 && this.authorAge <= 12) return 'late_elementary';
  if (this.authorAge >= 13 && this.authorAge <= 15) return 'middle_school';
  if (this.authorAge >= 16 && this.authorAge <= 18) return 'high_school';
  return 'unknown';
});

// Virtual for completion status
storySchema.virtual('isCompleted').get(function (this: StoryDocument) {
  return this.status === 'completed' || this.status === 'published';
});

// Pre-save middleware to calculate word count and reading time
storySchema.pre('save', function (this: StoryDocument, next) {
  this.calculateWordCount();
  this.calculateReadingTime();

  // Set completion timestamp
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    }
    if (this.status === 'published' && !this.publishedAt) {
      this.publishedAt = new Date();
    }
  }

  next();
});

// Method to calculate word count
storySchema.methods.calculateWordCount = function (this: StoryDocument): void {
  const words = this.content
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);
  this.wordCount = words.length;
};

// Method to calculate reading time (words per minute for children)
storySchema.methods.calculateReadingTime = function (
  this: StoryDocument
): void {
  const wordsPerMinute =
    this.authorAge <= 8 ? 100 : this.authorAge <= 12 ? 150 : 200;
  this.readingTime = Math.ceil(this.wordCount / wordsPerMinute);
};

// Method to add AI turn
storySchema.methods.addAITurn = async function (
  this: StoryDocument,
  userInput: string,
  aiResponse: string,
  responseType: string
): Promise<void> {
  const userWordCount = userInput
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;

  this.aiTurns.push({
    turnNumber: this.currentTurn + 1,
    userInput,
    aiResponse,
    responseType,
    wordCount: userWordCount,
    timestamp: new Date(),
  });

  this.currentTurn += 1;

  // Update content with user input
  this.content += ` ${userInput}`;

  // Update status to in_progress if still draft
  if (this.status === 'draft') {
    this.status = 'in_progress';
  }

  await this.save();
};

// Method to increment views
storySchema.methods.incrementViews = async function (
  this: StoryDocument
): Promise<void> {
  this.views += 1;
  await this.save();
};

// Method to add like
storySchema.methods.addLike = async function (
  this: StoryDocument,
  userId: string
): Promise<void> {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  if (!this.likedBy.includes(userObjectId)) {
    this.likedBy.push(userObjectId);
    this.likes += 1;
    await this.save();
  }
};

// Method to remove like
storySchema.methods.removeLike = async function (
  this: StoryDocument,
  userId: string
): Promise<void> {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const index = this.likedBy.indexOf(userObjectId);

  if (index > -1) {
    this.likedBy.splice(index, 1);
    this.likes = Math.max(0, this.likes - 1);
    await this.save();
  }
};

// Static method to get popular stories
storySchema.statics.getPopularStories = function (limit: number = 10) {
  return this.find({
    status: 'published',
    isPublic: true,
    isModerated: { $ne: true },
  })
    .sort({ likes: -1, views: -1, createdAt: -1 })
    .limit(limit)
    .populate('authorId', 'firstName lastName avatar')
    .select(
      'title excerpt elements authorName authorAge likes views readingTime publishedAt'
    );
};

// Static method to get recent stories
storySchema.statics.getRecentStories = function (limit: number = 10) {
  return this.find({
    status: 'published',
    isPublic: true,
    isModerated: { $ne: true },
  })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .populate('authorId', 'firstName lastName avatar')
    .select(
      'title excerpt elements authorName authorAge likes views readingTime publishedAt'
    );
};

// Static method to search stories
storySchema.statics.searchStories = function (
  query: string,
  filters: any = {}
) {
  const searchCriteria: any = {
    status: 'published',
    isPublic: true,
    isModerated: { $ne: true },
    $text: { $search: query },
  };

  // Apply filters
  if (filters.genre) {
    searchCriteria['elements.genre'] = filters.genre;
  }

  if (filters.ageGroup) {
    const ageRanges: Record<string, [number, number]> = {
      toddler: [2, 4],
      preschool: [5, 6],
      early_elementary: [7, 9],
      late_elementary: [10, 12],
      middle_school: [13, 15],
      high_school: [16, 18],
    };

    if (ageRanges[filters.ageGroup]) {
      const [min, max] = ageRanges[filters.ageGroup];
      searchCriteria.authorAge = { $gte: min, $lte: max };
    }
  }

  return this.find(searchCriteria)
    .sort({ score: { $meta: 'textScore' }, likes: -1 })
    .populate('authorId', 'firstName lastName avatar')
    .select(
      'title excerpt elements authorName authorAge likes views readingTime publishedAt'
    );
};

// Export the model
const Story =
  mongoose.models.Story || mongoose.model<StoryDocument>('Story', storySchema);
export default Story;
