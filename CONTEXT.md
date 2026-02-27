# Imprynt Platform — Session Context

**Purpose:** This file is the shared memory between Claude sessions. After each work session or push, update the relevant sections so context is never lost if a conversation resets.

**Last updated:** February 26, 2026
**Updated by:** Claude (session 6 — FAQ/trust page)

---

## Current State Summary

The Imprynt platform is a fully functional Next.js 15 app with a dark navy + warm gold design system. All 10 original MVP milestones are complete. The project has moved well past MVP into polish, admin tooling, and onboarding refinement.

### What's Built and Working
- **Auth:** Registration, login, JWT sessions, password reset, email verification (resend-verification + verify-email endpoints, VerificationBanner component, migration 021)
- **Password Validation:** `@/lib/password-validation` with PasswordStrengthMeter component, used in AccountClient, AdminClient, AdminUsersTab
- **Profiles:** Full public profile page with 10 templates, color customization, mobile-first responsive
- **Custom Theme Builder:** Full custom theme with 13 color variables (bg, bgAlt, surface, surface2, text, textMid, textMuted, accent, accentSoft, accentBorder, accentHover, border, borderHover) plus layout modifiers (photoShape, linkStyle, buttonStyle, radiusBase). Template selector includes 'custom' option.
- **Page Editor:** Three-tab editor (Profile, Personal/Impression, Portfolio) at `/dashboard/page-editor`
  - ProfileTab: identity, bio, links (with icon-only mode + label mode toggle, size/shape controls, per-link colors), contact card, visuals (photo shape/size/position/animation/align/zoom, cover photo, background image), pods, template + custom theme
  - PersonalTab: hidden PIN-gated personal layer (Impression/Easter Egg) with separate photo support (profile vs custom toggle), cover/bg image, pods
  - PortfolioTab: visible PIN-gated portfolio/showcase layer with same customization
