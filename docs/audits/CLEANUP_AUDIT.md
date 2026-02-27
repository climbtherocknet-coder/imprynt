# Imprynt Platform — Cleanup Audit

**Generated:** 2026-02-26
**Purpose:** Identify abandoned tables, dead files, orphaned code, and recommend cleanup actions.
**This is a READ-ONLY audit. No files were modified.**

---

## Part 1: Database Table Usage Audit

| table_name | row_count | status | referenced_by | notes |
|---|---|---|---|---|
| `accessories` | 0 | **ACTIVE** | `dashboard/account/page.tsx`, `api/stripe/webhook/route.ts`, `admin/SchemaTab.tsx` | Reads for account page; Stripe webhook inserts on hardware purchase. 0 rows = no purchases yet. |
| `analytics_events` | 3,787 | **ACTIVE** | `[slug]/page.tsx`, `r/[userId]/route.ts`, `api/analytics/route.ts`, `api/analytics/link-click/route.ts`, `api/pin/route.ts`, `api/share/route.ts`, `dashboard/page.tsx`, admin user routes, reset-test | Core analytics engine. INSERTs on page views, link clicks, shares, PIN unlocks. |
| `cc_changelog` | 14 | **ACTIVE** | `api/admin/cc/changelog/route.ts`, `api/admin/cc/overview/route.ts`, `admin/CCChangelog.tsx` | Command Center changelog. Full CRUD. |
| `cc_comments` | 0 | **ACTIVE** | `api/admin/cc/comments/route.ts`, joined in cc/roadmap, cc/changelog, cc/features, cc/docs routes | Comments on CC entities. Full CRUD; 0 rows = no comments posted yet. |
| `cc_docs` | 6 | **ACTIVE** | `api/admin/cc/docs/route.ts`, `api/admin/cc/overview/route.ts`, `admin/CCDocs.tsx` | Command Center documentation. Full CRUD. |
| `cc_features` | 41 | **ACTIVE** | `api/admin/cc/features/route.ts`, `api/admin/cc/overview/route.ts`, `admin/CCFeatures.tsx` | Feature tracker with voting. |
| `cc_roadmap` | 26 | **ACTIVE** | `api/admin/cc/roadmap/route.ts`, `api/admin/cc/overview/route.ts`, `admin/CCRoadmap.tsx` | Roadmap items linked to features. |
| `cc_votes` | 0 | **ACTIVE** | `api/admin/cc/votes/route.ts`, joined in cc/features and cc/roadmap | Upvote system. Toggle logic implemented; 0 rows = no votes yet. |
| `connections` | 3,744 | **ACTIVE** | `[slug]/page.tsx`, `api/vcard/`, `api/pin/`, `api/share/`, `api/admin/stats/` | Logs every meaningful interaction (page view, share, vCard, PIN unlock). |
| `contact_fields` | 17 | **ACTIVE** | `api/account/contact-fields/route.ts`, `api/vcard/` routes | User-defined contact info for vCards. |
| `contacts` | 0 | **PLACEHOLDER** | `api/account/reset-test/route.ts` (DELETE only), `admin/SchemaTab.tsx` | CRM/contact book feature. Full schema exists but no CRUD API routes. |
| `email_verification_tokens` | 2 | **INFRASTRUCTURE** | `api/register/route.ts`, `api/auth/verify-email/`, `api/auth/resend-verification/` | Auth tokens created at registration, consumed on verification. |
| `feedback` | 0 | **ACTIVE** | `api/feedback/route.ts`, `api/admin/feedback/`, `FeedbackButton.tsx`, `ReportButton.tsx`, `AdminFeedbackTab.tsx` | Full feedback/report system. 0 rows = no submissions yet. |
| `hardware_waitlist` | 0 | **ACTIVE** | `api/hardware-interest/route.ts`, `dashboard/setup/SetupWizard.tsx` | NFC hardware interest during setup wizard. |
| `image_gallery` | 40 | **ACTIVE** | `api/gallery/route.ts`, `ui/GalleryPicker.tsx` | Curated image gallery for profile customization. |
| `invite_codes` | 9 | **ACTIVE** | `api/register/route.ts`, `api/admin/invite-codes/`, `api/admin/waitlist/` | Invite code system for gated registration. |
| `links` | 95 | **ACTIVE** | `[slug]/page.tsx`, `api/links/route.ts`, `api/profile/`, `api/vcard/`, `api/analytics/`, `LinkTracker.tsx` | Core link system. Full CRUD + click tracking. |
| `password_resets` | 0 | **INFRASTRUCTURE** | `api/auth/reset-password/route.ts`, `api/auth/reset-password/confirm/route.ts` | Auth tokens for password reset flow. |
| `pin_attempts` | 30 | **ACTIVE** | `api/pin/route.ts` | Rate-limiting for PIN entry. Tracks success/failure per IP hash. |
| `pods` | 26 | **ACTIVE** | `[slug]/page.tsx`, `api/pods/route.ts`, `api/protected-pages/pods/`, `PodEditor.tsx`, `PodRenderer.tsx` | Content blocks on profiles and protected pages. Full CRUD. |
| `profiles` | 19 | **ACTIVE** | 30+ files across api/profile/, [slug]/, api/vcard/, api/pods/, dashboard/ | Core entity. Foundation of the entire application. |
| `protected_pages` | 12 | **ACTIVE** | `api/protected-pages/`, `api/pin/`, `dashboard/page.tsx`, `[slug]/page.tsx` | PIN-gated personal pages. Full CRUD + PIN verification. |
| `score_events` | 158 | **ACTIVE** | `lib/scoring.ts`, `[slug]/page.tsx`, `api/analytics/link-click/`, `api/share/`, `api/pin/`, `api/vcard/` | Gamification scoring system. |
| `sessions` | 0 | **ABANDONED** | `admin/SchemaTab.tsx` (schema diagram only) | NextAuth database session table. App uses JWT strategy, so this table is never read or written. |
| `showcase_items` | 0 | **ACTIVE** | `api/showcase-items/route.ts`, `api/protected-pages/[pageId]/`, `ProfileClient.tsx`, `ProtectedPagePreview.tsx`, `PortfolioTab.tsx` | Portfolio items on protected pages. Full CRUD with plan gating. |
| `user_scores` | 18 | **ACTIVE** | `lib/scoring.ts`, `api/analytics/route.ts` | Aggregated user score totals. Auto-maintained by scoring system. |
| `users` | 19 | **ACTIVE** | 40+ files. `lib/auth.ts`, `api/register/`, `api/stripe/webhook/`, `dashboard/page.tsx`, all admin routes | Core entity. Authentication, plan management, setup tracking. |
| `vcard_download_tokens` | 2 | **ACTIVE** | `api/pin/route.ts`, `api/vcard/[profileId]/personal/route.ts`, reset-test | Token-gated personal vCard downloads. |
| `verification_tokens` | 0 | **ABANDONED** | None in src/ | Standard NextAuth adapter table. App uses its own `email_verification_tokens` instead. Never read or written. |
| `waitlist` | 5 | **ACTIVE** | `api/waitlist/route.ts`, `api/admin/waitlist/`, `WaitlistModal.tsx`, `waitlist/page.tsx` | Pre-launch waitlist with admin invite flow. |

