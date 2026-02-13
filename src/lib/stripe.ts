import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not set. Stripe functionality will be disabled.');
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
      typescript: true,
    })
  : null;

// Product/Price IDs - set these after creating products in Stripe Dashboard
// For now, use env vars so they're configurable without code changes
export const STRIPE_PRICES = {
  premiumMonthly: process.env.STRIPE_PRICE_MONTHLY || '',
  premiumAnnual: process.env.STRIPE_PRICE_ANNUAL || '',
};

export const STRIPE_PRODUCTS = {
  sygnetRing: process.env.STRIPE_PRODUCT_RING || '',
  armillaBand: process.env.STRIPE_PRODUCT_BAND || '',
};

// Map Stripe price IDs to internal plan names
export function getPlanFromPriceId(priceId: string): string {
  if (priceId === STRIPE_PRICES.premiumMonthly) return 'premium_monthly';
  if (priceId === STRIPE_PRICES.premiumAnnual) return 'premium_annual';
  return 'free';
}
