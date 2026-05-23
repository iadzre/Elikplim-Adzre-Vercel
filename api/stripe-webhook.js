import Stripe from 'stripe';
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !process.env.STRIPE_SECRET_KEY) {
    return res.status(500).send('Stripe not configured');
  }

  let event;
  try {
    const rawBody = await readRawBody(req);
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('stripe-webhook signature', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const admin = getSupabaseAdmin();

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const paymentIntent =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id;

      await admin.rpc('complete_resource_purchase', {
        p_purchase_id: session.metadata?.purchase_id ?? null,
        p_transaction_id: paymentIntent ?? session.id,
        p_stripe_session_id: session.id,
      });
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      await admin.rpc('fail_resource_purchase', {
        p_stripe_session_id: session.id,
        p_reason: 'session_expired',
      });
    }
  } catch (err) {
    console.error('stripe-webhook handler', err);
    return res.status(500).send('Webhook handler failed');
  }

  return res.status(200).json({ received: true });
}
