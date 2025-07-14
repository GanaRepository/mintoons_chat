import mongoose, { Schema, Document } from 'mongoose';

interface AITurn {
  turnNumber: number;
  userInput: string;
  aiResponse: string;
  responseType: 'continue' | 'plot_twist' | 'new_character' | 'challenge';
  wordCount: number;
  timestamp: Date;
}

export interface StoryDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  elements: {
    genre: string;
    setting: string;
    character: string;
    mood: string;
    conflict: string;
    theme: string;
  };
  status: 'draft' | 'in_progress' | 'completed' | 'published' | 'archived';
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
  
  addAITurn(userInput: string, aiResponse: string, responseType: string): Promise<void>;
  complete(): Promise<void>;
  publish(): Promise<void>;
  addLike(userId: string): Promise<void>;
  removeLike(userId: string): Promise<void>;
  recordView(userId: string): Promise<void>;
}

const aiTurnSchema = new Schema<AITurn>(
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
    },
    aiResponse: {
      type: String,
      required: true,
      trim: true,
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

const storySchema = new Schema<StoryDocument>(
  {
    title: {
      type: String,
      required: [true, 'Story title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title must be no more than 100 characters'],
    },
    content: {
      type: String,
      required: [true, 'Story content is required'],
      trim: true,
      minlength: [10, 'Story must be at least 10 characters long'],
      maxlength: [10000, 'Story must be no more than 10,000 characters'],
    },
    elements: {
      genre: {
        type: String,
        required: true,
        trim: true,
      },
      setting: {
        type: String,
        required: true,
        trim: true,
      },
      character: {
        type: String,
        required: true,
        trim: true,
      },
      mood: {
        type: String,
        required: true,
        trim: true,
      },
      conflict: {
        type: String,
        required: true,
        trim: true,
      },
      theme: {
        type: String,
        required: true,
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ['draft', 'in_progress', 'completed', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    authorId: {
      type: String,
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
    aiTurns: [aiTurnSchema],
    currentTurn: {
      type: Number,
      default: 0,
      min: 0,
    },
    assessment: {
      type: String,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    likedBy: [
      {
        type: String,
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
          type: String,
          required: true,
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    mentorId: {
      type: String,
    },
    mentorComments: [
      {
        type: String,
      },
    ],
    hasUnreadComments: {
      type: Boolean,
      default: false,
    },
    isModerated: {
      type: Boolean,
      default: false,
    },
    moderationFlags: [
      {
        type: {
          type: String,
          required: true,
        },
        reason: {
          type: String,
          required: true,
        },
        flaggedBy: {
          type: String,
          required: true,
        },
        flaggedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    publishedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
    virtuals: true,
    transform: function (doc: any, ret: any) {
      ret._id = ret._id?.toString();
      if (ret.authorId) ret.authorId = ret.authorId.toString();
      if (ret.mentorId) ret.mentorId = ret.mentorId.toString();
      if (ret.assessment) ret.assessment = ret.assessment.toString();
      if (ret.likedBy) ret.likedBy = ret.likedBy.map((id: any) => id?.toString());
      if (ret.mentorComments) ret.mentorComments = ret.mentorComments.map((id: any) => id?.toString());
      if (ret.viewedBy) {
        ret.viewedBy = ret.viewedBy.map((view: any) => ({
          userId: view.userId?.toString(),
          viewedAt: view.viewedAt,
        }));
      }
      if (ret.moderationFlags) {
        ret.moderationFlags = ret.moderationFlags.map((flag: any) => ({
          ...flag,
          flaggedBy: flag.flaggedBy?.toString(),
        }));
      }
      return ret;
    },
  },
    toObject: { virtuals: true },
  }
);

storySchema.index({ authorId: 1, createdAt: -1 });
storySchema.index({ status: 1 });
storySchema.index({ isPublic: 1, publishedAt: -1 });
storySchema.index({ 'elements.genre': 1 });
storySchema.index({ authorAge: 1 });

storySchema.virtual('excerpt').get(function (this: StoryDocument) {
  return this.content.substring(0, 150) + (this.content.length > 150 ? '...' : '');
});

storySchema.virtual('ageGroup').get(function (this: StoryDocument) {
  if (this.authorAge >= 2 && this.authorAge <= 4) return 'toddler';
  if (this.authorAge >= 5 && this.authorAge <= 6) return 'preschool';
  if (this.authorAge >= 7 && this.authorAge <= 9) return 'early_elementary';
  if (this.authorAge >= 10 && this.authorAge <= 12) return 'late_elementary';
  if (this.authorAge >= 13 && this.authorAge <= 15) return 'middle_school';
  if (this.authorAge >= 16 && this.authorAge <= 18) return 'high_school';
  return 'unknown';
});

storySchema.virtual('isCompleted').get(function (this: StoryDocument) {
  return this.status === 'completed' || this.status === 'published';
});

storySchema.pre('save', function (this: StoryDocument, next) {
  if (this.isModified('content')) {
    this.wordCount = this.content.split(/\s+/).filter(word => word.length > 0).length;
    this.readingTime = Math.ceil(this.wordCount / 200);
  }
  next();
});

storySchema.methods.addAITurn = async function (
  this: StoryDocument,
  userInput: string,
  aiResponse: string,
  responseType: string
): Promise<void> {
  this.currentTurn += 1;
  
  const aiTurn: AITurn = {
    turnNumber: this.currentTurn,
    userInput,
    aiResponse,
    responseType: responseType as any,
    wordCount: aiResponse.split(/\s+/).filter(word => word.length > 0).length,
    timestamp: new Date(),
  };
  
  this.aiTurns.push(aiTurn);
  this.content += '\n\n' + aiResponse;
  
  await this.save();
};

storySchema.methods.complete = async function (this: StoryDocument): Promise<void> {
  this.status = 'completed';
  this.completedAt = new Date();
  await this.save();
  
  const User = mongoose.model('User');
  const user = await User.findById(this.authorId);
  if (user) {
    await user.incrementStoryCount();
    await user.updateStreak();
  }
};

storySchema.methods.publish = async function (this: StoryDocument): Promise<void> {
  this.status = 'published';
  this.publishedAt = new Date();
  this.isPublic = true;
  await this.save();
};

storySchema.methods.addLike = async function (this: StoryDocument, userId: string): Promise<void> {
  if (!this.likedBy.includes(userId)) {
    this.likedBy.push(userId);
    this.likes = this.likedBy.length;
    await this.save();
  }
};

storySchema.methods.removeLike = async function (this: StoryDocument, userId: string): Promise<void> {
  const index = this.likedBy.indexOf(userId);
  if (index > -1) {
    this.likedBy.splice(index, 1);
    this.likes = this.likedBy.length;
    await this.save();
  }
};

storySchema.methods.recordView = async function (this: StoryDocument, userId: string): Promise<void> {
  const existingView = this.viewedBy.find(view => view.userId === userId);
  
  if (!existingView) {
    this.viewedBy.push({
      userId,
      viewedAt: new Date(),
    });
    this.views = this.viewedBy.length;
    await this.save();
  }
};

const Story =
  mongoose.models.Story ||
  mongoose.model<StoryDocument>('Story', storySchema);
export default Story;