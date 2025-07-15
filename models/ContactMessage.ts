import * as mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';

export interface ContactMessageDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  subject: string;
  category: 'general' | 'technical' | 'billing' | 'safety' | 'feature' | 'bug' | 'mentor' | 'partnership' | 'media' | 'feedback';
  message: string;
  priority: 'low' | 'medium' | 'high';
  userType: 'parent' | 'child' | 'mentor' | 'educator' | 'other';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  responseTime?: Date;
  resolvedAt?: Date;
  source: string;
  ipAddress: string;
  userAgent: string;
  tags: string[];
  internalNotes: Array<{
    note: string;
    addedBy: string;
    addedAt: Date;
  }>;

  ticketId: string;

  createdAt: Date;
  updatedAt: Date;

  assignTo(userId: string): Promise<void>;
  addNote(note: string, addedBy: string): Promise<void>;
  resolve(): Promise<void>;
}

const contactMessageSchema = new Schema<ContactMessageDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Name must be no more than 100 characters'],
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please enter a valid email address',
      },
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Subject must be no more than 200 characters'],
    },
    category: {
      type: String,
      enum: ['general', 'technical', 'billing', 'safety', 'feature', 'bug', 'mentor', 'partnership', 'media', 'feedback'],
      required: true,
      // ...existing code...
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, 'Message must be no more than 2000 characters'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      // ...existing code...
    },
    userType: {
      type: String,
      enum: ['parent', 'child', 'mentor', 'educator', 'other'],
      required: true,
      // ...existing code...
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'resolved', 'closed'],
      default: 'new',
      // ...existing code...
    },
    assignedTo: {
      type: String,
    },
    responseTime: {
      type: Date,
    },
    resolvedAt: {
      type: Date,
    },
    source: {
      type: String,
      required: true,
      default: 'website',
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    internalNotes: [
      {
        note: {
          type: String,
          required: true,
          trim: true,
        },
        addedBy: {
          type: String,
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    ticketId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc: any, ret: any) {
        ret._id = ret._id?.toString();
        if (ret.assignedTo) ret.assignedTo = ret.assignedTo.toString();
        if (ret.internalNotes) {
          ret.internalNotes = ret.internalNotes.map((note: any) => ({
            ...note,
            addedBy: note.addedBy?.toString(),
          }));
        }
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

contactMessageSchema.index({ category: 1, status: 1 });
contactMessageSchema.index({ priority: 1, createdAt: -1 });
contactMessageSchema.index({ email: 1 });
contactMessageSchema.index({ ticketId: 1 }, { unique: true });

contactMessageSchema.pre('save', function (this: ContactMessageDocument, next) {
  if (!this.ticketId) {
    this.ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  next();
});

contactMessageSchema.methods.assignTo = async function (
  this: ContactMessageDocument,
  userId: string
): Promise<void> {
  this.assignedTo = userId;
  this.status = 'in_progress';
  await this.save();
};

contactMessageSchema.methods.addNote = async function (
  this: ContactMessageDocument,
  note: string,
  addedBy: string
): Promise<void> {
  this.internalNotes.push({
    note,
    addedBy,
    addedAt: new Date(),
  });
  await this.save();
};

contactMessageSchema.methods.resolve = async function (this: ContactMessageDocument): Promise<void> {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  await this.save();
};

const ContactMessage =
  mongoose.models.ContactMessage ||
  mongoose.model<ContactMessageDocument>('ContactMessage', contactMessageSchema);
export default ContactMessage;