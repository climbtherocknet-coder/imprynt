import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { stripe, STRIPE_PRICES, STRIPE_PRODUCTS } from '@/lib/stripe';

// POST - Create a Stripe Checkout Session
export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Payments not configured' }, { status: 503 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { plan, accessory, shippingAddress } = body;
  // plan: 'monthly' | 'annual'
  // accessory: 'ring' | 'band' | null (optional one-time purchase)

  // Validate plan
  const priceId = plan === 'annual' ? STRIPE_PRICES.premiumAnnual : STRIPE_PRICES.premiumMonthly;
  if (!priceId) {
    return NextResponse.json({ error: 'Price not configured' }, { status: 500 });
  }

  // Get or create Stripe customer
  const userResult = await query(
    'SELECT email, stripe_customer_id, first_name, last_name FROM users WHERE id = $1',
    [userId]
  );
  const user = userResult.rows[0];
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  let customerId = user.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: [user.first_name, user.last_name].filter(Boolean).join(' ') || undefined,
      metadata: { userId },
    });
    customerId = customer.id;

    await query(
      'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
      [customerId, userId]
    );
  }

  // Build line items
  const lineItems: { price: string; quantity: number }[] = [
    { price: priceId, quantity: 1 },
  ];

  // Add accessory as one-time line item
  if (accessory === 'ring' && STRIPE_PRODUCTS.sygnetRing) {
    lineItems.push({ price: STRIPE_PRODUCTS.sygnetRing, quantity: 1 });
  } else if (accessory === 'band' && STRIPE_PRODUCTS.armillaBand) {
    lineItems.push({ price: STRIPE_PRODUCTS.armillaBand, quantity: 1 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Determine if we need shipping (accessory included)
  const needsShipping = !!accessory;

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: lineItems,
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/dashboard?checkout=cancelled`,
      metadata: {
        userId,
        plan: plan === 'annual' ? 'premium_annual' : 'premium_monthly',
        accessory: accessory || 'none',
      },
      subscription_data: {
        metadata: {
          userId,
        },
      },
      // Collect shipping if accessory is included
      ...(needsShipping && {
        shipping_address_collection: {
          allowed_countries: ['US'],
        },
      }),
      // Allow promo codes
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
