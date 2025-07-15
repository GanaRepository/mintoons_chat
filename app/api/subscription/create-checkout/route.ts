import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { stripeManager } from '@lib/subscription/stripe';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { priceId, tier, successUrl, cancelUrl } = data;

    if (!priceId || !tier) {
      return NextResponse.json(
        { error: 'Price ID and tier are required' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const checkoutUrl = await stripeManager.createCheckoutSession(
      session.user._id,
      tier,
      successUrl || `${process.env.APP_URL}/dashboard?subscription=success`,
      cancelUrl || `${process.env.APP_URL}/pricing`
    );

    // Track checkout initiation
    trackEvent(TRACKING_EVENTS.CHECKOUT_START, {
      userId: session.user._id,
      tier,
      priceId
    });

    return NextResponse.json({ checkoutUrl });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' }, 
      { status: 500 }
    );
  }
}