export interface PasswordReset {
  _id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  isUsed: boolean;
  usedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordResetCreateData {
  userId: string;
  ipAddress: string;
  userAgent: string;
}