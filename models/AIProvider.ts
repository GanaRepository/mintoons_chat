// models/AIProvider.ts - AI provider configuration model
import mongoose, { Schema, Document } from 'mongoose';
import type { AIConfiguration } from '../types/ai';

export interface AIProviderDocument extends Document {
  provider: 'openai' | 'anthropic' | 'google';
  aiModel:
    | 'gpt-4'
    | 'gpt-4-turbo'
    | 'claude-3-opus'
    | 'claude-3-sonnet'
    | 'gemini-pro';
  apiKey?: string; // Make optional for delete operation
  maxTokens: number;
  temperature: number;
  isActive: boolean;
  costPerToken: number;
  priority: number;
  usage: {
    requestsToday: number;
    tokensUsed: number;
    costToday: number;
    lastUsed: Date;
  };
  rateLimits: {
    requestsPerMinute: number;
    requestsPerDay: number;
    tokensPerDay: number;
  };
  performance: {
    averageResponseTime: number;
    successRate: number;
    errorCount: number;
    lastError: {
      message: string;
      timestamp: Date;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  updateUsage(tokens: number, cost: number): Promise<void>;
  resetDailyUsage(): Promise<void>;
}

const aiProviderSchema = new Schema<AIProviderDocument>(
  {
    provider: {
      type: String,
      enum: ['openai', 'anthropic', 'google'],
      required: true,
      index: true,
    },

    aiModel: {
      type: String,
      enum: [
        'gpt-4',
        'gpt-4-turbo',
        'claude-3-opus',
        'claude-3-sonnet',
        'gemini-pro',
      ],
      required: true,
    },

    apiKey: {
      type: String,
      required: true,
      select: false, // Don't include in queries by default
    },

    maxTokens: {
      type: Number,
      required: true,
      min: 100,
      max: 4000,
      default: 1000,
    },

    temperature: {
      type: Number,
      required: true,
      min: 0,
      max: 2,
      default: 0.7,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    costPerToken: {
      type: Number,
      required: true,
      min: 0,
    },

    priority: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 5,
    },

    // Usage tracking
    usage: {
      requestsToday: {
        type: Number,
        default: 0,
        min: 0,
      },
      tokensUsed: {
        type: Number,
        default: 0,
        min: 0,
      },
      costToday: {
        type: Number,
        default: 0,
        min: 0,
      },
      lastUsed: {
        type: Date,
      },
    },

    // Rate limiting
    rateLimits: {
      requestsPerMinute: {
        type: Number,
        default: 60,
      },
      requestsPerDay: {
        type: Number,
        default: 1000,
      },
      tokensPerDay: {
        type: Number,
        default: 100000,
      },
    },

    // Performance metrics
    performance: {
      averageResponseTime: {
        type: Number,
        default: 0,
      },
      successRate: {
        type: Number,
        default: 100,
        min: 0,
        max: 100,
      },
      errorCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      lastError: {
        message: String,
        timestamp: Date,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.apiKey; // Never expose API key
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Indexes
aiProviderSchema.index({ provider: 1, aiModel: 1 }, { unique: true });
aiProviderSchema.index({ isActive: 1, priority: -1 });

// Virtual for availability status
aiProviderSchema.virtual('isAvailable').get(function (
  this: AIProviderDocument
) {
  const now = new Date();
  const lastUsed = this.usage.lastUsed;

  // Check if within rate limits
  const withinDailyLimit =
    this.usage.requestsToday < this.rateLimits.requestsPerDay;
  const withinTokenLimit = this.usage.tokensUsed < this.rateLimits.tokensPerDay;

  // Check if not recently errored (within last 5 minutes)
  const recentError =
    this.performance.lastError?.timestamp &&
    now.getTime() - this.performance.lastError.timestamp.getTime() < 300000;

  return this.isActive && withinDailyLimit && withinTokenLimit && !recentError;
});

// Method to update usage
aiProviderSchema.methods.updateUsage = async function (
  this: AIProviderDocument,
  tokens: number,
  cost: number
): Promise<void> {
  this.usage.requestsToday += 1;
  this.usage.tokensUsed += tokens;
  this.usage.costToday += cost;
  this.usage.lastUsed = new Date();
  await this.save();
};

// Method to reset daily usage
aiProviderSchema.methods.resetDailyUsage = async function (
  this: AIProviderDocument
): Promise<void> {
  this.usage.requestsToday = 0;
  this.usage.tokensUsed = 0;
  this.usage.costToday = 0;
  await this.save();
};

// Static method to get best available provider
aiProviderSchema.statics.getBestAvailable = function () {
  return this.findOne({
    isActive: true,
    'usage.requestsToday': { $lt: 1000 }, // Use hardcoded value instead of accessing rateLimits
  }).sort({ priority: -1, 'performance.averageResponseTime': 1 });
};

// Static method to get fallback providers
aiProviderSchema.statics.getFallbacks = function (excludeProvider: string) {
  return this.find({
    provider: { $ne: excludeProvider },
    isActive: true,
  }).sort({ priority: -1 });
};

const AIProvider =
  mongoose.models.AIProvider ||
  mongoose.model<AIProviderDocument>('AIProvider', aiProviderSchema);
export default AIProvider;
