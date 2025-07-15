// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import { userRegistrationSchema } from '@utils/validators';
import { needsParentalConsent } from '@utils/age-restrictions';
import { emailSender } from '@lib/email/sender';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';
import { rateLimiter } from '@lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (custom implementation)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const key = `register:${ip}`;
    const rateLimitInfo = await (rateLimiter as any).getRateLimitInfo(key, {
      windowMs: 3600 * 1000,
      max: 5,
      prefix: 'rate_limit',
    });
    if (rateLimitInfo.current > rateLimitInfo.limit) {
      return NextResponse.json(
        { error: 'RATE_LIMIT_EXCEEDED', message: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    await connectDB();

    const body = await request.json();
    
    // Validate input
    const validation = userRegistrationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid input data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password, age, role, parentEmail, termsAccepted } = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      trackEvent(TRACKING_EVENTS.ERROR_OCCURRED, {
        type: 'registration_duplicate_email',
        email,
        ip: request.ip,
      });
      return NextResponse.json(
        { error: 'USER_EXISTS', message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // COPPA compliance check
    const requiresConsent = needsParentalConsent(age);
    if (requiresConsent && !parentEmail) {
      return NextResponse.json(
        { error: 'PARENTAL_CONSENT_REQUIRED', message: 'Parental consent is required for users under 13' },
        { status: 400 }
      );
    }

    // Create user
    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password, // Will be hashed by pre-save middleware
      age,
      role: role || 'child',
      subscriptionTier: 'FREE',
      parentEmail: requiresConsent ? parentEmail : null,
      emailVerified: false, // Will be verified via email
      isActive: true,
      preferences: {
        emailNotifications: true,
        mentorFeedback: true,
        achievementAlerts: true,
        weeklyReports: true,
      },
      createdAt: new Date(),
    });

    await user.save();

    // Track successful registration
    trackEvent(TRACKING_EVENTS.USER_REGISTER, {
      userId: user._id.toString(),
      email,
      age,
      needsParentalConsent: requiresConsent,
      method: 'credentials',
      ip: request.ip,
    });

    // Send welcome email (async)
    try {
      await emailSender.sendWelcomeEmail(user);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
      // Don't fail registration if email fails
    }

    // Return user data (excluding password)
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      age: user.age,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      createdAt: user.createdAt,
    };

    return NextResponse.json(
      { 
        success: true, 
        message: 'Account created successfully',
        user: userResponse 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);

    trackEvent(TRACKING_EVENTS.ERROR_OCCURRED, {
      type: 'registration_server_error',
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: request.ip,
    });

    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}