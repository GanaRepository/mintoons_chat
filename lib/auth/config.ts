// lib/auth/config.ts - NextAuth configuration
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import User from '@models/User';
import { connectDB } from '@lib/database/connection';
import { validateUserLogin } from '@utils/validators';

const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          // Validate input
          validateUserLogin(credentials);

          // Connect to database
          await connectDB();

          // Find user with password
          const user = await User.findByEmail(credentials.email);
          if (!user) {
            throw new Error('Invalid email or password');
          }

          // Check if user is active
          if (!user.isActive) {
            throw new Error('Account is deactivated. Please contact support.');
          }

          // Verify password
          const isValidPassword = await user.comparePassword(
            credentials.password
          );
          if (!isValidPassword) {
            // Increment login attempts
            user.loginAttempts = (user.loginAttempts || 0) + 1;

            // Lock account after 5 failed attempts
            if (user.loginAttempts >= 5) {
              user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
            }

            await user.save();
            throw new Error('Invalid email or password');
          }

          // Check if account is locked
          if (user.lockUntil && user.lockUntil > new Date()) {
            const minutesLeft = Math.ceil(
              (user.lockUntil.getTime() - Date.now()) / (1000 * 60)
            );
            throw new Error(
              `Account is locked. Try again in ${minutesLeft} minutes.`
            );
          }

          // Reset login attempts on successful login
          if (user.loginAttempts > 0) {
            user.loginAttempts = 0;
            user.lockUntil = undefined;
          }

          // Update last login
          user.lastLoginAt = new Date();
          await user.save();

          // Return user object for NextAuth
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.fullName,
            image: user.avatar,
            role: user.role,
            age: user.age,
            subscriptionTier: user.subscriptionTier,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
            storyCount: user.storyCount,
            totalPoints: user.totalPoints,
            level: user.level,
            streak: user.streak,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      },
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
        token.id = user.id;
        token.role = user.role;
        token.age = user.age;
        token.subscriptionTier = user.subscriptionTier;
        token.isActive = user.isActive;
        token.emailVerified = user.emailVerified;
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
          const dbUser = await User.findById(token.id);
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
      if (token) {
        session.user.id = token.id;
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
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: '/login',
    signUp: '/register',
    error: '/login', // Error code passed in query string as ?error=
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', { userId: user.id, email: user.email });

      // Track sign in analytics
      try {
        const Analytics = (await import('@models/Analytics')).default;
        // Could add sign-in tracking here
      } catch (error) {
        console.error('Error tracking sign in:', error);
      }
    },

    async signOut({ session, token }) {
      console.log('User signed out:', { userId: token?.id });
    },
  },

  debug: process.env.NODE_ENV === 'development',
};
