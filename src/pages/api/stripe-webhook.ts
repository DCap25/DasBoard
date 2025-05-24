import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { supabase } from '../../lib/supabaseClient';

// Disable body parsing, need the raw buffer for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Use the latest API version
});

// Stripe webhook secret for verifying signatures
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the raw body for signature verification
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
      // Verify the webhook signature
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error(
        `[Webhook] Signature verification failed: ${err instanceof Error ? err.message : err}`
      );
      return res.status(400).json({ error: 'Invalid signature' });
    }

    console.log(`[Webhook] Event received: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (!session.metadata?.signupRequestId) {
          console.error('[Webhook] No signup request ID in session metadata');
          break;
        }

        console.log(
          `[Webhook] Checkout session completed for signup request: ${session.metadata.signupRequestId}`
        );

        // Extract dealer group metadata if present
        const isDealerGroup = session.metadata.tier === 'dealer_group';
        const groupLevel = session.metadata.groupLevel;
        const dealershipCount = parseInt(session.metadata.dealershipCount || '1');

        console.log(`[Webhook] Subscription details:`, {
          tier: session.metadata.tier,
          isDealerGroup,
          groupLevel: isDealerGroup ? groupLevel : null,
          dealershipCount: isDealerGroup ? dealershipCount : 1,
          addOns: session.metadata.addOns,
        });

        // Update the signup request with subscription info
        const { error } = await supabase
          .from('signup_requests')
          .update({
            stripe_subscription_id: session.subscription as string,
            payment_status: 'paid',
            metadata: {
              ...session.metadata,
              subscription_id: session.subscription,
              payment_status: 'paid',
              timestamp: new Date().toISOString(),
            },
          })
          .eq('id', session.metadata.signupRequestId);

        if (error) {
          console.error('[Webhook] Error updating signup request:', error);
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;

        // Find the signup request ID from metadata
        const signupRequestId = subscription.metadata?.signupRequestId;

        if (!signupRequestId) {
          console.error('[Webhook] No signup request ID in subscription metadata');
          break;
        }

        console.log(`[Webhook] Subscription created for signup request: ${signupRequestId}`);

        // Extract dealer group metadata if present
        const isDealerGroup = subscription.metadata.tier === 'dealer_group';
        const groupLevel = subscription.metadata.groupLevel;
        const dealershipCount = parseInt(subscription.metadata.dealershipCount || '1');

        console.log(`[Webhook] Dealer group details:`, {
          isDealerGroup,
          groupLevel,
          dealershipCount,
          addOns: subscription.metadata.addOns,
        });

        // Update the signup request with subscription details
        const { error } = await supabase
          .from('signup_requests')
          .update({
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            trial_end: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
            metadata: {
              ...subscription.metadata,
              subscription_id: subscription.id,
              subscription_status: subscription.status,
              trial_end: subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
              timestamp: new Date().toISOString(),
            },
          })
          .eq('id', signupRequestId);

        if (error) {
          console.error(
            '[Webhook] Error updating signup request with subscription details:',
            error
          );
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        // Find the signup request with this subscription ID
        const { data, error } = await supabase
          .from('signup_requests')
          .select('id, metadata')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle();

        if (error || !data) {
          console.error('[Webhook] Error finding signup request for subscription update:', error);
          break;
        }

        console.log(`[Webhook] Subscription updated for signup request: ${data.id}`);

        // Update the subscription status while preserving existing metadata
        const existingMetadata = data.metadata || {};
        const { error: updateError } = await supabase
          .from('signup_requests')
          .update({
            subscription_status: subscription.status,
            trial_end: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
            metadata: {
              ...existingMetadata,
              subscription_status: subscription.status,
              trial_end: subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
              updated_at: new Date().toISOString(),
            },
          })
          .eq('id', data.id);

        if (updateError) {
          console.error(
            '[Webhook] Error updating signup request subscription status:',
            updateError
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Find the signup request with this subscription ID
        const { data, error } = await supabase
          .from('signup_requests')
          .select('id, status, metadata')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle();

        if (error || !data) {
          console.error('[Webhook] Error finding signup request for subscription deletion:', error);
          break;
        }

        console.log(`[Webhook] Subscription deleted for signup request: ${data.id}`);

        // Preserve existing metadata
        const existingMetadata = data.metadata || {};

        // Only update if not already approved
        if (data.status !== 'approved') {
          const { error: updateError } = await supabase
            .from('signup_requests')
            .update({
              subscription_status: 'canceled',
              status: 'rejected', // Auto-reject if subscription is canceled before approval
              metadata: {
                ...existingMetadata,
                subscription_status: 'canceled',
                status: 'rejected',
                canceled_at: new Date().toISOString(),
              },
            })
            .eq('id', data.id);

          if (updateError) {
            console.error('[Webhook] Error updating canceled subscription:', updateError);
          }
        } else {
          // Just update the subscription status
          const { error: updateError } = await supabase
            .from('signup_requests')
            .update({
              subscription_status: 'canceled',
              metadata: {
                ...existingMetadata,
                subscription_status: 'canceled',
                canceled_at: new Date().toISOString(),
              },
            })
            .eq('id', data.id);

          if (updateError) {
            console.error(
              '[Webhook] Error updating subscription status for approved request:',
              updateError
            );
          }
        }
        break;
      }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    res.status(500).json({
      error: 'An error occurred while processing the webhook',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
