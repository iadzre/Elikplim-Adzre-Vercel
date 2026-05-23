import Stripe from 'stripe';
import { getSupabaseAdmin, getSupabaseUserClient } from './_lib/supabaseAdmin.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe is not configured' });
  }

  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabaseUser = getSupabaseUserClient(token);
    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const { purchaseId, resourceSlug } = req.body ?? {};
    if (!purchaseId) {
      return res.status(400).json({ error: 'purchaseId is required' });
    }

    const admin = getSupabaseAdmin();
    const { data: purchase, error: purchaseError } = await admin
      .from('purchases')
      .select('id, user_id, resource_id, amount_paid, currency, payment_status, resources(slug, title, pricing_type)')
      .eq('id', purchaseId)
      .maybeSingle();

    if (purchaseError || !purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    if (purchase.user_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (purchase.payment_status === 'completed') {
      return res.status(400).json({ error: 'Already purchased' });
    }
    if (purchase.resources?.pricing_type === 'free') {
      return res.status(400).json({ error: 'Resource is free' });
    }

    const origin =
      process.env.VITE_SITE_URL ||
      process.env.VERCEL_URL?.startsWith('http')
        ? process.env.VERCEL_URL
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:5173';

    const slug = resourceSlug || purchase.resources?.slug || '';
    const successUrl = `${origin}/resources?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/resources/${slug}?checkout=cancelled`;

    const amountCents = Math.round(Number(purchase.amount_paid) * 100);
    if (amountCents < 50) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: (purchase.currency || 'usd').toLowerCase(),
            unit_amount: amountCents,
            product_data: {
              name: purchase.resources?.title ?? 'Digital resource',
            },
          },
        },
      ],
      metadata: {
        purchase_id: purchase.id,
        resource_id: purchase.resource_id,
        user_id: user.id,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    const { error: attachError } = await admin
      .from('purchases')
      .update({
        stripe_session_id: session.id,
        metadata: { stripe_session_id: session.id },
      })
      .eq('id', purchase.id)
      .eq('payment_status', 'pending');

    if (attachError) {
      return res.status(500).json({ error: attachError.message });
    }

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('create-checkout-session', err);
    return res.status(500).json({ error: err.message || 'Checkout failed' });
  }
}
