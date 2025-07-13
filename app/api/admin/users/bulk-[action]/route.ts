import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';

interface Params {
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

    const { userIds } = await request.json();
    const { action } = params;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'Invalid user IDs' }, { status: 400 });
    }

    let updateQuery: any = {};
    
    switch (action) {
      case 'activate':
        updateQuery = {
          isActive: true,
          suspendedAt: null,
          suspensionReason: null
        };
        break;

      case 'suspend':
        updateQuery = {
          isActive: false,
          suspendedAt: new Date(),
          suspensionReason: 'Bulk suspension by administrator'
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updateQuery
    );

    // Track admin action
    trackEvent(TRACKING_EVENTS.ADMIN_ACTION, {
      action: `bulk_${action}`,
      adminId: session.user.id,
      targetCount: userIds.length,
    });

    return NextResponse.json({ 
      success: true, 
      message: `${result.modifiedCount} users ${action}d successfully`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error(`Error bulk ${params.action}:`, error);
    return NextResponse.json(
      { error: `Failed to bulk ${params.action} users` }, 
      { status: 500 }
    );
  }
}