// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import PasswordReset from '@models/PasswordReset';
import { validatePasswordOnly } from '@utils/validators';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { token, email, password } = await request.json();

    if (!token || !email || !password) {
      return NextResponse.json(
        {
          error: 'MISSING_PARAMETERS',
          message: 'Token, email, and password are required',
        },
        { status: 400 }
      );
    }

    // Validate password
    try {
      validatePasswordOnly(password);
    } catch (error) {
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message?: string }).message ?? 'Invalid password'
          : 'Invalid password';
      return NextResponse.json(
        { error: 'INVALID_PASSWORD', message: errorMessage },
        { status: 400 }
      );
    }

    // Find and validate reset token
    const resetRecord = await PasswordReset.findOne({
      token,
      email: email.toLowerCase(),
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'INVALID_TOKEN', message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findById(resetRecord.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'USER_NOT_FOUND', message: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password
    user.password = hashedPassword;
    user.updatedAt = new Date();
    await user.save();

    // Mark token as used
    resetRecord.used = true;
    resetRecord.usedAt = new Date();
    await resetRecord.save();

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