### Summary

| Status | Count | Tables |
|---|---|---|
| **ACTIVE** | 25 | accessories, analytics_events, cc_changelog, cc_comments, cc_docs, cc_features, cc_roadmap, cc_votes, connections, contact_fields, feedback, hardware_waitlist, image_gallery, invite_codes, links, pin_attempts, pods, profiles, protected_pages, score_events, showcase_items, user_scores, users, vcard_download_tokens, waitlist |
| **INFRASTRUCTURE** | 2 | email_verification_tokens, password_resets |
| **PLACEHOLDER** | 1 | contacts |
| **ABANDONED** | 2 | sessions, verification_tokens |

---

## Part 2: API Route Audit

### Duplicate Detection: `/api/p-8k3x/*` vs `/api/admin/*`

**Confirmed duplicates.** The p-8k3x routes (analytics, feedback, invite-codes, stats, users, waitlist) are exact functional duplicates of the corresponding admin routes. Both share the same imports (`auth`, `isAdmin`), same DB queries. The p-8k3x routes are only called from `src/app/p-8k3x/AdminClient.tsx` (old monolithic admin page), while admin routes are called from the newer modular `src/components/admin/` components. The admin routes also have the Command Center (`cc/`) sub-routes that p-8k3x lacks.

### Route Classification

