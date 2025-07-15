import mongoose, { Schema, Document } from 'mongoose';

export interface NotificationDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  type: 'story_completed' | 'mentor_comment' | 'achievement_unlocked' | 'subscription_expiring' | 'weekly_progress' | 'system_announcement';
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  priority: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  markAsRead(): Promise<void>;
}

interface NotificationModel extends mongoose.Model<NotificationDocument> {
  markAllAsRead(userId: string): Promise<any>;
  getUnreadCount(userId: string): Promise<number>;
  cleanup(days?: number): Promise<any>;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: {
      type: String,
      required: true,
      // ...existing code...
    },
    type: {
      type: String,
      enum: ['story_completed', 'mentor_comment', 'achievement_unlocked', 'subscription_expiring', 'weekly_progress', 'system_announcement'],
      required: true,
      // ...existing code...
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Title must be no more than 200 characters'],
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Message must be no more than 1000 characters'],
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      // ...existing code...
    },
    readAt: {
      type: Date,
    },
    priority: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc: any, ret: any) {
        ret._id = ret._id?.toString();
        if (ret.userId) ret.userId = ret.userId.toString();
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

notificationSchema.methods.markAsRead = async function (this: NotificationDocument): Promise<void> {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
  }
};

notificationSchema.statics.markAllAsRead = function (userId: string) {
  return this.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

notificationSchema.statics.getUnreadCount = function (userId: string) {
  return this.countDocuments({ userId, isRead: false });
};

notificationSchema.statics.cleanup = function (days: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return this.deleteMany({
    isRead: true,
    readAt: { $lt: cutoffDate },
  });
};

const Notification =
  mongoose.models.Notification ||
  mongoose.model<NotificationDocument, NotificationModel>('Notification', notificationSchema);
export default Notification;