// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
// Removed Zod, rate limiting, Redis, and extra imports for simplicity

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    // Basic required fields check
    const { firstName, lastName, email, password, age, role, parentEmail, termsAccepted } = body;
    if (!firstName || !lastName || !email || !password || !age) {
      return NextResponse.json({ error: 'MISSING_FIELDS', message: 'Required fields missing.' }, { status: 400 });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'USER_EXISTS', message: 'An account with this email already exists.' }, { status: 409 });
    }
    // Create user
    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      age,
      role: role || 'child',
      subscriptionTier: 'FREE',
      parentEmail: parentEmail || null,
      emailVerified: false,
      isActive: true,
      createdAt: new Date(),
    });
    await user.save();
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
    return NextResponse.json({ success: true, message: 'Account created successfully', user: userResponse }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Registration failed.' }, { status: 500 });
  }
}