| route_path | status | called_from | notes |
|---|---|---|---|
| `/api/account/change-password` | ACTIVE | `AccountClient.tsx` | |
| `/api/account/contact-fields` | ACTIVE | `ContactCardSection.tsx` | |
| `/api/account/delete` | ACTIVE | `AccountClient.tsx` | |
| `/api/account/reset-test` | ACTIVE | `AccountClient.tsx` | Dev/test utility |
| `/api/admin/analytics` | ACTIVE | `AdminTrafficTab.tsx` | Proxies Umami analytics |
| `/api/admin/cc/changelog` | ACTIVE | `CCChangelog.tsx`, `CCRoadmap.tsx` | |
| `/api/admin/cc/comments` | ACTIVE | `Comments.tsx` | |
| `/api/admin/cc/docs` | ACTIVE | `CCDocs.tsx` | |
| `/api/admin/cc/features` | ACTIVE | `CCFeatures.tsx` | |
| `/api/admin/cc/overview` | ACTIVE | `CCOverview.tsx`, `admin/page.tsx` | |
| `/api/admin/cc/roadmap` | ACTIVE | `CCRoadmap.tsx` | |
| `/api/admin/cc/votes` | ACTIVE | `VoteButton.tsx` | |
| `/api/admin/feedback` | ACTIVE | `AdminFeedbackTab.tsx` | |
| `/api/admin/invite-codes` | ACTIVE | `AdminCodesTab.tsx` | |
| `/api/admin/stats` | ACTIVE | `CCOverview.tsx`, `admin/page.tsx` | |
| `/api/admin/users` | ACTIVE | `AdminUsersTab.tsx` | Includes sub-routes: [userId], plan, suspend, reactivate, unlock, reset-password |
| `/api/admin/waitlist` | ACTIVE | `AdminWaitlistTab.tsx` | |
| `/api/analytics` | ACTIVE | `AnalyticsClient.tsx` | User-facing profile analytics |
| `/api/analytics/link-click` | ACTIVE | `LinkTracker.tsx` | Uses both fetch and sendBeacon |
| `/api/auth/[...nextauth]` | INFRASTRUCTURE | NextAuth.js framework | Handles session, signin, callback |
| `/api/auth/resend-verification` | ACTIVE | `VerificationBanner.tsx` | |
| `/api/auth/reset-password` | ACTIVE | `forgot-password/page.tsx` | Initiate reset |
| `/api/auth/reset-password/confirm` | ACTIVE | `reset-password/page.tsx` | Confirm with token |
| `/api/auth/signout` | **ORPHANED** | *None* | Custom cookie-clearing signout; app uses NextAuth's built-in `signOut()` instead |
| `/api/auth/verify-email` | INFRASTRUCTURE | Email links | Called via verification emails, not client JS |
| `/api/feedback` | ACTIVE | `ReportButton.tsx`, `FeedbackButton.tsx` | |
| `/api/gallery` | ACTIVE | `GalleryPicker.tsx` | |
| `/api/hardware-interest` | ACTIVE | `SetupWizard.tsx` | |
| `/api/health` | INFRASTRUCTURE | `docker-compose.prod.yml`, `deploy.ps1` | Docker healthcheck |
| `/api/links` | ACTIVE | `LinksSection.tsx` | GET, POST, PUT, DELETE |
| `/api/og-preview` | ACTIVE | `PodEditor.tsx` | OG metadata preview |
| `/api/p-8k3x/analytics` | **DEPRECATED** | `p-8k3x/AdminClient.tsx` | Superseded by `/api/admin/analytics` |
| `/api/p-8k3x/feedback` | **DEPRECATED** | `p-8k3x/AdminClient.tsx` | Superseded by `/api/admin/feedback` |
| `/api/p-8k3x/invite-codes` | **DEPRECATED** | `p-8k3x/AdminClient.tsx` | Superseded by `/api/admin/invite-codes` |
| `/api/p-8k3x/stats` | **DEPRECATED** | `p-8k3x/AdminClient.tsx` | Superseded by `/api/admin/stats` |
| `/api/p-8k3x/users` | **DEPRECATED** | `p-8k3x/AdminClient.tsx` | Superseded by `/api/admin/users` |
| `/api/p-8k3x/waitlist` | **DEPRECATED** | `p-8k3x/AdminClient.tsx` | Superseded by `/api/admin/waitlist` |
| `/api/pin` | ACTIVE | `ProfileClient.tsx` | |
| `/api/pin/check` | ACTIVE | `ProfileClient.tsx` | |
| `/api/pin/forget` | ACTIVE | `ProfileClient.tsx` | |
| `/api/pin/remember` | ACTIVE | `ProfileClient.tsx` | |
| `/api/pods` | ACTIVE | `PodEditor.tsx` | Profile pods |
| `/api/profile` | ACTIVE | 10+ files | Core profile CRUD |
| `/api/profile/[profileId]/qr` | ACTIVE | `ProfileClient.tsx` | Public QR code |
| `/api/profile/publish` | ACTIVE | `OnAirToggle.tsx` | |
| `/api/profile/qr` | ACTIVE | `ProfileTab.tsx` | Dashboard QR code |
| `/api/profile/rotate-slug` | ACTIVE | `MyUrlsCard.tsx` | |
| `/api/protected-pages` | ACTIVE | `AnalyticsClient.tsx`, tabs, `PageEditor.tsx`, `AccountClient.tsx` | |
| `/api/protected-pages/[pageId]` | ACTIVE | `ProfileClient.tsx` | |
| `/api/protected-pages/pods` | ACTIVE | `PodEditor.tsx` | Protected page pods |
| `/api/register` | ACTIVE | `register/page.tsx` | |
| `/api/setup` | ACTIVE | `SetupWizard.tsx` | |
| `/api/setup/complete` | ACTIVE | `SetupWizard.tsx`, `SetupWizardNew.tsx` | |
| `/api/share` | ACTIVE | `ProfileClient.tsx` | |
| `/api/showcase-items` | **ORPHANED** | *None* | Full CRUD exists but zero client-side fetch calls. Showcase items loaded inline via `protected-pages/[pageId]` instead. |
| `/api/stripe/checkout` | ACTIVE | `AccountClient.tsx` | |
| `/api/stripe/portal` | ACTIVE | `AccountClient.tsx` | |
| `/api/stripe/webhook` | INFRASTRUCTURE | Stripe servers | |
| `/api/trial` | ACTIVE | `PersonalTab.tsx`, `PortfolioTab.tsx` | |
| `/api/upload/file` | ACTIVE | `PodEditor.tsx`, `VisualsSection.tsx`, tabs | |
| `/api/upload/photo` | ACTIVE | `VisualsSection.tsx` | |
| `/api/vcard/[profileId]` | ACTIVE | `ProfileClient.tsx`, `SaveContactButton.tsx` | |
| `/api/vcard/[profileId]/personal` | ACTIVE | `ProfileClient.tsx` | |
| `/api/waitlist` | ACTIVE | `WaitlistModal.tsx`, `waitlist/page.tsx` | |

