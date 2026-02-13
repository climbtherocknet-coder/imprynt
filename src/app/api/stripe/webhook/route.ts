import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { stripe, getPlanFromPriceId } from '@/lib/stripe';
import Stripe from 'stripe';

// Disable body parsing, we need the raw body for webhook signature verification
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Payments not configured' }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  // Get raw body and signature
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      default:
        // Unhandled event type, that's fine
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err);
    // Return 200 anyway to prevent Stripe from retrying
    // Log the error for investigation
  }

  return NextResponse.json({ received: true });
}

// ── Event Handlers ─────────────────────────────────────

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan;
  const accessory = session.metadata?.accessory;

  if (!userId || !plan) {
    console.error('Checkout session missing userId or plan metadata');
    return;
  }

  // Activate premium plan
  await query(
    `UPDATE users SET
       plan = $1,
       stripe_subscription_id = $2
     WHERE id = $3`,
    [plan, session.subscription as string, userId]
  );

  console.log(`Activated ${plan} for user ${userId}`);

  // If accessory was purchased, create fulfillment record
  if (accessory && accessory !== 'none') {
    const profileResult = await query(
      'SELECT id, redirect_id FROM profiles WHERE user_id = $1',
      [userId]
    );
    const profile = profileResult.rows[0];

    // Get shipping address from session
    const shipping = session.shipping_details;

    const productType = accessory === 'ring' ? 'ring' : 'band';

    await query(
      `INSERT INTO accessories (user_id, product_type, status, shipping_name, shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_zip, shipping_country, programmed_url)
       VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        userId,
        productType,
        shipping?.name || null,
        shipping?.address?.line1 || null,
        shipping?.address?.line2 || null,
        shipping?.address?.city || null,
        shipping?.address?.state || null,
        shipping?.address?.postal_code || null,
        shipping?.address?.country || 'US',
        profile ? `https://trysygnet.com/r/${profile.redirect_id}` : null,
      ]
    );

    console.log(`Created ${productType} fulfillment order for user ${userId}`);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Subscription renewal succeeded, keep plan active
  const customerId = invoice.customer as string;
  if (!customerId) return;

  const userResult = await query(
    'SELECT id FROM users WHERE stripe_customer_id = $1',
    [customerId]
  );
  const user = userResult.rows[0];
  if (!user) return;

  // Get the current subscription to determine plan
  const subscriptionId = invoice.subscription as string;
  if (subscriptionId && stripe) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = sub.items.data[0]?.price?.id;
    if (priceId) {
      const plan = getPlanFromPriceId(priceId);
      await query(
        'UPDATE users SET plan = $1 WHERE id = $2',
        [plan, user.id]
      );
    }
  }

  console.log(`Payment succeeded for user ${user.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Payment failed, don't downgrade immediately (Stripe will retry)
  // Just log for now, Stripe handles retry logic
  const customerId = invoice.customer as string;
  if (!customerId) return;

  const userResult = await query(
    'SELECT id, email FROM users WHERE stripe_customer_id = $1',
    [customerId]
  );
  const user = userResult.rows[0];
  if (!user) return;

  console.warn(`Payment failed for user ${user.id} (${user.email}). Stripe will retry.`);

  // TODO V1.5: Send email notification to user about failed payment
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  // Subscription cancelled or expired, downgrade to free
  const userId = subscription.metadata?.userId;

  if (userId) {
    await query(
      `UPDATE users SET plan = 'free', stripe_subscription_id = NULL WHERE id = $1`,
      [userId]
    );
    console.log(`Downgraded user ${userId} to free (subscription cancelled)`);
  } else {
    // Fallback: look up by customer ID
    const customerId = subscription.customer as string;
    if (customerId) {
      await query(
        `UPDATE users SET plan = 'free', stripe_subscription_id = NULL WHERE stripe_customer_id = $1`,
        [customerId]
      );
      console.log(`Downgraded customer ${customerId} to free (subscription cancelled)`);
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Plan change (monthly <-> annual)
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const priceId = subscription.items.data[0]?.price?.id;
  if (!priceId) return;

  const plan = getPlanFromPriceId(priceId);

  await query(
    `UPDATE users SET plan = $1, stripe_subscription_id = $2 WHERE id = $3`,
    [plan, subscription.id, userId]
  );

  console.log(`Updated user ${userId} to plan ${plan}`);
}
