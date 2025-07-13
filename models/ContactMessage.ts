import mongoose, { Schema, Document } from 'mongoose';

export interface ContactMessageDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  userType: 'parent' | 'child' | 'mentor' | 'educator' | 'other';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: mongoose.Types.ObjectId;
  responseTime?: Date;
  resolvedAt?: Date;
  source: string;
  ipAddress: string;
  userAgent: string;
  tags: string[];
  internalNotes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const contactMessageSchema = new Schema<ContactMessageDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name must be less than 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
    },

    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject must be less than 200 characters'],
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'general',
        'technical',
        'billing',
        'safety',
        'feature',
        'bug',
        'mentor',
        'partnership',
        'media',
        'feedback',
      ],
    },

    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [5000, 'Message must be less than 5000 characters'],
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    userType: {
      type: String,
      enum: ['parent', 'child', 'mentor', 'educator', 'other'],
      default: 'parent',
    },

    status: {
      type: String,
      enum: ['new', 'in_progress', 'resolved', 'closed'],
      default: 'new',
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    responseTime: {
      type: Date,
    },

    resolvedAt: {
      type: Date,
    },

    source: {
      type: String,
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
        note: { type: String, required: true },
        addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
contactMessageSchema.index({ status: 1, priority: 1 });
contactMessageSchema.index({ category: 1, createdAt: -1 });
contactMessageSchema.index({ email: 1 });
contactMessageSchema.index({ assignedTo: 1, status: 1 });

// Virtual for ticket ID (short format)
contactMessageSchema.virtual('ticketId').get(function() {
  return this._id.toString().slice(-8).toUpperCase();
});

// Method to auto-assign priority based on keywords
contactMessageSchema.methods.autoAssignPriority = function() {
  const urgentKeywords = ['urgent', 'emergency', 'critical', 'broken', 'error', 'bug'];
  const messageText = `${this.subject} ${this.message}`.toLowerCase();
  
  const hasUrgentKeywords = urgentKeywords.some(keyword => 
    messageText.includes(keyword)
  );

  if (hasUrgentKeywords) {
    this.priority = 'high';
  }
};

// Pre-save middleware
contactMessageSchema.pre('save', function(next) {
  if (this.isNew) {
    this.autoAssignPriority();
  }
  next();
});

const ContactMessage = mongoose.models.ContactMessage || 
  mongoose.model<ContactMessageDocument>('ContactMessage', contactMessageSchema);

export default ContactMessage;