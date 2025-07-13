// app/api/auth/validate-reset-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@lib/database/connection';
import PasswordReset from '@models/PasswordReset';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { token, email } = await request.json();

    if (!token || !email) {
      return NextResponse.json(
        { error: 'MISSING_PARAMETERS', message: 'Token and email are required' },
        { status: 400 }
      );
    }

    // Find reset token
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

    return NextResponse.json({
      success: true,
      message: 'Token is valid'
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to validate token' },
      { status: 500 }
    );
  }
}