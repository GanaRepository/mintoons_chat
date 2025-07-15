// lib/auth/config.ts - NextAuth configuration
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { Adapter } from 'next-auth/adapters';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import User from '@models/User';
import { connectDB } from '@lib/database/connection';
import { validateUserLogin } from '@utils/validators';

const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

// Use NextAuth User type augmentation from types/next-auth.d.ts


export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as unknown as Adapter,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req): Promise<any> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          // Validate input
          validateUserLogin(credentials);

          // Connect to database
          await connectDB();

          // Find user with password using type assertion
          const user = await (User as any).findByEmail(credentials.email);
          if (!user) {
            throw new Error('Invalid email or password');
          }

          // Check if user is active
          if (!user.isActive) {
            throw new Error('Account is deactivated. Please contact support.');
          }

          // Verify password
          const isValidPassword = await user.comparePassword(credentials.password);
          if (!isValidPassword) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            if (user.loginAttempts >= 5) {
              user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
            }
            await user.save();
            throw new Error('Invalid email or password');
          }

          if (user.lockUntil && user.lockUntil > new Date()) {
            const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / (1000 * 60));
            throw new Error(`Account is locked. Try again in ${minutesLeft} minutes.`);
          }

          if (user.loginAttempts > 0) {
            user.loginAttempts = 0;
            user.lockUntil = null;
          }
          user.lastLoginAt = new Date();
          await user.save();

          // Return object matching NextAuth User type (id, name, email, image, plus custom fields)
          return {
            id: user._id.toString(),
            name: user.fullName || `${user.firstName} ${user.lastName}`,
            email: user.email,
            image: user.avatar || null,
            _id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            age: user.age,
            role: user.role,
            subscriptionTier: user.subscriptionTier,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
            avatar: user.avatar,
            bio: user.bio,
            parentEmail: user.parentEmail,
            stripeCustomerId: user.stripeCustomerId,
            subscriptionId: user.subscriptionId,
            subscriptionStatus: user.subscriptionStatus,
            subscriptionExpires: user.subscriptionExpires,
            subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
            storyCount: user.storyCount,
            lastStoryCreated: user.lastStoryCreated,
            totalPoints: user.totalPoints,
            level: user.level,
            streak: user.streak,
            lastActiveDate: user.lastActiveDate,
            assignedStudents: user.assignedStudents,
            mentoringSince: user.mentoringSince,
            emailPreferences: user.emailPreferences,
            lastLoginAt: user.lastLoginAt,
            loginAttempts: user.loginAttempts,
            lockUntil: user.lockUntil,
            fullName: user.fullName,
            ageGroup: user.ageGroup,
            canCreateStory: user.canCreateStory,
            remainingStories: user.remainingStories,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token._id = user._id;
        token.role = user.role;
        token.age = user.age;
        token.subscriptionTier = user.subscriptionTier;
        token.isActive = user.isActive;
        token.emailVerified = Boolean(user.emailVerified);
        token.storyCount = user.storyCount;
        token.totalPoints = user.totalPoints;
        token.level = user.level;
        token.streak = user.streak;
      }

      // Update session trigger
      if (trigger === 'update' && session) {
        // Refresh user data from database
        try {
          await connectDB();
          const dbUser = await (User as any).findById(token.id);
          if (dbUser) {
            token.subscriptionTier = dbUser.subscriptionTier;
            token.storyCount = dbUser.storyCount;
            token.totalPoints = dbUser.totalPoints;
            token.level = dbUser.level;
            token.streak = dbUser.streak;
            token.isActive = dbUser.isActive;
          }
        } catch (error) {
          console.error('Error refreshing token:', error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user._id = token._id;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.age = token.age;
        session.user.subscriptionTier = token.subscriptionTier;
        session.user.isActive = token.isActive;
        session.user.emailVerified = token.emailVerified;
        session.user.storyCount = token.storyCount;
        session.user.totalPoints = token.totalPoints;
        session.user.level = token.level;
        session.user.streak = token.streak;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // If URL parsing fails, return baseUrl
      }
      return baseUrl;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login', // Error code passed in query string as ?error=
    // Removed signUp as it's not a valid NextAuth page option
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', { userId: user.id, email: user.email });

      // Track sign in analytics
      try {
        const { analyticsTracker } = await import('@lib/analytics/tracker');
        await analyticsTracker.trackUserAction('login', user.id, {
          provider: account?.provider || 'credentials',
          isNewUser: isNewUser || false,
        });
      } catch (error) {
        console.error('Error tracking sign in:', error);
      }
    },

    async signOut({ session, token }) {
      console.log('User signed out:', { userId: token?.id });

      // Track sign out analytics
      try {
        const { analyticsTracker } = await import('@lib/analytics/tracker');
        if (token?.id) {
          await analyticsTracker.trackUserAction('logout', token.id as string);
        }
      } catch (error) {
        console.error('Error tracking sign out:', error);
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',
};
