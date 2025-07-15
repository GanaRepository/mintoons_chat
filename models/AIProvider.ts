import * as mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';
import type { AIProvider as AIProviderType, AIModel } from '../types/ai';

export interface AIProviderDocument extends Document {
  provider: AIProviderType;
  modelName: AIModel;
  apiKey?: string;
  maxTokens: number;
  temperature: number;
  isActive: boolean;
  costPerToken: number;
  priority: number;
  usage: {
    requestsToday: number;
    tokensUsed: number;
    costToday: number;
    lastUsed?: Date;
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
    lastError?: {
      message: string;
      timestamp: Date;
    };
  };

  isAvailable: boolean;

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
    modelName: {
      type: String,
      enum: ['gpt-4o-mini', 'gpt-4o-nano', 'claude-3-haiku', 'gemini-1.5-flash', 'o1-mini', 'o3-mini'],
      required: true,
    },
    apiKey: {
      type: String,
      required: true,
      select: false,
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
        if (ret.apiKey !== undefined) {
          delete ret.apiKey;
        }
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

aiProviderSchema.index({ provider: 1, modelName: 1 }, { unique: true });
aiProviderSchema.index({ isActive: 1, priority: -1 });

aiProviderSchema.virtual('isAvailable').get(function (this: AIProviderDocument) {
  const now = new Date();
  const withinDailyLimit = this.usage.requestsToday < this.rateLimits.requestsPerDay;
  const withinTokenLimit = this.usage.tokensUsed < this.rateLimits.tokensPerDay;
  const recentError = this.performance.lastError?.timestamp &&
    now.getTime() - this.performance.lastError.timestamp.getTime() < 300000;

  return this.isActive && withinDailyLimit && withinTokenLimit && !recentError;
});

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

aiProviderSchema.methods.resetDailyUsage = async function (this: AIProviderDocument): Promise<void> {
  this.usage.requestsToday = 0;
  this.usage.tokensUsed = 0;
  this.usage.costToday = 0;
  await this.save();
};

aiProviderSchema.statics.getBestAvailable = function () {
  return this.findOne({
    isActive: true,
    'usage.requestsToday': { $lt: 1000 },
  }).sort({ priority: -1, 'performance.averageResponseTime': 1 });
};

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