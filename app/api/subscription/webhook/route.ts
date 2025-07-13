import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripeManager } from '@lib/subscription/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Handle Stripe webhook
    await stripeManager.handleWebhook(body, signature);

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' }, 
      { status: 400 }
    );
  }
}