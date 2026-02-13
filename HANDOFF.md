# Imprynt Platform - Claude Code Handoff

## Project Overview

Imprynt is a secure digital identity platform delivered via NFC accessories (rings, bracelets, fingertips). Users build a profile page with a public business layer and optional PIN-protected personal pages. The NFC accessory taps open the profile in a mobile browser. No app needed for receivers.

**Company:** Imprynt LLC (imprynt.io)
**Product:** Sygnet ring, Armilla band, Tactus fingertip (R&D)
**Domains:** imprynt.io (company), trysygnet.com (product platform)

## Tech Stack

- **Frontend + API:** Next.js 15 (App Router, TypeScript, React 19)
- **Database:** PostgreSQL 16 (Docker container)
- **Auth:** Auth.js v5 (next-auth) with credentials provider, JWT sessions
- **Reverse Proxy:** nginx with rate limiting
- **Containerization:** Docker + Docker Compose
- **Payments (not yet wired):** Stripe

## Current State

The project has a working scaffold with Docker Compose running three services (app, db, nginx). The following is functional:

### Working
- Docker Compose boots all three services
- PostgreSQL initializes with full schema (9 tables, triggers, indexes)
- User registration (POST /api/register) with bcrypt hashing
- Auto-creates profile with random slug and redirect ID on registration
- Login via Auth.js credentials provider
- JWT-based sessions (30-day expiry)
- Edge-compatible middleware protecting /dashboard/* routes
- Dashboard page showing basic profile info and analytics
- Public profile page at /[slug] rendering user data and links
- NFC redirect handler at /r/[redirectId] doing 302 to current slug
- Landing page with links to register/login
- robots.txt anti-scraping rules
- nginx rate limiting (strict on PIN endpoints)

### Not Yet Built
- Guided setup wizard (onboarding flow, 5-6 steps)
- Profile editor in dashboard (edit bio, name, title, photo, links)
- Link management CRUD (add, remove, reorder with drag-and-drop)
- Template system (5 templates with visual switching)
- Color/font customization controls
- Protected pages system (PIN creation, PIN verification, easter egg UI, visible protected link buttons)
- Photo upload handling
- vCard generation and download
- Slug rotation (user-triggered or scheduled)
- Stripe integration (checkout, webhooks, customer portal)
- Analytics charts (views over time)
- Account settings (change email/password, delete account)
- Any styling beyond basic inline styles

## File Structure

```
D:\Docker\imprynt\
├── docker-compose.yml          # 3 services: app, db, nginx
├── Dockerfile                  # Next.js container (node:20-alpine)
├── .env.local                  # Environment variables
├── package.json                # Dependencies
├── tsconfig.json
├── next.config.mjs
├── README.md
├── db/
│   └── init.sql                # Full database schema (IMPORTANT - read this first)
├── nginx/
│   └── nginx.conf              # Reverse proxy + rate limiting config
├── public/
│   └── robots.txt
└── src/
    ├── middleware.ts            # JWT check for /dashboard/* (edge-compatible)
    ├── app/
    │   ├── layout.tsx           # Root HTML layout
    │   ├── page.tsx             # Landing page
    │   ├── (auth)/
    │   │   ├── login/page.tsx   # Login form (client component)
    │   │   └── register/page.tsx # Registration form (client component)
    │   ├── dashboard/page.tsx   # User dashboard (server component)
    │   ├── [slug]/page.tsx      # Public profile page (server component)
    │   ├── r/[userId]/route.ts  # NFC redirect handler (GET, 302 redirect)
    │   └── api/
    │       ├── auth/[...nextauth]/route.ts  # Auth.js route handlers
    │       └── register/route.ts            # POST registration endpoint
    └── lib/
        ├── auth.ts              # Auth.js config (credentials provider, JWT callbacks)
        └── db.ts                # PostgreSQL connection pool
```

## Database Schema

Read `db/init.sql` for the complete schema. Key tables:

- **users** - email, password_hash, first_name, last_name, plan (free/premium_monthly/premium_annual), stripe IDs, setup_completed flag
- **profiles** - user_id, slug (random, public URL), redirect_id (static, for NFC), title, company, bio, photo_url, template, colors, font_pair, is_published
- **protected_pages** - profile_id, page_title, visibility_mode (hidden/visible), pin_hash, bio_text, button_label, display_order, is_active. Schema supports multiple per user, V1 UI only exposes one.
- **links** - belongs to either a profile OR a protected_page (constraint enforced). link_type enum, label, url, display_order, is_active
- **analytics_events** - profile_id, event_type enum, referral_source, link_id, ip_hash, user_agent
- **pin_attempts** - profile_id, ip_hash, attempted_at, success (for rate limiting: 5 failures = 15 min lockout)
- **accessories** - product_type (ring/band/tip), status (pending/programmed/shipped/delivered/returned), shipping address, tracking
- **contacts** - V2 table, included in schema now. owner_user_id, connected_user_id, contact info, notes, source, met_at
- **sessions** and **verification_tokens** - Auth.js required tables

All tables with mutable data have auto-updating `updated_at` triggers.

## Key Architecture Decisions

1. **Profile URLs are obfuscated.** Slugs are random strings (nanoid), not usernames. NFC accessories point to `/r/{redirect_id}` which 302s to the current slug. Old slugs should 404.

2. **Contact info rendered client-side.** Profile pages should NOT include contact details in raw HTML. Fetch via API call after page load to prevent scraping. The current [slug]/page.tsx is server-rendered as a starting point but links should eventually be fetched client-side for sensitive contact info.

3. **PIN system checks all active PINs.** When a visitor enters a PIN on a profile, the system checks it against all active PINs for that profile and routes to the matching page. No menu of available pages is shown. Single input field.

4. **Edge middleware is JWT-only.** Do NOT import `pg`, `bcryptjs`, or `@/lib/db` in middleware.ts. The edge runtime doesn't support Node.js crypto. Use `getToken()` from `next-auth/jwt` for auth checks in middleware.

5. **Free tier vs paid.** Free users get 1 profile, 2 templates, limited colors, "Powered by Imprynt" watermark, no protected pages, no analytics. Paid gets everything.

## Environment Variables

```
DATABASE_URL=postgresql://imprynt:imprynt_dev_password@db:5432/imprynt
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-change-in-production-replace-me-now
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Imprynt
```

## Running the Project

```bash
cd D:\Docker\imprynt
docker compose up --build
```

- App: http://localhost:3000 (direct) or http://localhost (via nginx)
- Database: localhost:5432 (user: imprynt, password: imprynt_dev_password, db: imprynt)

To reset the database: `docker compose down -v` then `docker compose up --build`

Hot reload works for src/ changes (volume mounted).

## Known Issues / Gotchas

- Inline styles everywhere. No CSS framework yet. Tailwind or CSS modules would be a natural next step.
- The `[slug]` route will catch any path not matched by other routes. If adding new top-level routes, make sure they don't collide.
- Auth.js v5 is still in beta. API surface may shift. Current config uses `next-auth@5.0.0-beta.25`.
- The `nanoid` package is ESM-only. If import issues arise, check that `next.config.mjs` and `tsconfig.json` are configured for ESM.

## Product Spec

The full MVP specification lives in the Claude project knowledge base as `sygnet-mvp-spec.md`. It covers feature details, pricing tiers, sourcing, the Tactus prototype plan, and the V2 roadmap. Reference it for product decisions.

## Architecture Decisions

### Profile Pages: Fixed Structure, NOT Block Builder

We intentionally chose a fixed profile structure over a drag-and-drop block builder. Read `docs/PROTECTED_CONTENT_STRATEGY.md` for the full rationale. Short version: Imprynt is a networking identity tool, not a website builder. The receiver looks at your profile for 30 seconds on their phone. A clean, opinionated layout with great typography beats a custom-arranged 10-section page every time.

Profile structure (all profiles, same layout, templates change styling):
1. Hero (photo, name, title, tagline, contact icon row)
2. Bio (heading + body text, up to 1000 chars)
3. Links (styled buttons, ordered list)
4. Showcase button (paid, visible, PIN-gated professional portfolio)
5. Easter egg element (paid, hidden, PIN-gated personal layer)
6. Footer (vCard download, "Powered by Imprynt" on free tier)

Block builder is a V2/V3 Pro tier feature if users demand more layout control.

### Protected Content: Two Distinct Types

**Easter Egg** = hidden personal layer. No visible UI element. User tells someone it exists and gives them the PIN. Contains personal contact info, social media, personal message.

**Showcase** = visible professional layer. A labeled button appears on the profile (user names it). PIN-gated. Contains structured portfolio items: title, description, image, link, tags, date.

Both use the existing `protected_pages` table. Showcase items get a new `showcase_items` table (see docs for schema).

### Templates = Styling Presets

Templates change visual treatment (colors, fonts, spacing, button styles), NOT layout. All profiles have the same structural sections. Switching templates never breaks content.

## What to Build Next (Priority Order)

### Already Built
- [x] Guided setup wizard (6-step onboarding, saves per step, gates dashboard)
- [x] Registration and login with Auth.js
- [x] Dashboard with basic analytics
- [x] Public profile page renderer
- [x] NFC redirect handler

### Next Up (MVP Scope - see docs/MVP_MILESTONE.md for full definition)
1. **Template themes** - Define 5 themes as TypeScript config, apply to [slug]/page.tsx rendering
2. **Profile page polish** - Hero, bio, links, footer with template styling, mobile-first
3. **Profile editor** - Dashboard page to edit all profile fields after setup
4. **Link management** - CRUD API + dashboard UI for add/edit/remove/reorder links
5. **Easter Egg** - Dashboard settings, hidden element on profile, PIN verification, personal page
6. **Showcase** - Dashboard settings, showcase_items CRUD, visible button on profile, portfolio page
7. **vCard generation** - /api/vcard/[profileId] endpoint, "Save Contact" button on profile
8. **Stripe integration** - Checkout, webhooks, plan activation/downgrade, Customer Portal link
9. **Landing page** - Hero, value props, pricing comparison, CTA
10. **Password reset + terms/privacy pages** - Final polish before launch
