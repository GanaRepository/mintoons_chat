export type ContactCategory =
  | 'general'
  | 'technical'
  | 'billing'
  | 'safety'
  | 'feature'
  | 'bug'
  | 'mentor'
  | 'partnership'
  | 'media'
  | 'feedback';

export type ContactPriority = 'low' | 'medium' | 'high';
export type ContactUserType = 'parent' | 'child' | 'mentor' | 'educator' | 'other';
export type ContactStatus = 'new' | 'in_progress' | 'resolved' | 'closed';

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  category: ContactCategory;
  message: string;
  priority: ContactPriority;
  userType: ContactUserType;
  status: ContactStatus;
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
}

export interface ContactMessageCreateData {
  name: string;
  email: string;
  subject: string;
  category: ContactCategory;
  message: string;
  userType: ContactUserType;
  source?: string;
  ipAddress: string;
  userAgent: string;
}

export interface ContactMessageUpdateData {
  status?: ContactStatus;
  priority?: ContactPriority;
  assignedTo?: string;
  tags?: string[];
}

export interface ContactMessageFilters {
  status?: ContactStatus;
  category?: ContactCategory;
  priority?: ContactPriority;
  userType?: ContactUserType;
  assignedTo?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  sortBy?: 'createdAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}