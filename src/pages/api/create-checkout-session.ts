import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabase } from '../../lib/supabaseClient';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Use the latest API version
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { signupRequestId, lineItems, customerEmail, metadata, successUrl, cancelUrl } = req.body;

    console.log('[API] Creating checkout session for signup request:', signupRequestId);
    console.log('[API] Subscription details:', {
      tier: metadata.tier,
      groupLevel: metadata.groupLevel,
      dealershipCount: metadata.dealershipCount,
      addOns: metadata.addOns,
    });

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
          groupLevel: metadata.groupLevel || null,
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
        // Store additional metadata for dealer groups
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
}
