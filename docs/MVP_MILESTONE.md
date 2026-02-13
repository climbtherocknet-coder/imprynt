# Imprynt MVP - Milestone 1 Definition

## The Finish Line

MVP is done when a user can:
1. Sign up at trysygnet.com
2. Build their profile through the guided setup
3. See their published profile page at a unique URL
4. Share that URL via NFC ring tap, link, or QR code
5. A receiver can view the profile, tap links, and save contact (vCard)
6. The user can edit their profile from the dashboard
7. A paid user can create an Easter Egg (hidden PIN-protected personal page)
8. A paid user can create a Showcase (visible PIN-protected project page)
9. Payment works (Stripe checkout, subscription activates features)

That's it. When those 9 things work end to end, you launch.

## What Ships in MVP (Organized by Section)

### Public Site (Landing Page Only)
- [ ] Single landing page at trysygnet.com (or imprynt.io)
  - Hero: product name, tagline, hero image/mockup
  - Value props: 3-4 short blocks explaining why Imprynt exists
  - Pricing: free vs. premium comparison
  - CTA: "Get Started" button -> registration
  - Footer: contact email, social links, legal links (terms, privacy)
- [ ] Terms of Service page (static, can be markdown rendered)
- [ ] Privacy Policy page (static)

NOT MVP: separate product page, about us page, blog, testimonials.

### Authentication
- [x] Email + password registration
- [x] Login
- [x] JWT session management
- [x] Protected routes (dashboard)
- [ ] Password reset via email
- [ ] Email verification (send verification email on signup)

NOT MVP: OAuth (Google, LinkedIn), magic links, 2FA.

### Onboarding
- [x] 6-step guided setup wizard
- [x] Step-by-step save (progress preserved)
- [x] Setup completion gate (must complete before dashboard)

NOT MVP: AI-assisted setup, LinkedIn import, profile cloning.

### Profile Page (Public, What Receivers See)
- [ ] Hero section: photo, name, title + company, tagline
- [ ] Bio section: optional heading, body text (up to 1000 chars)
- [ ] Links section: styled link buttons, ordered
- [ ] "Save Contact" vCard download button
- [ ] Showcase button (paid, visible, labeled, PIN prompt on tap)
- [ ] Easter egg element (paid, hidden, subtle, PIN prompt on tap)
- [ ] "Powered by Imprynt" watermark (free tier only)
- [ ] 5 template themes applied to rendering
- [ ] Mobile-first responsive design
- [ ] Fast loading (< 2 seconds)
- [ ] noindex/nofollow meta tags
- [ ] Contact info fetched client-side (anti-scraping)

NOT MVP: custom domains, QR code generation page, social sharing cards (OG tags are nice-to-have).

### NFC Redirect
- [x] /r/[redirectId] route does 302 to current slug
- [x] Logs NFC tap as analytics event
- [ ] Slug rotation (user can regenerate slug on demand)

NOT MVP: token-based time-limited URLs, scheduled slug rotation.

### Dashboard (User Account Area)
- [x] Basic dashboard with analytics summary
- [ ] Profile editor: edit all fields (name, title, company, tagline, bio heading, bio, photo)
- [ ] Link management: add, edit, remove, reorder links
- [ ] Template switcher: preview and select from 5 themes
- [ ] Color customization: primary color, accent color
- [ ] Font pair selection
- [ ] Easter Egg settings: create/edit easter egg page, set PIN, manage personal links
- [ ] Showcase settings: create/edit showcase page, set PIN, name the button, manage showcase items
- [ ] Account settings: change email, change password
- [ ] Subscription status display
- [ ] Manage billing (link to Stripe Customer Portal)

NOT MVP: analytics charts, link click tracking dashboard, accessory shipping status, drag-and-drop anything.

### Protected Content (Easter Egg + Showcase)
- [ ] Easter Egg page
  - User creates page with personal links, message, PIN
  - Hidden element on public profile (subtle icon/tap zone)
  - PIN entry modal on tap
  - PIN verification API (checks against all active PINs for profile)
  - Renders personal page content on success
  - Rate limiting: 5 failed attempts = 15 min lockout
- [ ] Showcase page
  - User creates page with title, description, PIN
  - User adds showcase items (title, description, link, optional image, optional tags)
  - Visible labeled button on public profile
  - PIN entry modal on tap
  - Renders showcase items as a portfolio grid/list on success
  - Same rate limiting as easter egg

NOT MVP: multiple easter eggs, multiple showcases, different PINs for different people.

### Payments (Stripe)
- [ ] Stripe Checkout integration (subscription + optional accessory one-time)
- [ ] Webhook handling: checkout.session.completed, invoice.payment_succeeded, invoice.payment_failed, customer.subscription.deleted
- [ ] Plan activation on successful payment (unlock premium features)
- [ ] Downgrade to free on subscription cancellation (disable premium features, add watermark)
- [ ] Stripe Customer Portal link in dashboard (manage billing, cancel, receipts)

NOT MVP: accessory fulfillment tracking in-app, coupon codes, bundle pricing in checkout UI.

