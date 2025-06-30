import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for server-side operations
);

// Create checkout session endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { signupRequestId, lineItems, customerEmail, metadata, successUrl, cancelUrl } = req.body;

    console.log('[API] Creating checkout session for signup request:', signupRequestId);

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      line_items: lineItems,
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        signupRequestId,
        ...metadata,
      },
      subscription_data: {
        trial_period_days: 30, // 30-day free trial
        metadata: {
          signupRequestId,
          tier: metadata.tier,
          dealershipCount: metadata.dealershipCount || 1,
          addOns: metadata.addOns,
        },
      },
    });

    console.log('[API] Checkout session created:', session.id);

    // Update the signup request with the Stripe session ID
    const { error } = await supabase
      .from('signup_requests')
      .update({
        stripe_checkout_session_id: session.id,
        // Store additional metadata
        metadata: {
          ...metadata,
          stripe_session_id: session.id,
          timestamp: new Date().toISOString(),
        },
      })
      .eq('id', signupRequestId);

    if (error) {
      console.error('[API] Error updating signup request with Stripe session ID:', error);
      // Continue anyway, don't fail the checkout process
    }

    // Return the session ID to the client
    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('[API] Error creating checkout session:', error);
    res.status(500).json({
      error: 'An error occurred while creating the checkout session',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Stripe webhook endpoint
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('[Webhook] Error verifying webhook signature:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;

      console.log('[Webhook] Checkout session completed:', session.id);

      // Update the signup request with subscription info
      const { error } = await supabase
        .from('signup_requests')
        .update({
          stripe_subscription_id: session.subscription,
          stripe_payment_status: 'paid',
          status: 'approved',
        })
        .eq('id', session.metadata.signupRequestId);

      if (error) {
        console.error('[Webhook] Error updating signup request:', error);
      }
      break;
    }

    case 'customer.subscription.created': {
      const subscription = event.data.object;

      console.log('[Webhook] Subscription created:', subscription.id);

      // Update signup request with subscription details
      const { error } = await supabase
        .from('signup_requests')
        .update({
          stripe_subscription_id: subscription.id,
          status: subscription.status,
        })
        .eq('stripe_subscription_id', subscription.id);

      if (error) {
        console.error('[Webhook] Error updating subscription:', error);
      }
      break;
    }

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 Stripe API server running on http://localhost:${port}`);
  console.log('📝 Available endpoints:');
  console.log('  POST /api/create-checkout-session');
  console.log('  POST /api/stripe-webhook');
  console.log('  GET  /api/health');
});