### Summary

| Classification | Count |
|---|---|
| ACTIVE | 46 |
| DEPRECATED | 6 (all `/api/p-8k3x/*`) |
| ORPHANED | 2 (`/api/auth/signout`, `/api/showcase-items`) |
| INFRASTRUCTURE | 4 (`[...nextauth]`, `verify-email`, `health`, `stripe/webhook`) |

---

## Part 3: Component/File Audit

### src/components/ (top-level)

| file_path | status | imported_by | notes |
|---|---|---|---|
| `components/AnnouncementBanner.tsx` | ACTIVE | `dashboard/layout.tsx` | |
| `components/Breadcrumbs.tsx` | ACTIVE | `AnalyticsClient.tsx`, `AccountClient.tsx`, `PageEditor.tsx` | |
| `components/FeedbackButton.tsx` | ACTIVE | `(auth)/layout.tsx`, `waitlist/page.tsx`, `dashboard/layout.tsx` | |
| `components/HeroPhone.tsx` | ACTIVE | `HeroPreviewButton.tsx`, `page.tsx` | |
| `components/HeroPreviewButton.tsx` | ACTIVE | `page.tsx` | |
| `components/MobileNav.tsx` | ACTIVE | `page.tsx` | |
| `components/OnAirToggle.tsx` | ACTIVE | `DashboardOnAir.tsx` | |
| `components/PasswordStrengthMeter.tsx` | ACTIVE | `reset-password/page.tsx`, `register/page.tsx`, `AdminUsersTab.tsx`, `AccountClient.tsx`, `AdminClient.tsx` | |
| `components/ReportButton.tsx` | ACTIVE | `ProfileClient.tsx` (as `ProfileFeedbackButton`) | |
| `components/ThemeProvider.tsx` | ACTIVE | `layout.tsx`, `ThemeToggle.tsx` | |
| `components/ThemeToggle.tsx` | ACTIVE | `page.tsx`, `dashboard/page.tsx`, `register/page.tsx`, `login/page.tsx`, `PageEditor.tsx` | |
| `components/ToggleSwitch.tsx` | ACTIVE | `ProfileTab.tsx`, `PortfolioTab.tsx`, `PersonalTab.tsx` | |
| `components/WaitlistBanner.tsx` | ACTIVE | `page.tsx` | |
| `components/WaitlistCTA.tsx` | ACTIVE | `page.tsx`, `WaitlistBanner.tsx`, `MobileNav.tsx` | |
| `components/WaitlistModal.tsx` | ACTIVE | `WaitlistCTA.tsx` | |

### src/components/admin/

| file_path | status | imported_by | notes |
|---|---|---|---|
| `admin/AdminCodesTab.tsx` | ACTIVE | `admin/page.tsx` | |
| `admin/AdminFeedbackTab.tsx` | ACTIVE | `admin/page.tsx` | |
| `admin/AdminTrafficTab.tsx` | ACTIVE | `admin/page.tsx` | |
| `admin/AdminUsersTab.tsx` | ACTIVE | `admin/page.tsx` | |
| `admin/AdminWaitlistTab.tsx` | ACTIVE | `admin/page.tsx` | |
| `admin/CCChangelog.tsx` | ACTIVE | `admin/page.tsx` | |
| `admin/CCDocs.tsx` | ACTIVE | `admin/page.tsx` | |
| `admin/CCFeatures.tsx` | ACTIVE | `admin/page.tsx` | |
| `admin/CCOverview.tsx` | ACTIVE | `admin/page.tsx` | |
| `admin/CCRoadmap.tsx` | ACTIVE | `admin/page.tsx` | |
| `admin/Comments.tsx` | ACTIVE | `CCChangelog`, `CCFeatures`, `CCDocs`, `CCRoadmap` | Shared comment widget |
| `admin/SchemaTab.tsx` | ACTIVE | `admin/page.tsx` | |
| `admin/VoteButton.tsx` | ACTIVE | `CCRoadmap`, `CCFeatures` | |

