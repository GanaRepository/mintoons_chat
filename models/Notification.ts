// models/Notification.ts - Notification system model
import mongoose, { Schema, Document } from 'mongoose';

export interface NotificationDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type:
    | 'story_completed'
    | 'mentor_comment'
    | 'achievement_unlocked'
    | 'subscription_expiring'
    | 'weekly_progress'
    | 'system_announcement';
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  markAsRead(): Promise<void>;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        'story_completed',
        'mentor_comment',
        'achievement_unlocked',
        'subscription_expiring',
        'weekly_progress',
        'system_announcement',
      ],
      required: true,
      index: true,
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
      index: true,
    },

    readAt: {
      type: Date,
    },

    // Priority for sorting
    priority: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    // Expiration for temporary notifications
    expiresAt: {
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
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to mark as read
notificationSchema.methods.markAsRead = async function (
  this: NotificationDocument
): Promise<void> {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
  }
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsRead = function (userId: string) {
  return this.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function (userId: string) {
  return this.countDocuments({ userId, isRead: false });
};

// Static method to cleanup old notifications
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
  mongoose.model<NotificationDocument>('Notification', notificationSchema);
export default Notification;
