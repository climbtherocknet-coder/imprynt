# Stripe Production Checklist

## 1. Create Webhook Endpoint
- Go to Stripe Dashboard → Developers → Webhooks
- Add endpoint: `https://imprynt.io/api/stripe/webhook`
- Select events:
  - checkout.session.completed
  - invoice.payment_succeeded
  - invoice.payment_failed
  - customer.subscription.deleted
  - customer.subscription.updated
- Copy the signing secret (whsec_...)
- Add to server: SSH to 5.78.85.128, edit /home/imprynt/.env.production
  - Set STRIPE_WEBHOOK_SECRET=whsec_...

## 2. Configure Customer Portal
- Go to Stripe Dashboard → Settings → Billing → Customer portal
- Enable: Update payment method
- Enable: Cancel subscription (at end of period)
- Enable: Switch plans (if offering monthly ↔ annual)
- Set branding (logo, colors) to match Imprynt

## 3. Go Live
- Switch from test keys to live keys in .env.production:
  - STRIPE_SECRET_KEY=sk_live_...
  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
  - Update all STRIPE_PRICE_* and STRIPE_PRODUCT_* IDs with live mode equivalents
- Create the same products/prices in live mode
- Rebuild app container (NEXT_PUBLIC vars need rebuild)

## 4. Test in Live Mode
- Make a real $5.99 purchase with your own card
- Verify webhook fires and plan updates
- Verify Customer Portal works
- Refund the test charge