### src/components/editor/

| file_path | status | imported_by | notes |
|---|---|---|---|
| `editor/ContactCardSection.tsx` | ACTIVE | `SetupWizard.tsx`, `ProfileTab.tsx` | |
| `editor/IdentitySection.tsx` | ACTIVE | `SetupWizard.tsx`, `ProfileTab.tsx` | |
| `editor/LinksSection.tsx` | ACTIVE | `SetupWizard.tsx`, `ProfileTab.tsx` | |
| `editor/TemplateSection.tsx` | ACTIVE | `SetupWizard.tsx`, `ProfileTab.tsx` | |
| `editor/VisualsSection.tsx` | ACTIVE | `SetupWizard.tsx`, `ProfileTab.tsx` | |
| `editor/constants.ts` | ACTIVE | `SetupWizard.tsx`, `ProfileTab.tsx` | Exports `ProfileData`, `LinkItem` types |

### src/components/pods/

| file_path | status | imported_by | notes |
|---|---|---|---|
| `pods/PodEditor.tsx` | ACTIVE | `SetupWizard.tsx`, `PersonalTab.tsx`, `ProfileTab.tsx`, `PortfolioTab.tsx` | |
| `pods/PodRenderer.tsx` | ACTIVE | `ProtectedPagePreview.tsx`, `ProfileTemplate.tsx`, `ProfileClient.tsx`, `SetupWizard.tsx`, tabs (type imports) | |
| `pods/RichTextEditor.tsx` | ACTIVE | `PodEditor.tsx` | |

### src/components/templates/

| file_path | status | imported_by | notes |
|---|---|---|---|
| `templates/ExpandablePhoto.tsx` | ACTIVE | `ProfileTemplate.tsx` | |
| `templates/ProfileTemplate.tsx` | ACTIVE | `[slug]/page.tsx`, `SetupWizard.tsx`, `ProfileTab.tsx` | |
| `templates/ProtectedPagePreview.tsx` | ACTIVE | `PortfolioTab.tsx`, `PersonalTab.tsx` | |
| `templates/SaveContactButton.tsx` | ACTIVE | `ProtectedPagePreview.tsx`, `ProfileTemplate.tsx` | |

### src/components/ui/

| file_path | status | imported_by | notes |
|---|---|---|---|
| `ui/CollapsibleSection.tsx` | ACTIVE | `VisualsSection.tsx`, `ProfileTab.tsx`, `PersonalTab.tsx`, `PortfolioTab.tsx` | |
| `ui/GalleryPicker.tsx` | ACTIVE | `VisualsSection.tsx`, `PersonalTab.tsx`, `PortfolioTab.tsx` | |
| `ui/ImageCropper.tsx` | ACTIVE | `VisualsSection.tsx`, `PortfolioTab.tsx`, `PersonalTab.tsx` | |

### src/lib/

| file_path | status | imported_by | notes |
|---|---|---|---|
| `lib/access.ts` | ACTIVE | `dashboard/page.tsx`, 7 CC API routes | Access-level gating for Command Center |
| `lib/admin.ts` | ACTIVE | 25+ API routes, `p-8k3x/page.tsx` | `isAdmin()` guard |
| `lib/auth.ts` | ACTIVE | 70+ files | Core NextAuth config; most-imported file |
| `lib/color-presets.ts` | ACTIVE | `TemplateSection.tsx` | Single consumer |
| `lib/db.ts` | ACTIVE | 75+ files | `query()` helper; foundational DB layer |
| `lib/email-templates.ts` | ACTIVE | `lib/email.ts` | Single consumer |
| `lib/email.ts` | ACTIVE | 6 API routes | Transactional email sender |
| `lib/listing-parser.ts` | ACTIVE | `api/og-preview/route.ts` | Single consumer; OG metadata extraction |
| `lib/markdown.tsx` | ACTIVE | `CCDocs.tsx`, `CCChangelog.tsx`, `PodRenderer.tsx` | Shared markdown renderer |
| `lib/password-validation.ts` | ACTIVE | `PasswordStrengthMeter.tsx`, `AdminUsersTab.tsx`, 4 API routes, 3 auth pages | |
| `lib/plan.ts` | ACTIVE | `dashboard/page.tsx`, `page-editor/page.tsx` | `getPlanStatus()` |
| `lib/rate-limit.ts` | ACTIVE | `lib/auth.ts`, 7 API routes | |
| `lib/scoring.ts` | ACTIVE | `[slug]/page.tsx`, 4 API routes | `recordScore()` |
| `lib/stripe.ts` | ACTIVE | 3 Stripe API routes | |
| `lib/themes.ts` | ACTIVE | 11 files | Core theme system |

