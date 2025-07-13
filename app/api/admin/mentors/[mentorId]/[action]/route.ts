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
  action: string;
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

    const { mentorId, action } = params;
    const mentor = await User.findById(mentorId);

    if (!mentor || mentor.role !== 'mentor') {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    switch (action) {
      case 'activate':
        mentor.isActive = true;
        mentor.suspendedAt = null;
        mentor.suspensionReason = null;
        await mentor.save();

        await sendEmail({
          to: mentor.email,
          subject: 'Your MINTOONS mentor account has been reactivated',
          template: 'mentor_account_reactivated',
          data: {
            firstName: mentor.firstName,
            dashboardUrl: `${process.env.APP_URL}/mentor-dashboard`,
          },
        });
        break;

      case 'suspend':
        const { reason } = await request.json();
        mentor.isActive = false;
        mentor.suspendedAt = new Date();
        mentor.suspensionReason =
          reason || 'Account suspended by administrator';
        await mentor.save();

        await sendEmail({
          to: mentor.email,
          subject: 'Your MINTOONS mentor account has been suspended',
          template: 'mentor_account_suspended',
          data: {
            firstName: mentor.firstName,
            reason: mentor.suspensionReason,
            supportUrl: `${process.env.APP_URL}/contact`,
          },
        });
        break;

      case 'reset-password':
        const tempPassword = Math.random().toString(36).slice(-10);
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        mentor.password = hashedPassword;
        await mentor.save();

        await sendEmail({
          to: mentor.email,
          subject: 'Your MINTOONS password has been reset',
          template: 'password_reset_admin',
          data: {
            firstName: mentor.firstName,
            tempPassword,
            loginUrl: `${process.env.APP_URL}/login`,
          },
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Track admin action
    trackEvent(TRACKING_EVENTS.ADMIN_ACTION, {
      action: `mentor_${action}`,
      adminId: session.user.id,
      targetMentorId: mentorId,
    });

    return NextResponse.json({
      success: true,
      message: `Mentor ${action} completed successfully`,
    });
  } catch (error) {
    console.error(`Error ${params.action} mentor:`, error);
    return NextResponse.json(
      { error: `Failed to ${params.action} mentor` },
      { status: 500 }
    );
  }
}
