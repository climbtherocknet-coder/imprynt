# Imprynt Platform — Claude Code Handoff

## Project Location
`D:\Docker\imprynt`

## What This Is
Imprynt is a secure digital identity platform delivered via NFC accessories (rings, bands). Users build a profile page with two tiers: a public business layer and PIN-protected personal layers. The NFC accessory taps open the profile in a phone browser. No app needed for the receiver.

## Full Spec
Read `sygnet-mvp-spec.md` in the project root (copied from the Claude Project knowledge file). It contains the complete MVP specification including features, pricing, sourcing, technical architecture, and product roadmap.

## Tech Stack
- **Framework:** Next.js 15 (App Router, server + client components)
- **Database:** PostgreSQL 16 (Docker container)
- **Auth:** Auth.js (NextAuth v5 beta), JWT sessions, credentials provider
- **Payments:** Stripe (checkout sessions, webhooks, customer portal)
- **Containerization:** Docker Compose (app, db, nginx)
- **Styling:** Inline styles (no CSS framework, no Tailwind)

## Running the Project
```bash
cd D:\Docker\imprynt
docker compose up --build
```
App runs on http://localhost:3000 (nginx on port 80 proxies to it)

## Database
- Schema: `db/init.sql` (full schema, run on fresh DB)
- Migrations: `db/migrations/` (incremental changes for existing DBs)
- Connection: `postgresql://imprynt:imprynt_dev_password@db:5432/imprynt`
- To connect directly: `docker exec -it imprynt-db psql -U imprynt`

## File Structure
```
src/
  app/
    page.tsx                          # Landing page
    layout.tsx                        # Root layout
    (auth)/
      login/page.tsx                  # Login form
      register/page.tsx               # Registration form
      forgot-password/page.tsx        # Request password reset
      reset-password/page.tsx         # Set new password (token-based)
    [slug]/
      page.tsx                        # Public profile (server component)
      ProfileClient.tsx               # Interactive profile elements (PIN modal, easter egg, showcase viewer)
    r/
      [redirectId]/route.ts           # NFC redirect handler (302 to current slug)
    dashboard/
      page.tsx                        # Main dashboard (stats, nav cards)
      SignOutButton.tsx               # Client component for sign out
      profile/
        page.tsx                      # Profile editor wrapper
        ProfileEditor.tsx             # Full profile editor (identity, bio, links, appearance)
      easter-egg/
        page.tsx                      # Easter egg editor wrapper
        EasterEggEditor.tsx           # Easter egg settings + personal links
      showcase/
        page.tsx                      # Showcase editor wrapper
        ShowcaseEditor.tsx            # Showcase settings + portfolio items
      account/
        page.tsx                      # Account settings wrapper
        AccountClient.tsx             # Plan display, upgrade, billing portal, orders
    terms/page.tsx                    # Terms of service
    privacy/page.tsx                  # Privacy policy
    api/
      register/route.ts              # User registration
      setup/route.ts                 # Guided setup completion
      profile/route.ts               # Profile CRUD (GET/PUT)
      links/route.ts                 # Profile links CRUD
      protected-pages/
        route.ts                     # Protected pages CRUD
        [pageId]/route.ts            # Fetch protected page content (public, post-PIN)
        links/route.ts               # Protected page links CRUD
      showcase-items/route.ts        # Showcase items CRUD
      pin/route.ts                   # PIN verification (public, rate-limited)
      vcard/[profileId]/route.ts     # vCard generation + download
      stripe/
        checkout/route.ts            # Create Stripe Checkout session
        webhook/route.ts             # Stripe webhook handler
        portal/route.ts              # Stripe Customer Portal session
      auth/
        [...nextauth]/route.ts       # Auth.js route handler
        reset-password/
          route.ts                   # Request password reset token
          confirm/route.ts           # Confirm password reset
        signout/route.ts             # Sign out (unused, using Auth.js signOut)
  lib/
    auth.ts                          # Auth.js config (credentials provider, JWT)
    db.ts                            # PostgreSQL connection pool
    stripe.ts                        # Stripe client + price/product ID helpers
    themes.ts                        # 5 themes (clean, dark, bold, classic, warm) + helpers
```