### src/app/dashboard/ (direct files)

| file_path | status | imported_by | notes |
|---|---|---|---|
| `dashboard/CheckoutToast.tsx` | ACTIVE | `dashboard/page.tsx` | |
| `dashboard/DashboardOnAir.tsx` | ACTIVE | `dashboard/page.tsx` | |
| `dashboard/DashboardPreview.tsx` | ACTIVE | `dashboard/page.tsx` | |
| `dashboard/GreetingText.tsx` | ACTIVE | `dashboard/page.tsx` | |
| `dashboard/MyUrlsCard.tsx` | ACTIVE | `dashboard/page.tsx` | |
| `dashboard/SignOutButton.tsx` | ACTIVE | `dashboard/page.tsx` | |
| `dashboard/StatusTagPicker.tsx` | ACTIVE | `DashboardOnAir.tsx` | |
| `dashboard/VerificationBanner.tsx` | ACTIVE | `dashboard/page.tsx` | |

### Special Check: SetupWizardNew.tsx

| file_path | status | imported_by | notes |
|---|---|---|---|
| `dashboard/setup/SetupWizardNew.tsx` | **ORPHANED** | *Nothing* | Placeholder/spec file for a v2 wizard rewrite. Contains only a "Rebuilding" placeholder UI and extensive comment spec. The active wizard is `SetupWizard.tsx` (imported by `setup/page.tsx`). Dead code. |

### Component Audit Summary

- **Total files audited:** 59
- **ACTIVE:** 58
- **ORPHANED:** 1 (`SetupWizardNew.tsx`)
- **DEPRECATED:** 0

---

## Part 4: CSS Audit

| CSS File | Status | Imported By |
|---|---|---|
| `styles/admin.css` | ACTIVE | `p-8k3x/AdminClient.tsx`, `dashboard/admin/page.tsx` |
| `styles/auth.css` | ACTIVE | `reset-password/page.tsx`, `register/page.tsx`, `waitlist/page.tsx`, `login/page.tsx`, `forgot-password/page.tsx` |
| `styles/cc.css` | ACTIVE | `dashboard/admin/page.tsx` |
| `styles/dashboard.css` | ACTIVE | 10 files (dashboard, page-editor, analytics, account, tabs) |
| `styles/demo.css` | ACTIVE | `demo/page.tsx` |
| `styles/error.css` | ACTIVE | `not-found.tsx`, `error.tsx` |
| `styles/landing.css` | ACTIVE | `page.tsx` |
| `styles/legal.css` | ACTIVE | `terms/page.tsx`, `privacy/page.tsx` |
| `styles/profile.css` | ACTIVE | 7 files (ProfileClient, ProfileTemplate, tabs, ProtectedPagePreview, ExpandablePhoto) |
| `styles/setup.css` | ACTIVE | `SetupWizardNew.tsx`, `SetupWizard.tsx` |
| `styles/theme.css` | ACTIVE | `layout.tsx` (root layout — global) |

**Result: All 11 CSS files are actively imported. No orphaned CSS files.**

---

## Part 5: Migration Gap Analysis (044-046)

### The Files Exist — In the Wrong Directory

The migration files were committed to `db/` (the parent directory) instead of `db/migrations/`:

| File | Actual Location | Should Be |
|---|---|---|
| `044_cc_votes.sql` | `db/044_cc_votes.sql` | `db/migrations/044_cc_votes.sql` |
| `045_event_pod.sql` | `db/045_event_pod.sql` | `db/migrations/045_event_pod.sql` |
| `046_link_button_settings.sql` | `db/046_link_button_settings.sql` | `db/migrations/046_link_button_settings.sql` |

### Git History Confirmation

All three appear in commit `485543d` ("feat: editor UX polish — link buttons, sticky save, pod refresh, PIN dashboard"):
- 044 — "CC voting system (migration 044)"
- 045 — "Event pod type (migration 045) with date/time/location/RSVP"
- 046 — "Link Button Settings (migration 046)"

Commit `8240ff9` also references all three: "Migrations 040-046 now applied to production"

### What Each Missing Migration Does

**044_cc_votes.sql** — Creates `cc_votes` table for Command Center feature/roadmap voting:
- Columns: `id`, `parent_type`, `parent_id`, `user_id`, `created_at`
- Unique constraint on `(parent_type, parent_id, user_id)`

