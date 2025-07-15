// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import PasswordReset from '@models/PasswordReset';
import { validateEmailOnly } from '@utils/validators';
import { generateSecureToken } from '@utils/helpers';
import { emailSender } from '@lib/email/sender';
import { rateLimiter } from '@lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 3 attempts per hour (custom implementation)
    // Use IP as key for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const key = `forgot-password:${ip}`;
    const rateLimitInfo = await (rateLimiter as any).getRateLimitInfo(key, {
      windowMs: 3600 * 1000,
      max: 3,
      prefix: 'rate_limit',
    });
    if (rateLimitInfo.current > rateLimitInfo.limit) {
      return NextResponse.json(
        { error: 'RATE_LIMIT_EXCEEDED', message: 'Too many password reset attempts. Please try again later.' },
        { status: 429 }
      );
    }

    await connectDB();

    const { email } = await request.json();

    // Validate email
    try {
      validateEmailOnly(email);
    } catch (error) {
      return NextResponse.json(
        { error: 'INVALID_EMAIL', message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists for security
      return NextResponse.json(
        { success: true, message: 'If an account with this email exists, you will receive a password reset link.' }
      );
    }

    // Generate reset token
    const token = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing reset tokens for this user
    await PasswordReset.deleteMany({ userId: user._id });

    // Create new reset token
    const passwordReset = new PasswordReset({
      userId: user._id,
      email: user.email,
      token,
      expiresAt,
      used: false,
    });

    await passwordReset.save();

    // Send reset email
    try {
      await emailSender.sendPasswordResetEmail(user, token);
    } catch (emailError) {
      console.error('Password reset email failed:', emailError);
      // Clean up the token if email fails
      await PasswordReset.deleteOne({ _id: passwordReset._id });
      return NextResponse.json(
        { error: 'EMAIL_FAILED', message: 'Failed to send reset email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent to your email address.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to process password reset request.' },
      { status: 500 }
    );
  }
}