## What's Built (all 10 MVP milestones complete)
1. ✅ Template themes (5 themes with color/font customization)
2. ✅ Profile page (server-rendered, themed, mobile-first)
3. ✅ Profile editor (identity, bio, links, appearance)
4. ✅ Link management (CRUD, drag-and-drop reorder, 14 link types)
5. ✅ Easter Egg system (hidden PIN-protected personal page)
6. ✅ Showcase system (visible PIN-protected portfolio page with items)
7. ✅ vCard generation (VCF 3.0 download from profile data)
8. ✅ Stripe integration (checkout, webhooks, customer portal)
9. ✅ Landing page (hero, how it works, two-tier explainer, products, pricing, CTA)
10. ✅ Password reset + Terms + Privacy + Sign out

## What Needs Work (known gaps, not bugs)

### Must-fix before launch
- **Stripe configuration:** Keys not set in `.env.local`. Need to create Stripe account, products, prices, and fill in env vars. The code is written and correct, just needs real keys.
- **Profile photo upload:** No image upload infrastructure. Needs file upload API + storage (local filesystem for V1). Profile editor has a photo_url field but no way to upload.
- **Email sending:** Password reset logs the reset URL to console. Needs an email service (Resend, SendGrid, or SES) wired up before launch.
- **DB rebuild needed:** If schema has changed since last `docker compose up`, need to `docker compose down -v && docker compose up --build` to rebuild with latest `init.sql`. The `password_resets` table was added recently.

### Nice-to-have polish
- Dashboard "Signa" (view count) doesn't actually track yet — analytics_events table exists but no page view logging is wired up
- Image upload for showcase items (currently just a URL field)
- Account deletion (button exists, shows alert placeholder)
- Email/password change from account settings
- Guided setup wizard exists but may need testing/polish
- 404 page for invalid profile slugs (currently uses Next.js default)

## Key Design Decisions
- **Inline styles everywhere:** No CSS framework. Every component uses React inline styles. This was intentional for V1 speed — don't introduce Tailwind or CSS modules.
- **Server + client component split:** Profile pages are server-rendered for speed. Interactive elements (PIN modal, easter egg tap zone, showcase viewer) are in ProfileClient.tsx as a client component.
- **PIN system:** Single input field, system checks against ALL active PINs for a profile, routes to the matching page. bcrypt hashed. 5 failed attempts = 15 min lockout. IP hashed with SHA-256 (never stored raw).
- **Protected pages:** Two modes — "hidden" (easter egg, no visible UI element) and "visible" (showcase, labeled button on profile). Both use the same PIN verification flow.
- **URL obfuscation:** Profiles use random slugs. NFC accessories point to `/r/{redirectId}` which 302 redirects to the current slug.

## Env Vars Needed
```env
# Database
DATABASE_URL=postgresql://imprynt:imprynt_dev_password@db:5432/imprynt

# Auth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-change-in-production-replace-me-now

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...
STRIPE_PRODUCT_RING=price_...
STRIPE_PRODUCT_BAND=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Imprynt
```

## Stripe Setup Steps
1. Create Stripe account at stripe.com
2. In Dashboard > Products, create:
   - "Premium Monthly" — recurring, $5.99/month → copy price ID to STRIPE_PRICE_MONTHLY
   - "Premium Annual" — recurring, $49.99/year → copy price ID to STRIPE_PRICE_ANNUAL  
   - "Sygnet Ring" — one-time, $39 → copy price ID to STRIPE_PRODUCT_RING
   - "Armilla Band" — one-time, $29 → copy price ID to STRIPE_PRODUCT_BAND
3. Copy API keys to env vars
4. Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Events to listen for: checkout.session.completed, invoice.payment_succeeded, invoice.payment_failed, customer.subscription.deleted, customer.subscription.updated
5. Copy webhook signing secret to STRIPE_WEBHOOK_SECRET

## Testing Quick Start
1. `docker compose down -v && docker compose up --build`
2. Go to http://localhost:3000, register an account
3. Complete guided setup
4. View your profile at the slug shown in dashboard
5. To test premium features, manually set plan: `docker exec -it imprynt-db psql -U imprynt -c "UPDATE users SET plan = 'premium_monthly' WHERE email = 'your@email.com'"`
6. Easter egg + showcase editors will now be unlocked
