import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import { sendEmail } from '@lib/email/sender';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';

interface Params {
  mentorId: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { mentorId } = params;
    const { studentIds, notifyStudents = true } = await request.json();

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'Invalid student IDs' }, { status: 400 });
    }

    // Verify mentor exists
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    // Verify students exist and are not already assigned
    const students = await User.find({
      _id: { $in: studentIds },
      role: 'child',
      isActive: true
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json({ error: 'Some students not found or invalid' }, { status: 400 });
    }

    // Check if any students are already assigned to mentors
    const alreadyAssigned = await User.find({
      role: 'mentor',
      assignedStudents: { $in: studentIds }
    });

    if (alreadyAssigned.length > 0) {
      return NextResponse.json({ 
        error: 'Some students are already assigned to other mentors' 
      }, { status: 400 });
    }

    // Add students to mentor's assigned list
    const currentAssigned = mentor.assignedStudents || [];
    const newAssigned = [...new Set([...currentAssigned, ...studentIds])];
    
    await User.findByIdAndUpdate(mentorId, {
      assignedStudents: newAssigned
    });

    // Send notification emails to students and parents if requested
    if (notifyStudents) {
      for (const student of students) {
        // Notify student
        await sendEmail({
          to: student.email,
          subject: 'You\'ve been assigned a mentor on MINTOONS!',
          template: 'mentor_assigned_student',
          data: {
            studentName: student.firstName,
            mentorName: `${mentor.firstName} ${mentor.lastName}`,
            dashboardUrl: `${process.env.APP_URL}/dashboard`,
          },
        });

        // Notify parent if student is under 13 (COPPA compliance)
        if (student.age < 13 && student.parentEmail) {
          await sendEmail({
            to: student.parentEmail,
            subject: `${student.firstName} has been assigned a mentor on MINTOONS`,
            template: 'mentor_assigned_parent',
            data: {
              parentName: 'Parent/Guardian',
              studentName: student.firstName,
              mentorName: `${mentor.firstName} ${mentor.lastName}`,
              mentorBio: mentor.bio || 'Professional writing mentor',
              dashboardUrl: `${process.env.APP_URL}/dashboard`,
            },
          });
        }
      }

      // Notify mentor
      await sendEmail({
        to: mentor.email,
        subject: 'New students assigned to you on MINTOONS',
        template: 'students_assigned_mentor',
        data: {
          mentorName: mentor.firstName,
          studentCount: students.length,
          studentNames: students.map(s => s.firstName).join(', '),
          dashboardUrl: `${process.env.APP_URL}/mentor-dashboard`,
        },
      });
    }

    // Track admin action
    trackEvent(TRACKING_EVENTS.ADMIN_ACTION, {
      action: 'assign_students_to_mentor',
      adminId: session.user._id,
      mentorId,
      studentCount: students.length,
    });

    return NextResponse.json({ 
      success: true,
      message: `Successfully assigned ${students.length} students to mentor`,
      assignedCount: students.length
    });

  } catch (error) {
    console.error('Error assigning students to mentor:', error);
    return NextResponse.json(
      { error: 'Failed to assign students' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { mentorId } = params;
    const { studentIds } = await request.json();

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'Invalid student IDs' }, { status: 400 });
    }

    // Remove students from mentor's assigned list
    const mentor = await User.findByIdAndUpdate(
      mentorId,
      { $pull: { assignedStudents: { $in: studentIds } } },
      { new: true }
    );

    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    // Track admin action
    trackEvent(TRACKING_EVENTS.ADMIN_ACTION, {
      action: 'unassign_students_from_mentor',
      adminId: session.user._id,
      mentorId,
      studentCount: studentIds.length,
    });

    return NextResponse.json({ 
      success: true,
      message: `Successfully unassigned ${studentIds.length} students from mentor`
    });

  } catch (error) {
    console.error('Error unassigning students from mentor:', error);
    return NextResponse.json(
      { error: 'Failed to unassign students' }, 
      { status: 500 }
    );
  }
}