- **Editor Components:** Reusable sections extracted into `src/components/editor/`
- **Pods System:** Content blocks (text, text_image, stats, listing, music, event, link_preview, project, cta) with PodEditor modal
- **Event Pods:** Full renderer with date/time display, venue, address (Google Maps link), status badges (cancelled/postponed/sold out/happening now/ended), countdown timer, CTA button, markdown body. Timezone-aware (stores creator's timezone). Auto-hide after event ends.
- **Link Preview Pods:** Auto-fetch OG metadata with manual Fetch button, editable title/body/image, image upload/replace/remove, manual fallback when auto-fetch fails
- **Listing Pods:** Real estate listings with price, beds/baths/sqft, status (active/pending/sold/open house), source domain, auto-revert open house status
- **Music Pods:** Album art, artist, audio player, link
- **Protected Pages:** PIN verification, rate limiting (5 attempts = 15 min lockout), bcrypt hashed PINs
- **Templates:** 10 templates (Clean, Warm, Classic, Soft, Midnight, Editorial, Noir, Signal, Studio, Dusk), 4 free + 6 premium. Accent contrast auto-computed for button readability on light accents (Noir, Midnight).
- **Link Display:** Labels mode (default) and Icons-only mode. Size (small/medium/large), shape (pills/stacked/full-width-pills), per-link button colors.
- **Photo Lightbox:** ExpandablePhoto component with themed modal card showing full name, title/company, and Save Contact button. Backdrop blur overlay, CSS variable theming.
- **Stripe:** Checkout sessions, webhooks, customer portal, trial support
- **Landing Page:** Full redesign with hero, value props, pricing, CTA
- **Legal Pages:** Terms, Privacy (redesigned)
- **Branded Error Pages:** `/app/not-found.tsx` and `/app/error.tsx` with Imprynt branding
- **Account Management:** Password change, account deletion (`/api/account/delete`), contact fields
- **Admin/Command Center:** Consolidated tabbed admin at `/dashboard/admin` with:
  - Admin tabs (admin-only): Users, Codes, Waitlist, Feedback, Traffic
  - CC tabs: Overview, Features, Roadmap, Changelog, Docs, Schema
  - RBAC: advisory users see Features + Roadmap only, admins see all
- **Admin User Management:** Full CRUD: suspend/reactivate/delete/plan change/reset-password/unlock (`/api/admin/users/[userId]/*`). Account status model (active/suspended).
- **Command Center API:** Full CRUD at `/api/admin/cc/` for features, roadmap, changelog, docs, overview
- **On Air Toggle:** `DashboardOnAir.tsx` component, `is_published` on profiles table. Offline profiles show branded offline page.
- **QR Code:** Generation API (`/api/profile/qr` and `/api/profile/[profileId]/qr`), PNG/SVG formats. Toggle on public profile (`show_qr_button`). Themed modal overlay (CSS variable-based). Always-on for free tier profiles, opt-in toggle for paid users. Floating buttons stacked in bottom-right corner.
- **Status Tags:** Customizable status badges with color picker (migration 018)
- **Impression Page Photo:** Separate photo for protected pages (migration 022), toggle between profile photo and custom photo
- **Site-Wide Theme Infrastructure:** ThemeProvider + ThemeToggle components, `data-theme` attribute on documentElement, system/light/dark preference stored in localStorage. CSS palettes for light mode NOT yet built in stylesheets.
- **Link Click Tracking:** `LinkTracker.tsx` component on public profiles, fires beacon to `/api/analytics/link-click`
- **Analytics Dashboard:** `/dashboard/analytics` with total views, unique visitors, views today/week/month, views by day chart, top links by clicks, event breakdown (page_view/link_click/vcard_download/pin_success/pin_attempt/nfc_tap), scoring
- **Additional Features:** Waitlist modal, feedback button, announcement banner, breadcrumbs, verification banner, demo profiles system, gallery/stock photo picker, vCard download with optional PIN protection

### What's In Progress
- **Editor Polish** (CC status: in_progress) — ongoing refinements to the page editor UX
- **Onboarding Wizard v3 Refactor** — plan written to extract ProfileTab sections into reusable components shared by ProfileTab and SetupWizard

### Known Issues (Verified Feb 26 — full audit via AUDIT_RESULTS.md)
- ~~**PodEditor datetime double-conversion**~~ — fixed in Session 4
- **Email service not wired up** — password reset and verification emails log to console, no mail provider configured
- **Stripe keys not configured** — code is written, needs real account
- **No FAQ/trust page** — no public-facing FAQ explaining how the platform works
- ~~**Free tier CTA is just a small watermark**~~ — replaced with "Create your free Imprynt profile" CTA in Session 5
- **Site-wide light mode CSS not built** — ThemeProvider/ThemeToggle infrastructure exists but stylesheets only have dark palette
- **No multiple protected pages UI** — database supports it, V1 exposes one Impression + one Portfolio

### Corrected: These ARE done (previously listed as not done)
- ✅ Slug rotation — API at `/api/profile/rotate-slug/`, UI in `MyUrlsCard.tsx`
- ✅ Link click tracking — full pipeline: `LinkTracker.tsx`, `/api/analytics/link-click`, analytics display
- ✅ Icon-only link mode — `'icons'` display mode in `link_display` column, UI in `LinksSection.tsx`
- ✅ Resume/document upload — `resume_url` + `show_resume` on protected_pages, upload via `/api/upload/file/`
- ✅ Status badge color customization — migration 018, `StatusTagPicker.tsx`
- ✅ Impression page separate photo — migration 022, `photo_url` on protected_pages
- ✅ Password strength — 10 char min, uppercase/lowercase/digit/special, strength meter
- ✅ Setup wizard v3 — shipped Feb 25 per CC changelog (v0.9.5). `SetupWizard.tsx` is the active file.

---

## Architecture Quick Reference

### Tech Stack
- Next.js 15 (App Router, TypeScript, React 19)
- PostgreSQL 16 (Docker)
- Auth.js v5 (JWT sessions, credentials provider)
- Stripe (payments)
- nginx (reverse proxy, rate limiting)
- Docker Compose (app, db, nginx services)
- Inline styles + CSS files (no Tailwind, no CSS framework)

### Key Directories
```
src/
  app/
    (auth)/          — Login, register, forgot/reset password
    [slug]/          — Public profile page + ProfileClient.tsx
    dashboard/
      admin/         — Admin + Command Center (consolidated)
      page-editor/   — Three-tab profile editor (Profile, Personal, Portfolio)
      setup/         — Onboarding wizard
      account/       — Account settings
      analytics/     — Analytics page
      impression/    — Impression (Easter Egg) standalone page
      showcase/      — Showcase standalone page
      profile/       — Profile editor (older, may be superseded by page-editor)
    api/
      admin/cc/      — Command Center CRUD API
      admin/users/   — User management
      admin/stats/   — Dashboard stats
      account/       — Contact fields, account management
      pods/          — Content blocks CRUD
      profile/       — Profile CRUD
      links/         — Link management
      protected-pages/ — PIN-gated pages
      stripe/        — Checkout, webhooks, portal
      upload/        — Photo/file uploads
      vcard/         — vCard generation
  components/
    admin/           — CC tabs + Admin tabs
    editor/          — Reusable editor sections
    pods/            — Pod editor + renderer
    templates/       — Profile template components
    ui/              — Shared UI components
  styles/            — CSS files (landing, auth, legal, dashboard, cc, setup, profile, etc.)
  lib/
    auth.ts          — Auth.js config
    db.ts            — PostgreSQL connection pool
    stripe.ts        — Stripe client
    themes.ts        — 10 templates + theme helpers
```

### Database
- Schema: `db/init.sql` (regenerated Feb 26, 2026), migrations in `db/migrations/` (001-052, no gaps)
- 28 tables: users, profiles, links, contact_fields, protected_pages, pods, showcase_items, analytics_events, pin_attempts, accessories, invite_codes, waitlist, feedback, hardware_waitlist, image_gallery, connections, score_events, user_scores, vcard_download_tokens, email_verification_tokens, password_resets, contacts, cc_features, cc_roadmap, cc_changelog, cc_docs, cc_votes, cc_comments

### Running Locally
```bash
cd D:\Docker\imprynt
docker compose up --build
# App: http://localhost:3000 | DB: localhost:5432 | nginx: localhost:80
# Reset DB: docker compose down -v && docker compose up --build
```

---

## Design System
- **Colors:** Dark navy (#0c1017) + warm gold (#e8a849) — see docs/archive/DESIGN_HANDOFF.md for full token list
- **Fonts:** Inter (body/UI) + Instrument Serif (headlines), loaded via next/font/google
- **Logo:** Circle with centered dot (accent color) + "IMPRYNT" wordmark
- **CSS Pattern:** Prefixed classes per page (lp-, auth-, legal-, dash-, setup-, cc-, profile-)
- **No Tailwind.** Inline styles + CSS files with CSS variables.

---

## Naming Conventions
- **Impression** = what was previously called "Easter Egg" (hidden PIN-gated personal layer)
- **Showcase/Portfolio** = visible PIN-gated professional content
- **Pods** = content blocks on the profile (text, text_image, stats, listing, music, event)
- **Command Center (CC)** = internal admin tooling for features, roadmap, changelog, docs, schema
- **On Air** = profile published/live toggle
- **Signa** = analytics/view count metric name

---

## Session Log

### February 25, 2026 — Context Rebuild + Project Governance Setup
- **What happened:** Previous conversation history was lost (both Claude.ai and Claude Code sessions). Full context rebuilt by reading codebase, docs, and handoff files.
- **State found:** App is functional and well past MVP. Admin/Command Center consolidation appears largely complete. Setup wizard v2 rewrite is in early stages (placeholder file created). Staged fixes from Feb 12 may or may not have been applied.
- **Work in progress before context loss:** Consolidating the user admin portal (`/p-8k3x`) into the Command Center (`/dashboard/admin`). Challenges around RBAC: advisors should see Features + Roadmap, admins see everything including Users, Codes, Waitlist, Feedback.
- **Plan for portal consolidation:** Add the 4 portal-only tabs (Users, Codes, Waitlist, Feedback) to the CC as admin-only tabs. Merge Overview stats. Kill `/p-8k3x` when done. RBAC already partially works via `access.ts` getAccessLevel().
- **Known bugs identified:**
  - Noir template: buttons have invisible text (accent color #f5f0e8 is cream, button text is white = invisible). Fix: detect light accents and flip text color to dark.
  - Event pod timezone: dates stored as UTC via .toISOString(), displayed without timezone conversion. Shows next day for evening events. Fix: store creator timezone, display in creator's timezone.
  - Event pod renderer: PodRenderer.tsx has NO `event` case at all, returns null. Needs full build.
- **Feature discussion (pinned, not started):**
  - Event pod public renderer design
  - Event link button (replacing just ticket link)
  - Facebook event URL import (auto-extract event data). Plan: use lightweight npm scraper as convenience feature, manual fallback.
- **Created today:**
  - `CLAUDE.md` — Project rules of engagement (workflow constraints, approval gates, backup policy, documentation requirements)
  - `CONTEXT.md` — Session state and continuity log
  - `backups/` directory for pre-edit file backups
- **Decisions made:**
  - All work local-only, production deploys require Tim's explicit approval
  - Functional file changes require backup to `backups/` before editing
  - `CLAUDE.md` and `CONTEXT.md` are the authoritative governance docs going forward
  - Older handoff files (HANDOFF.md, CLAUDE_CODE_HANDOFF.md, CLAUDE_CODE_PROMPT.md) are deprecated reference only
  - Created `CLAUDE_CODE_PROMPT_2026-02-25.md` with 4-task prompt for Claude Code:
    1. Noir template button fix (accent-contrast CSS variable)
    2. Event pod timezone fix (store timezone, stop UTC conversion)
    3. Event pod public renderer (full build in PodRenderer.tsx)
    4. Admin portal consolidation into Command Center (add admin tabs, keep legacy alive until verified)

### February 26, 2026 — Four-Task Sprint Complete
- **All 4 tasks from CLAUDE_CODE_PROMPT_2026-02-25.md completed:**
  1. **Noir Template Button Fix:** Added `getRelativeLuminance()` and `getAccentContrastColor()` helpers to `themes.ts`. New `--accent-contrast` CSS variable computed in both `getThemeCSSVars()` and `getAccentOverrideVars()`. Updated `.save-btn`, `.pod-cta-btn`, and `.pod-event-cta` in `profile.css` to use `var(--accent-contrast, #fff)`. Noir (cream accent) and Midnight (lime accent) now have readable button text.
  2. **Event Pod Timezone Fix:** Added `event_timezone` column (migration 051). PodEditor now auto-detects timezone via `Intl.DateTimeFormat().resolvedOptions().timeZone` and stores raw datetime-local values without UTC conversion. API routes (pods, protected-pages/pods) updated to accept/return `eventTimezone`. PodRenderer formats dates using stored timezone. PodData interface updated.
  3. **Event Pod Public Renderer:** Redesigned event card layout: date+time first (large, accent), title, venue, address, CTA button ("Event Details" default), image, body (markdown via renderMarkdown). Status badges (Cancelled/Postponed/Sold Out/Happening Now/Ended). CSS fully reworked with `pod-event-*` classes using template variables. Button style modifiers applied.
  4. **Admin Portal Consolidation:** Added Users/Codes/Waitlist/Feedback/Traffic tabs to Command Center (`/dashboard/admin`). Tab groups separated by visual divider. RBAC preserved (advisory users only see Features + Roadmap). Imported `admin.css`. Added deprecation notice to legacy portal (`/p-8k3x`). Legacy routes kept intact.
- **Verification:** `tsc --noEmit` passes with zero errors. `docker compose build` succeeds.
- **Files modified:** `themes.ts`, `ProfileTemplate.tsx`, `profile.css`, `cc.css`, `PodEditor.tsx`, `PodRenderer.tsx`, pods API routes (main + protected-pages), `[slug]/page.tsx`, `dashboard/admin/page.tsx`, `AdminClient.tsx`
- **Files created:** `db/migrations/051_event_timezone.sql`

### February 26, 2026 (Session 4) — Event Enhancements + Profile Polish
- **Event timezone fix:** PodEditor datetime-local inputs no longer double-convert to/from UTC. Stores raw datetime-local values. Auto-detects and saves creator's timezone on first eventStart entry.
- **Facebook event import:** New API endpoint `/api/events/facebook` using `facebook-event-scraper` npm package. PodEditor now has "Import from Facebook" section at top of event form. Auto-populates title, description, venue, address, dates, image, CTA. Graceful fallback on failure.
- **Event link labels:** Renamed "Ticket / RSVP URL" to "Event link" and "Button text" to "Button label" in PodEditor. Placeholder updated.
- **Photo lightbox enhanced:** ExpandablePhoto now shows themed card with large photo, full name, title/company, and Save Contact button. Backdrop blur overlay. Template CSS variables for consistent theming.
- **QR code enhanced:** Always-on for free tier profiles (paid users still control via toggle). QR modal now themed to match template instead of hardcoded white. QR image wrapped in white container for scanability.
- **Free tier signup CTA:** "Powered by Imprynt" watermark replaced with "Create your free Imprynt profile" themed button/badge on free profiles. Links to /register?ref=profile for referral tracking. Uses template accent color.
- **Version:** These changes collectively bring the platform to approximately v0.9.7.

### February 26, 2026 (Session 3) — System Cleanup
- **Database:** Dropped 2 abandoned tables (sessions, verification_tokens). Migration 052 created.
- **Files deleted:** SetupWizardNew.tsx, p-8k3x/ (page + 6 API routes), /api/auth/signout, /api/showcase-items, staged-fixes/, sygnet-mvp-spec.md, db_production_dump.sql
- **Files archived:** 11 deprecated docs to docs/archive/. 2 audit files to docs/audits/.
- **Migrations fixed:** 044, 045, 046 moved from db/ to db/migrations/. No more gap.
- **init.sql regenerated** from live database schema.
- **CC updated:** Changelog entry v0.9.6.
- **CLAUDE.md updated:** Section 9 now points to CC as canonical source. Context recovery protocol added as section 10. Removed references to sygnet-mvp-spec.md and legacy admin portal.

### February 26, 2026 (Session 2) — Full Platform Audit
- **What happened:** Full audit of codebase + live database via `AUDIT_RESULTS.md`. Queried all CC tables (features, roadmap, changelog), all schema columns, row counts, and scanned every directory in the codebase for feature presence.
- **Key findings — many items previously listed as "not done" are actually done:**
  - Slug rotation: API + UI both exist
  - Link click tracking: full pipeline (client tracker, API, analytics display)
  - Icon-only link mode: implemented in LinksSection.tsx
  - Resume/document upload: on protected pages with file upload API
  - Status badge colors: done
  - Impression separate photo: done
  - Password strength: full validation + meter
  - Setup wizard v3: shipped Feb 25 (CC changelog v0.9.5)
  - Admin user management: full CRUD (suspend/reactivate/delete/plan/reset-password/unlock)
  - Email verification: token flow + resend + banner
  - Account deletion: password-verified cascade delete
  - Branded 404/error: both exist with Imprynt branding
  - On Air toggle: component + dashboard integration
  - QR code: generation API + modal + toggle
  - Link preview manual fallback: exists in pod editor
- **What's actually NOT done (verified):**
  - ~~FAQ/trust page~~ → shipped Session 6 (`/faq` with accordion, trust grid, CTA)
  - Multiple protected pages UI (backend supports it, UI exposes one per type)
  - ~~Free tier signup CTA~~ → shipped Session 5 (accent-themed CTA replaces watermark)
  - Site-wide light mode CSS (infrastructure exists, no light palette in stylesheets)
  - Email service not wired (logs to console)
  - Stripe keys not configured
  - Migrations 044-046 missing from disk
- **CC platform stats:** 41 features tracked (27 shipped, 1 in progress, 9 planned, 4 exploring). 26 roadmap items. 14 changelog entries (v0.1.0 to v0.9.5). 30 database tables. 19 users, 19 profiles, 26 pods, 95 links.
- **CC roadmap "next" phase items:** Testimonial pods, Video embed pods, Dashboard banners, Animated explainer video, Template light/dark variants
- **CC roadmap "later" phase items:** Free tier branding banner, Recovery email, Waitlist modal, AI onboarding, Impryntables LED prototypes, Alternative NFC form factors
- **CC planned features (v1.5):** Testimonial Pods, Video Embed Pods, AI-Assisted Onboarding, Dashboard Banners, Email Communications, Enhanced Analytics, Token-Based Links, Free Tier Branding
- **CC exploring features (v2):** Mobile App, Custom Domains, Team/Enterprise Plans, API Access
- **Updated CONTEXT.md** with corrected feature status. Removed false "not done" items. Added corrections section.
- **Prompts completed:** Both queued prompts executed in Sessions 4 and 5.

### February 26, 2026 (Session 3) — System Cleanup
- **What happened:** Executed cleanup based on CLEANUP_AUDIT.md findings.
- **Database:** Dropped 2 abandoned tables (sessions, verification_tokens). Migration 052 created.
- **Files deleted:** SetupWizardNew.tsx (orphaned), p-8k3x/ page + 6 API routes (deprecated), /api/auth/signout (orphaned), /api/showcase-items (orphaned), staged-fixes/ (all superseded), sygnet-mvp-spec.md (empty), db_production_dump.sql (one-time dump)
- **Files archived:** 11 deprecated docs moved to docs/archive/. 2 audit files moved to docs/audits/.
- **Migrations fixed:** 044, 045, 046 moved from db/ to db/migrations/. No more gap. Full range 001-052.
- **init.sql regenerated:** Fresh schema dump from live database replaces stale init.sql. Old version kept as init.sql.bak.
- **CC updated:** Changelog entry v0.9.6 for system cleanup.
- **CLAUDE.md updated:** Section 9 now points to CC as canonical source. Deprecated docs listed. Context recovery protocol added as section 10.
- **Type check:** `tsc --noEmit` passes with zero errors (cleared stale .next/types cache).

### February 26, 2026 (Session 4) — Event Enhancements
- **What happened:** Executed 3-task prompt from `docs/archive/CLAUDE_CODE_PROMPT_2026-02-26.md`.
- **Task 1 — PodEditor timezone fix:** Added timezone auto-set on eventStart onChange (sets `eventTimezone` from `Intl.DateTimeFormat` when user first enters a date). Listing open house datetime inputs also updated with consistent `|| ''` fallback. Value display `.slice(0, 16)` and raw save were already correct from prior session.
- **Task 2 — Facebook Event Import:** Installed `facebook-event-scraper` package. Created `/api/events/facebook` route that scrapes public FB event URLs and returns structured data (title, description, image, venue, address, dates, ticket URL). Added import UI to PodEditor event section with per-pod URL input, loading/success/error states. ISO timestamps from API converted to datetime-local format on the frontend via `isoToDatetimeLocal()` helper.
- **Task 3 — Event link labels:** Renamed "Button text" to "Button label", "Ticket / RSVP URL" to "Event link". Updated placeholder from "https://eventbrite.com/..." to "https://facebook.com/events/... or ticket link". Verified event field order matches spec (fb import, name, date/time, venue, address, event link, image, description, status, auto-hide).
- **Verification:** `tsc --noEmit` passes (0 errors). `docker compose build` succeeds.
- **Files modified:** `src/components/pods/PodEditor.tsx`, `package.json`, `package-lock.json`
- **Files created:** `src/app/api/events/facebook/route.ts`, `backups/PodEditor-2026-02-26.tsx`

### February 26, 2026 (Session 5) — Lightbox + QR + Free CTA
- **What happened:** Executed 3-task prompt from `docs/archive/CLAUDE_CODE_PROMPT_2026-02-26-S2.md`.
- **Task 1 — Photo Lightbox with Save Contact:** Rebuilt `ExpandablePhoto.tsx` lightbox from basic fullscreen overlay to themed modal card. New props: `title`, `company`, `profileId`, `vcardPinEnabled`. Modal shows large photo, full name, title/company, and full-width Save Contact button. CSS uses template variables (`--surface`, `--border`, `--accent`, `--text`). Backdrop blur + scaleIn animation. Updated `ProfileTemplate.tsx` HeroContent to pass new props.
- **Task 2 — QR Code Button Enhanced:** Part A: Free tier profiles now always show QR button (`!isPaid || !!profile.show_qr_button`). ProfileTab shows informational note for free users instead of toggle. Part B: Themed QR modal (CSS variables for colors/borders, white container around QR image for scanability). Part C: Refactored floating buttons (share + QR) into a stacked flex container in bottom-right corner, consistent sizing (40px) and hover behavior.
- **Task 3 — Free Tier Signup CTA:** Replaced "Powered by Imprynt" watermark with "Create your free Imprynt profile →" CTA linking to `/register?ref=profile`. Themed button style (accent-colored mark + text, border hover effect). Old `.watermark` CSS rules kept as fallback.
- **Verification:** `tsc --noEmit` passes (0 errors). `docker compose build` succeeds.
- **Files modified:** `src/components/templates/ExpandablePhoto.tsx`, `src/components/templates/ProfileTemplate.tsx`, `src/app/[slug]/ProfileClient.tsx`, `src/app/[slug]/page.tsx`, `src/app/dashboard/page-editor/tabs/ProfileTab.tsx`, `src/styles/profile.css`
- **Files backed up:** `backups/ExpandablePhoto-2026-02-26.tsx`, `backups/ProfileTemplate-2026-02-26.tsx`, `backups/ProfileClient-2026-02-26.tsx`, `backups/slug-page-2026-02-26.tsx`, `backups/profile-2026-02-26.css`

### February 26, 2026 (Session 6) — FAQ/Trust Page
- **What happened:** Executed `CLAUDE_CODE_PROMPT_FAQ.md`.
- **Created:** `/faq` page (`src/app/faq/page.tsx`) with grouped accordion FAQ (5 sections, 17 questions), trust signal grid (5 cards), and signup CTA with WaitlistButton.
- **Stylesheet:** `src/styles/faq.css` with hero, accordion, trust grid, CTA, footer, and responsive styles. Follows dark navy + gold design system.
- **Navigation:** Added FAQ link to landing page nav (`page.tsx`), mobile nav (`MobileNav.tsx`), landing page footer, and legal page footers (`terms/page.tsx`, `privacy/page.tsx`).
- **CC updated:** Feature entry (FAQ / Trust Page, marketing, shipped) + changelog v0.9.7.
- **Verification:** `tsc --noEmit` passes (0 errors). `docker compose build` succeeds.
- **Files created:** `src/app/faq/page.tsx`, `src/styles/faq.css`
- **Files modified:** `src/app/page.tsx`, `src/components/MobileNav.tsx`, `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`

---

## How to Use This File

**After each work session:**
1. Add a new entry to the Session Log with the date
2. Summarize what was worked on, what was completed, what's still in progress
3. Note any decisions made or direction changes
4. Update "Current State Summary" if major features were added/removed
5. Update "What's In Progress" section

**After each push to production:**
1. Note the push in the Session Log with what was deployed
2. Update any "Staged" items that moved to "Deployed"

**When starting a new conversation:**
1. Read this file first
2. Ask Claude to read it too
3. Pick up where the last session left off

This file lives in the project root and is committed to git. It's the single source of truth for session continuity.
