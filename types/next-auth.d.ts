import NextAuth, { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      _id: string;
      email: string;
      name: string;
      image?: string;
      role: 'child' | 'mentor' | 'admin';
      age: number;
      subscriptionTier: 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO';
      isActive: boolean;
      emailVerified: boolean;
      storyCount: number;
      totalPoints: number;
      level: number;
      streak: number;
    } & DefaultSession['user'];
  }

  interface User {
    _id: string;
    email: string;
    name: string;
    image?: string;
    role: 'child' | 'mentor' | 'admin';
    age: number;
    subscriptionTier: 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO';
    isActive: boolean;
    emailVerified: boolean;
    storyCount: number;
    totalPoints: number;
    level: number;
    streak: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    _id: string;
    email: string;
    name: string;
    role: 'child' | 'mentor' | 'admin';
    age: number;
    subscriptionTier: 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO';
    isActive: boolean;
    emailVerified: boolean;
    storyCount: number;
    totalPoints: number;
    level: number;
    streak: number;
    iat: number;
    exp: number;
  }
}