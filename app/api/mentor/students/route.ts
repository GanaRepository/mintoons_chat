export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import Story from '@models/Story';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'mentor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get mentor's assigned students
    const mentor = await User.findById(session.user._id)
      .populate({
        path: 'assignedStudents',
        select: 'firstName lastName email age storyCount level points streak lastActiveAt createdAt',
        match: { isActive: true }
      })
      .lean();

    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    const students = ((mentor as any).assignedStudents as any[] | undefined) || [];
    const studentIds = students.map(s => s._id);

    // Get recent stories for each student
    const recentStories = await Story.find({
      authorId: { $in: studentIds },
      isDeleted: { $ne: true }
    })
      .populate('authorId', 'firstName lastName')
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    // Group stories by student
    const storiesByStudent = recentStories.reduce((acc, story) => {
      const studentId = story.authorId._id.toString();
      if (!acc[studentId]) acc[studentId] = [];
      acc[studentId].push(story);
      return acc;
    }, {} as Record<string, any[]>);

    // Add recent stories to each student
    const studentsWithStories = students.map(student => ({
      ...student,
      recentStories: storiesByStudent[student._id.toString()] || []
    }));

    return NextResponse.json({
      students: studentsWithStories,
      totalStudents: students.length
    });

  } catch (error) {
    console.error('Error fetching mentor students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}