**045_event_pod.sql** — Adds event pod support to `pods` table:
- New columns: `event_start`, `event_end`, `event_venue`, `event_address`, `event_status`, `event_auto_hide`
- Updates `pods_pod_type_check` constraint to include `'event'`

**046_link_button_settings.sql** — Adds link button customization:
- Adds `link_size` (default 'medium') and `link_shape` (default 'pill') to both `profiles` and `protected_pages`

### Column Cross-Reference

| Column | Table | Added By | In db/migrations/? |
|---|---|---|---|
| `link_size` | profiles | 046 | NO (file in `db/` root) |
| `link_shape` | profiles | 046 | NO (file in `db/` root) |
| `link_size` | protected_pages | 046 | NO (file in `db/` root) |
| `link_shape` | protected_pages | 046 | NO (file in `db/` root) |
| `event_start` through `event_auto_hide` | pods | 045 | NO (file in `db/` root) |
| `cc_votes` table | — | 044 | NO (file in `db/` root) |
| `link_button_color` | profiles | 047 | YES |
| `button_color` | links | 047 | YES |

**Note:** Migration 047 does `UPDATE profiles SET link_shape = 'rounded' WHERE link_shape = 'circle'`, which assumes `link_shape` from 046 already exists. The dependency chain is correct.

### init.sql Staleness

The `db/init.sql` is stale — it does NOT include columns from migrations 044-047 (no `link_size`, `link_shape`, `link_button_color`, `button_color`, event pod columns, or `cc_votes` table). It reflects the schema as of roughly migration 039 with selective additions.

### Recommended Fix

Move the three files from `db/` to `db/migrations/`:
```
db/044_cc_votes.sql          →  db/migrations/044_cc_votes.sql
db/045_event_pod.sql         →  db/migrations/045_event_pod.sql
db/046_link_button_settings.sql  →  db/migrations/046_link_button_settings.sql
```

---

## Part 6: Root Directory File Audit

### ACTIVE — Used by build, deployment, or dev workflow

| File | Purpose |
|---|---|
| `.env.example` | Template for environment variables |
| `.env.local` | Local dev environment config |
| `.env.production.example` | Template for production environment |
| `.gitignore` | Git ignore rules |
| `Caddyfile` | Caddy reverse proxy config (production) |
| `Dockerfile` | Dev Docker image |
| `Dockerfile.prod` | Production Docker image |
| `deploy.ps1` | PowerShell production deploy script |
| `docker-compose.prod.yml` | Production Docker Compose |
| `docker-compose.yml` | Dev Docker Compose |
| `next.config.mjs` | Next.js configuration |
| `package.json` | Node.js dependencies and scripts |
| `package-lock.json` | Locked dependency tree |
| `tsconfig.json` | TypeScript configuration |

### GOVERNANCE — Project docs that should be maintained

| File | Purpose | Notes |
|---|---|---|
| `CLAUDE.md` | Rules of engagement for Claude sessions | Updated Feb 25, 2026 |
| `CONTEXT.md` | Shared session context | Updated Feb 26, 2026 |
| `README.md` | Project readme | Last updated Feb 11 — may need refresh |
| `ROADMAP.md` | Product roadmap | Last updated Feb 16 — may need refresh |
| `buglist.md` | Bug tracker | Last updated Feb 12 — may need refresh |

### DEPRECATED — Old handoff docs, old prompts, superseded files

| File | Size | Reason |
|---|---|---|
| `HANDOFF.md` | 10.9 KB | Original handoff doc, superseded by CLAUDE.md + CONTEXT.md |
| `DESIGN_HANDOFF.md` | 11.1 KB | Design handoff from Feb 12, design system now implemented |
| `CLAUDE_CODE_HANDOFF.md` | 8.0 KB | Early handoff doc, superseded by CLAUDE.md |
| `CLAUDE_CODE_PROMPT.md` | 3.8 KB | Original session prompt, superseded by dated versions |
| `CLAUDE_CODE_PROMPT_2026-02-25.md` | 12.7 KB | Session prompt for Feb 25, superseded |
| `CLAUDE_CODE_PROMPT_2026-02-26.md` | 12.9 KB | Session prompt for Feb 26 S1, superseded |
| `CLAUDE_CODE_PROMPT_2026-02-26-S2.md` | 13.8 KB | Session prompt for Feb 26 S2, superseded |
| `sygnet-mvp-spec.md` | 0 bytes | Empty file — old project name |
| `db_production_dump.sql` | 1.3 MB | One-time database dump |

### GENERATED — Audit outputs

| File | Purpose |
|---|---|
| `AUDIT_RESULTS.md` | Database + codebase audit output |
| `CLAUDE_CODE_PROMPT_AUDIT.md` | Prompt for the audit session |
| `CLAUDE_CODE_PROMPT_CLEANUP_AUDIT.md` | Prompt for this cleanup audit |

