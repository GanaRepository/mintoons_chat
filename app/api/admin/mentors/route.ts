import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import { sendEmail } from '@lib/email/sender';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
 try {
   const session = await getServerSession(authOptions);
   
   if (!session?.user || session.user.role !== 'admin') {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   await connectDB();

   const searchParams = request.nextUrl.searchParams;
   const page = parseInt(searchParams.get('page') || '1');
   const limit = parseInt(searchParams.get('limit') || '20');
   const skip = (page - 1) * limit;

   // Build query
   let query: any = { role: 'mentor' };
   
   const status = searchParams.get('status');
   const search = searchParams.get('search');
   const sort = searchParams.get('sort') || 'created';

   if (status === 'active') {
     const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
     query.lastActiveAt = { $gte: weekAgo };
   } else if (status === 'inactive') {
     const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
     query.lastActiveAt = { $lt: weekAgo };
   } else if (status === 'new') {
     const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
     query.createdAt = { $gte: monthAgo };
   }

   if (search) {
     query.$or = [
       { firstName: { $regex: search, $options: 'i' } },
       { lastName: { $regex: search, $options: 'i' } },
       { email: { $regex: search, $options: 'i' } }
     ];
   }

   // Sort options
   let sortQuery: any = { createdAt: -1 };
   if (sort === 'name') sortQuery = { firstName: 1, lastName: 1 };
   else if (sort === 'students') sortQuery = { 'assignedStudents.length': -1 };
   else if (sort === 'active') sortQuery = { lastActiveAt: -1 };

   const [mentors, total] = await Promise.all([
     User.find(query)
       .populate('assignedStudents', 'firstName lastName email age storyCount level')
       .sort(sortQuery)
       .skip(skip)
       .limit(limit)
       .select('-password')
       .lean(),
     User.countDocuments(query)
   ]);

   return NextResponse.json({
     mentors,
     pagination: {
       page,
       limit,
       total,
       totalPages: Math.ceil(total / limit),
     }
   });

 } catch (error) {
   console.error('Error fetching mentors:', error);
   return NextResponse.json(
     { error: 'Failed to fetch mentors' }, 
     { status: 500 }
   );
 }
}

export async function POST(request: NextRequest) {
 try {
   const session = await getServerSession(authOptions);
   
   if (!session?.user || session.user.role !== 'admin') {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   await connectDB();

   const data = await request.json();
   const { firstName, lastName, email, bio, sendInviteEmail = true } = data;

   // Check if mentor already exists
   const existingUser = await User.findOne({ email });
   if (existingUser) {
     return NextResponse.json(
       { error: 'A user with this email already exists' }, 
       { status: 400 }
     );
   }

   // Generate temporary password
   const tempPassword = Math.random().toString(36).slice(-10);
   const hashedPassword = await bcrypt.hash(tempPassword, 12);

   // Create mentor account
   const mentor = await User.create({
     firstName,
     lastName,
     email,
     password: hashedPassword,
     age: 25, // Default age for mentors
     role: 'mentor',
     subscriptionTier: 'PRO',
     bio,
     mentoringSince: new Date(),
     isActive: true,
     emailVerified: false,
     assignedStudents: [],
   });

   // Send invitation email if requested
   if (sendInviteEmail) {
     await sendEmail({
       to: email,
       subject: 'Welcome to MINTOONS - Mentor Invitation',
       template: 'mentor_invitation',
       data: {
         firstName,
         tempPassword,
         loginUrl: `${process.env.APP_URL}/login`,
         dashboardUrl: `${process.env.APP_URL}/mentor-dashboard`,
       },
     });
   }

   // Track admin action
   trackEvent(TRACKING_EVENTS.ADMIN_ACTION, {
     action: 'create_mentor',
     adminId: session.user.id,
     mentorId: mentor._id,
   });

   return NextResponse.json({ 
     success: true,
     mentor: {
       _id: mentor._id,
       firstName: mentor.firstName,
       lastName: mentor.lastName,
       email: mentor.email,
       role: mentor.role,
     },
     tempPassword: sendInviteEmail ? undefined : tempPassword,
   });

 } catch (error) {
   console.error('Error creating mentor:', error);
   return NextResponse.json(
     { error: 'Failed to create mentor' }, 
     { status: 500 }
   );
 }
}