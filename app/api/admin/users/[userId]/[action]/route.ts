import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import Story from '@models/Story';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';
import { sendEmail } from '@lib/email/sender';

interface Params {
  userId: string;
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

    const { userId, action } = params;
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    switch (action) {
      case 'activate':
        user.isActive = true;
        user.suspendedAt = null;
        user.suspensionReason = null;
        await user.save();

        await sendEmail({
          to: user.email,
          subject: 'Your MINTOONS account has been reactivated',
          template: 'account_reactivated',
          data: {
            firstName: user.name,
            supportUrl: `${process.env.APP_URL}/contact`,
          },
        });
        break;

      case 'suspend':
        const { reason } = await request.json();
        user.isActive = false;
        user.suspendedAt = new Date();
        user.suspensionReason = reason || 'Account suspended by administrator';
        await user.save();

        await sendEmail({
          to: user.email,
          subject: 'Your MINTOONS account has been suspended',
          template: 'account_suspended',
          data: {
            firstName: user.name,
            reason: user.suspensionReason,
            supportUrl: `${process.env.APP_URL}/contact`,
          },
        });
        break;

      case 'delete':
        // Soft delete - mark as deleted but keep data for compliance
        user.isDeleted = true;
        user.deletedAt = new Date();
        user.email = `deleted_${user._id}@mintoons.com`;
        
        // Also soft delete user's stories
        await Story.updateMany(
          { authorId: userId },
          { 
            isDeleted: true,
            deletedAt: new Date()
          }
        );
        
        await user.save();
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Track admin action
    trackEvent(TRACKING_EVENTS.ADMIN_ACTION, {
      action: `user_${action}`,
      adminId: session.user._id,
      targetUserId: userId,
    });

    return NextResponse.json({ 
      success: true, 
      message: `User ${action} completed successfully` 
    });

  } catch (error) {
    console.error(`Error ${params.action} user:`, error);
    return NextResponse.json(
      { error: `Failed to ${params.action} user` }, 
      { status: 500 }
    );
  }
}