### Summary: 14 ACTIVE, 5 GOVERNANCE, 9 DEPRECATED, 3 GENERATED

---

## Part 7: Staged Fixes Directory Audit

### Files Found (6)

| File | Target | Verdict |
|---|---|---|
| `HANDOFF.md` | Documentation | **Superseded** — describes a 6-step wizard rewrite (BUG-001/002/003). Current wizard is a 7-step split-layout wizard that evolved far beyond this. |
| `LAUNCH-SPRINT.md` | Planning artifact | **Superseded** — 5-task sprint plan for wizard restructure, admin management, deletion, 404 pages, vCard verification. All completed or surpassed. |
| `SetupWizard.tsx` | `src/app/dashboard/setup/SetupWizard.tsx` | **Superseded** — 845-line, 6-step inline wizard. Active version is 1100-line, 7-step modular wizard using shared editor section components. Not a single line remains. |
| `setup-route.ts` | `src/app/api/setup/route.ts` | **Superseded** — 184-line monolithic step-based save handler. Active version is a minimal 28-line route that only tracks step progress. All data saving moved to dedicated section-specific APIs. |
| `setup-page.tsx` | `src/app/dashboard/setup/page.tsx` | **Superseded** — 76-line server component loading full data. Active version is a lean 20-line component that only checks auth + plan. |
| `setup-additions.css` | Append to `src/styles/setup.css` | **Fully incorporated** — 197 lines appended verbatim to `setup.css` (lines 696-892). Character-by-character identical. Active CSS has grown beyond this (lines 893-1678). |

### Verdict

**All 6 files are fully superseded.** No unincorporated changes exist. The entire `staged-fixes/` directory can be safely deleted.

---

## Recommended Actions

### 1. Tables Safe to DROP

| Table | Reason |
|---|---|
| `sessions` | NextAuth DB sessions table. App uses JWT strategy — never read or written. 0 rows. |
| `verification_tokens` | NextAuth adapter table. App uses its own `email_verification_tokens` instead. 0 rows. |

**Note:** The `contacts` table is a placeholder for a planned CRM feature. Do NOT drop — the schema is intentional.

### 2. Files Safe to DELETE

| File/Directory | Reason |
|---|---|
| `staged-fixes/` (entire directory) | All 6 files fully superseded by current codebase |
| `src/app/dashboard/setup/SetupWizardNew.tsx` | Orphaned placeholder — nothing imports it. Spec comments should be preserved in an issue if the v2 rewrite is planned. |
| `src/app/p-8k3x/` (entire directory) | Legacy admin portal superseded by `dashboard/admin/`. All functionality rebuilt in modular components. |
| `src/app/api/p-8k3x/` (entire directory) | 6 deprecated API routes — exact duplicates of `/api/admin/*` |
| `src/app/api/auth/signout/` | Orphaned — app uses NextAuth's built-in signOut() |
| `src/app/api/showcase-items/` | Orphaned — full CRUD with zero callers. Showcase items loaded via `protected-pages/[pageId]` instead. |
| `sygnet-mvp-spec.md` | Empty file (0 bytes) — old project name |
| `db_production_dump.sql` | One-time dump, 1.3 MB |

### 3. Routes Safe to REMOVE

(Covered by file deletions above)

| Route | Reason |
|---|---|
| `/api/p-8k3x/*` (6 routes) | Exact duplicates of `/api/admin/*` |
| `/api/auth/signout` | Never called — app uses NextAuth signOut |
| `/api/showcase-items` | Zero client callers |

### 4. Files to MOVE (not delete)

| File | From | To |
|---|---|---|
| `044_cc_votes.sql` | `db/` | `db/migrations/` |
| `045_event_pod.sql` | `db/` | `db/migrations/` |
| `046_link_button_settings.sql` | `db/` | `db/migrations/` |

### 5. Things That Need Manual Review

| Item | Question |
|---|---|
| **Deprecated root docs** (HANDOFF.md, DESIGN_HANDOFF.md, CLAUDE_CODE_HANDOFF.md, CLAUDE_CODE_PROMPT.md, dated prompt files) | Archive to `docs/deprecated/` or delete outright? Some may have historical reference value. |
| **`db/init.sql` staleness** | init.sql is ~migration 039 vintage. It's missing columns from 040-051. Should it be regenerated from the current live schema? This affects fresh `docker compose down -v && up` resets. |
| **Audit output files** (AUDIT_RESULTS.md, CLAUDE_CODE_PROMPT_AUDIT.md, CLAUDE_CODE_PROMPT_CLEANUP_AUDIT.md) | Keep for reference or delete after context transfer to Claude.ai? |
| **README.md, ROADMAP.md, buglist.md** | All dated Feb 11-16. Should these be refreshed to reflect current state? |
