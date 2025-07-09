// lib/subscription/stripe.ts - Stripe integration for subscriptions
import Stripe from 'stripe';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import Subscription from '@models/Subscription';
import { SUBSCRIPTION_TIERS } from '@config/subscription';
import { sendEmail } from '@lib/email/sender';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export class StripeManager {
  /**
   * Create or retrieve Stripe customer
   */
  async createOrGetCustomer(userId: string): Promise<string> {
    try {
      await connectDB();

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Return existing customer ID if available
      if (user.stripeCustomerId) {
        return user.stripeCustomerId;
      }

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: {
          userId: user._id.toString(),
          age: user.age.toString(),
          role: user.role,
        },
      });

      // Save customer ID to user
      user.stripeCustomerId = customer.id;
      await user.save();

      return customer.id;
    } catch (error) {
      console.error('Error creating/getting Stripe customer:', error);
      throw error;
    }
  }

  /**
   * Create checkout session for subscription
   */
  async createCheckoutSession(
    userId: string,
    tierId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    try {
      const tier = SUBSCRIPTION_TIERS[tierId.toUpperCase()];
      if (!tier || !tier.stripePriceId) {
        throw new Error('Invalid subscription tier');
      }

      const customerId = await this.createOrGetCustomer(userId);

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: tier.stripePriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        metadata: {
          userId,
          tierId: tier.id,
        },
        subscription_data: {
          metadata: {
            userId,
            tierId: tier.id,
          },
        },
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Handle successful checkout
   */
  async handleCheckoutSuccess(sessionId: string): Promise<void> {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription'],
      });

      if (!session.subscription) {
        throw new Error('No subscription found in session');
      }

      const subscription = session.subscription as Stripe.Subscription;
      const userId = session.metadata?.userId;
      const tierId = session.metadata?.tierId;

      if (!userId || !tierId) {
        throw new Error('Missing metadata in checkout session');
      }

      await connectDB();

      // Update or create subscription record
      await Subscription.findOneAndUpdate(
        { userId },
        {
          tier: tierId.toUpperCase(),
          status: subscription.status,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
        { upsert: true, new: true }
      );

      // Update user's subscription tier
      await User.findByIdAndUpdate(userId, {
        subscriptionTier: tierId.toUpperCase(),
        subscriptionStatus: subscription.status,
        subscriptionId: subscription.id,
      });

      // Send welcome email
      const user = await User.findById(userId);
      if (user) {
        await sendEmail({
          to: user.email,
          subject: 'Welcome to MINTOONS Premium!',
          template: 'subscription_welcome',
          data: {
            firstName: user.firstName,
            tier: tierId,
            features: SUBSCRIPTION_TIERS[tierId.toUpperCase()].features,
          },
        });
      }

      console.log(
        `Subscription created successfully for user ${userId}, tier: ${tierId}`
      );
    } catch (error) {
      console.error('Error handling checkout success:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    userId: string,
    immediate: boolean = false
  ): Promise<void> {
    try {
      await connectDB();

      const subscription = await Subscription.findOne({ userId });
      if (!subscription || !subscription.stripeSubscriptionId) {
        throw new Error('No active subscription found');
      }

      if (immediate) {
        // Cancel immediately
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

        subscription.status = 'canceled';
        subscription.canceledAt = new Date();

        // Downgrade to free tier
        await User.findByIdAndUpdate(userId, {
          subscriptionTier: 'FREE',
          subscriptionStatus: 'canceled',
        });
      } else {
        // Cancel at period end
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });

        subscription.cancelAtPeriodEnd = true;
        subscription.canceledAt = new Date();
      }

      await subscription.save();

      // Send cancellation email
      const user = await User.findById(userId);
      if (user) {
        await sendEmail({
          to: user.email,
          subject: 'Subscription Cancellation Confirmed',
          template: 'subscription_canceled',
          data: {
            firstName: user.firstName,
            immediate,
            periodEnd: subscription.currentPeriodEnd,
          },
        });
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Reactivate canceled subscription
   */
  async reactivateSubscription(userId: string): Promise<void> {
    try {
      await connectDB();

      const subscription = await Subscription.findOne({ userId });
      if (!subscription || !subscription.stripeSubscriptionId) {
        throw new Error('No subscription found');
      }

      // Update Stripe subscription
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });

      // Update local subscription
      subscription.cancelAtPeriodEnd = false;
      subscription.canceledAt = undefined;
      subscription.status = 'active';
      await subscription.save();

      // Update user status
      await User.findByIdAndUpdate(userId, {
        subscriptionStatus: 'active',
      });
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  /**
   * Handle Stripe webhooks
   */
  async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(
            event.data.object as Stripe.Invoice
          );
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription
          );
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription
          );
          break;

        default:
          console.log(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.subscription) return;

    await connectDB();

    const subscription = await Subscription.findOne({
      stripeSubscriptionId: invoice.subscription,
    }).populate('userId');

    if (subscription && subscription.userId) {
      // Reset usage for new billing period
      await subscription.resetUsage();

      // Send payment confirmation email
      const user = subscription.userId as any;
      await sendEmail({
        to: user.email,
        subject: 'Payment Successful - MINTOONS',
        template: 'payment_success',
        data: {
          firstName: user.firstName,
          amount: (invoice.amount_paid / 100).toFixed(2),
          tier: subscription.tier,
          nextBillingDate: subscription.currentPeriodEnd,
        },
      });
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.subscription) return;

    await connectDB();

    const subscription = await Subscription.findOne({
      stripeSubscriptionId: invoice.subscription,
    }).populate('userId');

    if (subscription && subscription.userId) {
      // Update subscription status
      subscription.status = 'past_due';
      await subscription.save();

      // Update user status
      await User.findByIdAndUpdate(subscription.userId, {
        subscriptionStatus: 'past_due',
      });

      // Send payment failed email
      const user = subscription.userId as any;
      await sendEmail({
        to: user.email,
        subject: 'Payment Failed - MINTOONS',
        template: 'payment_failed',
        data: {
          firstName: user.firstName,
          amount: (invoice.amount_due / 100).toFixed(2),
          retryDate: new Date(invoice.next_payment_attempt! * 1000),
        },
      });
    }
  }

  private async handleSubscriptionUpdated(
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    await connectDB();

    const subscription = await Subscription.findOne({
      stripeSubscriptionId: stripeSubscription.id,
    });

    if (subscription) {
      subscription.status = stripeSubscription.status;
      subscription.currentPeriodStart = new Date(
        stripeSubscription.current_period_start * 1000
      );
      subscription.currentPeriodEnd = new Date(
        stripeSubscription.current_period_end * 1000
      );
      subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;

      await subscription.save();

      // Update user status
      await User.findByIdAndUpdate(subscription.userId, {
        subscriptionStatus: stripeSubscription.status,
      });
    }
  }

  private async handleSubscriptionDeleted(
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    await connectDB();

    const subscription = await Subscription.findOne({
      stripeSubscriptionId: stripeSubscription.id,
    });

    if (subscription) {
      subscription.status = 'canceled';
      subscription.canceledAt = new Date();
      await subscription.save();

      // Downgrade user to free tier
      await User.findByIdAndUpdate(subscription.userId, {
        subscriptionTier: 'FREE',
        subscriptionStatus: 'canceled',
      });

      // Send subscription ended email
      const user = await User.findById(subscription.userId);
      if (user) {
        await sendEmail({
          to: user.email,
          subject: 'Subscription Ended - MINTOONS',
          template: 'subscription_ended',
          data: {
            firstName: user.firstName,
            endDate: new Date(),
            renewUrl: `${process.env.APP_URL}/pricing`,
          },
        });
      }
    }
  }

  /**
   * Get subscription usage and limits
   */
  async getSubscriptionUsage(userId: string): Promise<{
    tier: string;
    storiesUsed: number;
    storyLimit: number;
    usagePercentage: number;
    canCreateStory: boolean;
    daysUntilReset: number;
  }> {
    try {
      await connectDB();

      const subscription = await Subscription.findOne({ userId });
      if (!subscription) {
        throw new Error('No subscription found');
      }

      const tier = SUBSCRIPTION_TIERS[subscription.tier];
      const usagePercentage = Math.round(
        (subscription.storiesUsed / tier.storyLimit) * 100
      );
      const daysUntilReset = Math.ceil(
        (subscription.currentPeriodEnd.getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      );

      return {
        tier: subscription.tier,
        storiesUsed: subscription.storiesUsed,
        storyLimit: tier.storyLimit,
        usagePercentage,
        canCreateStory: subscription.canCreateStory,
        daysUntilReset,
      };
    } catch (error) {
      console.error('Error getting subscription usage:', error);
      throw error;
    }
  }

  /**
   * Update subscription usage when story is created
   */
  async incrementStoryUsage(userId: string): Promise<void> {
    try {
      await connectDB();

      const subscription = await Subscription.findOne({ userId });
      if (!subscription) {
        throw new Error('No subscription found');
      }

      subscription.storiesUsed += 1;
      await subscription.save();

      // Check if approaching limit and send notification
      const tier = SUBSCRIPTION_TIERS[subscription.tier];
      const usagePercentage =
        (subscription.storiesUsed / tier.storyLimit) * 100;

      if (usagePercentage >= 80 && usagePercentage < 85) {
        // Send 80% usage warning
        const user = await User.findById(userId);
        if (user) {
          await sendEmail({
            to: user.email,
            subject: 'Story Limit Warning - MINTOONS',
            template: 'usage_warning',
            data: {
              firstName: user.firstName,
              storiesUsed: subscription.storiesUsed,
              storyLimit: tier.storyLimit,
              remaining: tier.storyLimit - subscription.storiesUsed,
              upgradeUrl: `${process.env.APP_URL}/pricing`,
            },
          });
        }
      } else if (usagePercentage >= 100) {
        // Send limit reached notification
        const user = await User.findById(userId);
        if (user) {
          await sendEmail({
            to: user.email,
            subject: 'Story Limit Reached - MINTOONS',
            template: 'limit_reached',
            data: {
              firstName: user.firstName,
              tier: subscription.tier,
              resetDate: subscription.currentPeriodEnd,
              upgradeUrl: `${process.env.APP_URL}/pricing`,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error incrementing story usage:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const stripeManager = new StripeManager();