### vCard Generation
- [ ] Generate .vcf file from user's profile data (name, title, company, email, phone, website)
- [ ] Download endpoint: GET /api/vcard/[profileId]
- [ ] "Save Contact" button on public profile triggers download

NOT MVP: vCard with photo embedded, Apple Wallet pass.

### Admin Console
- **NOT IN MVP.** Period.
- You manage everything via direct database queries or a simple SQL client (pgAdmin, DBeaver, or psql)
- Admin console is a V2 feature when you have enough users that DB queries become tedious
- If you need to check account status, run: `SELECT * FROM users WHERE email = '...'`
- If you need to see orders, run: `SELECT * FROM accessories WHERE status = 'pending'`

## What is NOT MVP (Parked for Later)

| Feature | When | Why Not Now |
|---------|------|-------------|
| Admin console | V1.5 | You ARE the admin, use the database |
| Analytics charts/graphs | V1.5 | Basic counts are enough, charts are polish |
| LinkedIn import | V2 | API is restrictive, real engineering work |
| AI-assisted onboarding | V1.5 | Manual setup works fine, AI is a convenience |
| Mobile app | V2 | Web dashboard on mobile is sufficient |
| Contact rolodex/CRM | V2 | Core V2 feature, not needed for launch |
| Custom domains | V2 | Premium add-on, requires SSL automation |
| Block-based page builder | V2/V3 | Fixed structure is better for MVP, builder is Pro tier |
| Multiple protected pages | V1.5 | One egg + one showcase is enough for launch |
| Business card scanner | V2 | Cool but not core to the identity sharing product |
| QR code generation | V1.5 | Easy add, but NFC + shareable link covers launch |
| Token-based expiring URLs | V1.5 | Nice security feature, not blocking for launch |
| Accessory shipping tracker | V1.5 | Email tracking numbers manually for first 50 orders |
| Team/Enterprise plans | V2 | Need individual product-market fit first |
| Notification system | V2 | No users to notify yet |
| Backups config UI | Never? | Use standard PostgreSQL backup tools |

## Revised Site Structure (MVP)

```
trysygnet.com (or imprynt.io)
│
├── / .......................... Landing page (hero, value props, pricing, CTA)
├── /login .................... Login
├── /register ................. Registration
├── /terms .................... Terms of Service (static)
├── /privacy .................. Privacy Policy (static)
│
├── /dashboard ................ User dashboard (gated, requires auth)
│   ├── /dashboard/setup ...... Guided setup wizard (first-time only)
│   ├── /dashboard/profile .... Profile editor (edit fields, links, template)
│   ├── /dashboard/easter-egg . Easter egg settings (PIN, personal content)
│   ├── /dashboard/showcase ... Showcase settings (PIN, items, button label)
│   └── /dashboard/account .... Account settings (email, password, billing)
│
├── /r/[redirectId] ........... NFC redirect handler (302 to slug)
├── /[slug] ................... Public profile page
│
└── /api/
    ├── /api/auth/[...nextauth]  Auth handlers
    ├── /api/register            Registration
    ├── /api/setup               Setup wizard data
    ├── /api/setup/complete      Complete setup
    ├── /api/profile             Profile CRUD
    ├── /api/links               Link CRUD
    ├── /api/protected-pages     Easter egg + Showcase CRUD
    ├── /api/showcase-items      Showcase items CRUD
    ├── /api/pin/verify          PIN verification
    ├── /api/vcard/[profileId]   vCard download
    └── /api/stripe/
        ├── /api/stripe/checkout     Create checkout session
        └── /api/stripe/webhook      Stripe webhook handler
```

## Definition of Done

MVP is shippable when:
1. A new user can register, complete setup, and have a live profile page
2. The profile page looks good on mobile with at least 3 working template themes
3. A receiver can tap an NFC ring and see the profile
4. A receiver can download a vCard
5. Easter egg works: hidden element -> PIN -> personal page
6. Showcase works: visible button -> PIN -> project portfolio
7. Stripe checkout works: user can pay, features unlock
8. Stripe cancellation works: features lock, watermark appears
9. No critical bugs, no broken auth, no data leaks

## Estimated Build Remaining

| Feature Group | Effort | Status |
|---------------|--------|--------|
| Template themes (5 themes, applied to profile page) | 1-2 days | Not started |
| Profile page polish (hero, bio, links, footer, templates) | 1-2 days | Basic version exists |
| Profile editor in dashboard | 2-3 days | Not started |
| Link management CRUD | 1-2 days | Not started |
| Easter egg system (PIN, hidden element, personal page) | 2-3 days | Not started |
| Showcase system (items CRUD, visible button, portfolio page) | 2-3 days | Not started |
| PIN verification + rate limiting | 1 day | Not started |
| vCard generation | 0.5 day | Not started |
| Stripe integration | 2-3 days | Not started |
| Landing page | 1-2 days | Basic version exists |
| Password reset | 0.5-1 day | Not started |
| Terms + Privacy pages | 0.5 day | Not started (can use generated templates) |
| **Total estimated** | **~15-22 days** | |

This assumes focused development. Could be faster with Claude Code handling the boilerplate.
