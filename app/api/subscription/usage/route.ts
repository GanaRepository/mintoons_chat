import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { stripeManager } from '@lib/subscription/stripe';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get subscription usage
    const usage = await stripeManager.getSubscriptionUsage(session.user._id);

    return NextResponse.json({ usage });

  } catch (error) {
    console.error('Error fetching subscription usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage' }, 
      { status: 500 }
    );
  }
}