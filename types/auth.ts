import type { UserRole } from './user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  role?: UserRole;
  parentEmail?: string;
  termsAccepted: boolean;
}

export interface AuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  role: UserRole;
  subscriptionTier: 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: AuthUser;
  expires: string;
  accessToken: string;
  refreshToken?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AuthError;
  message?: string;
}

export interface NextAuthUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  age: number;
  subscriptionTier: 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO';
}

export interface NextAuthSession {
  user: NextAuthUser;
  expires: string;
}

export interface NextAuthToken {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  age: number;
  subscriptionTier: 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO';
  iat: number;
  exp: number;
}