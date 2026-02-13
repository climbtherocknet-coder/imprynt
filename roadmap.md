# Imprynt Platform Roadmap

**Last updated:** February 12, 2026
**Maintained by:** Tim Kline

This is the living roadmap for the Imprynt platform (trysygnet.com / imprynt.io). Items are grouped by priority and effort. Each item has a status, tier impact, and brief rationale.

**Status key:** `planned` | `in-progress` | `blocked` | `done` | `deferred`

---

## V1 Polish (Pre-Launch / Launch Critical)

These need to ship before or immediately at launch.

### 1. Setup Wizard Overhaul
**Status:** planned
**Effort:** Medium
**Tier:** All users

The current wizard is functional but bare-bones and still references the old 5-template system. Needs:

- **Photo upload step.** Users currently can't upload a profile photo during onboarding. This is a gap, the profile preview in step 6 shows initials only. Add photo upload between the "About" step and the "Template" step (new step 3 of 7).
- **Updated template picker.** Wizard still shows `dark`, `bold`, and the old 5-template list. Replace with the 10-template system. Show free templates to all users, premium templates with lock + upgrade nudge for free users. Use mini preview cards that reflect actual template colors/fonts.
- **Font pair selector update.** Current wizard offers generic "Modern/Classic/Technical" font pairs disconnected from the template system. Either remove this (let the template drive fonts) or make it template-aware.
- **Visual polish.** The wizard works but lacks personality. Consider: subtle animations between steps, a more dynamic live preview that updates as you fill in fields, progress step labels (not just a bar), and a celebratory moment on publish (confetti, animation, something that makes it feel like a milestone).
- **Post-setup guided tour.** After publishing, show a lightweight walkthrough that highlights key dashboard features: "Here's where you edit your profile," "Add content blocks here," "This is your Impression page." Tooltip-style popovers that step through 4-5 key areas, dismissable, shown once.

### 2. Profile On/Off Toggle ("On Air")
**Status:** planned
**Effort:** Small
**Tier:** Paid only

Paid users should be able to take their profile offline without deleting it. When toggled off:
- Profile URL returns a branded "This profile is currently offline" page (not a 404)
- NFC ring taps show the same offline page
- Dashboard shows clear "Your profile is offline" indicator
- All content preserved, just not publicly visible

Implementation: `is_live` boolean on `profiles` table (default true). Toggle in dashboard header or profile settings. Offline page should still use the user's template colors for brand consistency.

Naming options: "On Air" toggle, "Live" toggle, or just "Profile Visibility." "On Air" has personality.

### 3. Link Preview Component Reevaluation
**Status:** planned
**Effort:** Medium
**Tier:** All users

The current link preview pod (`link_preview` type) fetches OG metadata from URLs. Needs a full review:
- Evaluate reliability of current OG fetching (bot detection issues, timeouts, missing metadata)
- Consider server-side fetching with caching vs. client-side
- Manual fallback UX when auto-fetch fails (user provides title, description, image manually)
- Rate limiting and error handling
- Whether this should be a pod type, a link enhancement, or both
- Performance impact on profile load times

---

### 4. Profile Photo Lightbox with Save Contact
**Status:** planned
**Effort:** Small
**Tier:** All users

When a visitor taps/clicks the profile photo on the public page, open a floating lightbox with:
- Larger version of the photo (centered, rounded, maybe 280-320px)
- Person's name below the photo
- "Save Contact" button directly below
- Tap outside or X to dismiss
- Subtle backdrop blur overlay

This gives the photo more presence (especially on mobile where the hero photo is small) and puts the save action in a natural, prominent spot. The existing save button in the hero stays too, this is an additional touchpoint.

Implementation: modal/overlay component in `ProfileTemplate.tsx`, triggered by click on `.photo`. Use the template's CSS variables for consistent theming. Animate in with a scale + fade.

---

## V1.5 Features (Post-Launch, Near-Term)

### 5. Icon-Only Link Mode
**Status:** planned
**Effort:** Small
**Tier:** Paid only

Premium users get a fourth link display style: `icons-only`. Links render as a horizontal row of small circles (or rounded squares, matching the template's photo shape) containing just the link type icon. No labels, no backgrounds, just a tight row of recognizable icons.

Behavior:
- Each link type already has an icon defined in `LINK_ICONS` in `themes.ts`
- Icon circles: ~36-40px, border-only or subtle fill, accent color on hover
- Tooltip on hover (desktop) showing the link label
- Custom links that don't have a recognizable icon fall back to a generic arrow or the first letter of the label
- Works well with templates that have a lot of links, keeps the hero compact
- User toggles this in dashboard under link display settings

Implementation: Add `icons` to the `linkStyle` union type in `TemplateTheme`. New `link-icons` CSS block. Dashboard toggle: "Link style" selector with visual previews (Pills / Stacked / Full Width / Icons Only, last one premium-gated).

Consider: the existing link style is template-driven. This feature would let the user override per-profile, or we add it as a modifier that any template can opt into. Recommend user override, stored on profiles table.

### 6. Resume/Document Upload
**Status:** planned
**Effort:** Medium
**Tier:** Paid only

Premium users can upload a resume or professional document (PDF) and optionally expose it as a link on their profile. Use cases: resume, CV, media kit, pitch deck, one-pager, portfolio PDF.

Behavior:
- Upload up to 5MB per file, PDF only (consider expanding to DOCX later)
- Stored in the platform (local filesystem or S3-compatible object storage)
- User toggles whether the document appears as a link on their public profile
- If enabled, renders as a link button (e.g., "View Resume", "Download CV") with a document icon
- User sets the button label
- Link serves the file through a platform route (not a direct storage URL) for access control and download tracking
- Analytics: track how many times the document was viewed/downloaded (paid analytics feature)
- User can replace or delete the upload at any time

Database:
- `documents` table: `id`, `user_id`, `profile_id`, `filename`, `original_filename`, `file_size`, `mime_type`, `label` (button text), `show_on_profile` (boolean), `download_count`, `created_at`, `updated_at`
- Or simpler: add `resume_url`, `resume_label`, `resume_show` columns to profiles table if we want to keep it to one document for V1

Storage considerations:
- V1: store on the Hetzner VPS filesystem in a `/uploads/documents/` directory, served through an API route
- V2: migrate to S3-compatible storage (Cloudflare R2, Backblaze B2, or Hetzner Object Storage) for durability and CDN
- Set max file size at 5MB, enforce server-side
- Virus/malware scanning is a nice-to-have but probably overkill for V1 with PDF-only uploads

Dashboard: "Documents" section or integrate into the profile editor. Upload button, preview of current file, toggle for visibility, label editor.

### 7. Status Badge Customization
**Status:** planned
**Effort:** Small
**Tier:** Paid only

Let paid users customize the color of their status badges (Open to Work, Hiring, etc.). Currently badges use `--accent-soft` and `--accent` from the template. Options:
- Preset color palette for badges (green, blue, amber, coral, etc.)
- Custom hex color picker
- Per-badge color or one color for all badges
- Store as `status_tag_color` on profiles table or in a settings JSON column

### 8. Impression Page Photo
**Status:** planned
**Effort:** Small
**Tier:** Paid only

Allow paid users to set a separate profile photo for their Impression (personal/protected) page. Use case: business photo on the public profile, casual photo on the personal layer. Implementation:
- `impression_photo_url` column on `protected_pages` table
- Toggle in Impression editor: "Use a different photo" with upload
- Falls back to main profile photo if not set
- Separate upload endpoint or reuse existing photo upload with a `target` parameter

### 9. Enhanced Theme Customization
**Status:** planned
**Effort:** Medium-Large
**Tier:** Paid only (expanded), Free (limited)

Current customization is accent color only. Expand for paid users:

**V1.5 scope:**
- Accent color (already exists)
- Background color override (tint/shift the template's base palette)
- Text color override (dark/light adjustment)
- Custom accent for CTA buttons (separate from link accent)

**Viewer light/dark mode toggle (Premium):**
Premium profiles get a small sun/moon toggle in the corner. Viewer can switch between the template's default mode and an inverted version. Implementation approach:
- Each template defines both a light and dark variant
- Light templates get a dark variant, dark templates get a light variant
- CSS variables swap on toggle, stored in viewer's localStorage (not the profile owner's setting)
- The toggle is a viewer preference, not a profile setting
- Significant CSS work: every template needs a complementary palette
- Consider shipping for 2-3 templates first, expanding later

This is the single largest item on the roadmap. Break it into phases:
1. Additional color customization controls (accent, bg tint, text)
2. Light/dark variants for dark premium templates (Midnight, Noir, Studio, Dusk)
3. Light/dark variants for light premium templates (Editorial, Signal)
4. Viewer toggle UI

### 10. Site-Wide Light/Dark Mode
**Status:** planned
**Effort:** Medium
**Tier:** All users

The marketing site, auth pages, dashboard, and admin console should support system-preference dark/light mode with a manual toggle. Currently everything is dark (navy). Needs:
- CSS variable system for the dashboard/chrome (separate from profile template variables)
- `prefers-color-scheme` media query as default
- Manual toggle stored in localStorage
- Landing page, auth, legal, dashboard, admin, setup wizard all need both palettes
- Lower priority than profile-facing features but improves overall polish

### 11. User Onboarding Guide / Tutorial
**Status:** planned
**Effort:** Medium
**Tier:** All users

After setup wizard completion, guide users through the dashboard with a tooltip-based walkthrough:
- "Welcome to your dashboard" intro
- Point to: Profile editor, Content blocks (pods), Showcase items, Impression page (paid), Analytics (paid)
- 4-6 steps, each a positioned tooltip with "Next" / "Skip" / "Done"
- Show once per account, with option to replay from settings
- Consider a library like Shepherd.js, Intro.js, or build lightweight custom
- Could also add contextual help icons (?) next to key features that expand with explanations

### 12. Multiple Protected Pages
**Status:** planned (per spec)
**Effort:** Medium
**Tier:** Paid only

V1 ships with one protected page (Impression). V1.5 unlocks multiple pages, each with its own PIN, content, and visibility mode. Database already supports this (protected_pages table). UI needs:
- "Add another page" in dashboard
- Per-page PIN management
- Per-page visibility mode (hidden vs. visible link)
- Universal PIN entry that routes to correct page

### 13. AI-Assisted Onboarding
**Status:** planned (per spec)
**Effort:** Medium
**Tier:** All users

Alternative onboarding path: "Let AI help me." User provides a prompt or LinkedIn URL, AI generates bio, suggests links, recommends template. Review and edit before publishing. Requires LLM API integration (cost per generation).

### 14. Enhanced Analytics
**Status:** planned (per spec)
**Effort:** Medium
**Tier:** Paid only

- Geographic breakdown (city-level)
- Referral source (NFC tap vs. link share vs. QR)
- Most-clicked links
- Impression access attempts and successes
- Time-series charts

---

## V2 Features (Growth Phase)

### Contact Rolodex / CRM — "The Network"
This is the long game. Imprynt isn't just a profile tool, it's a networking platform. The Rolodex turns every tap, every card scan, every meeting into a living contact that stays current.

**Core concept:** Your contacts aren't static entries. If someone you met is also on Imprynt, their info updates automatically when they change jobs, numbers, or titles. No more stale business cards. Your network stays alive.

**How contacts get added:**
1. **Mutual tap (Imprynt-to-Imprynt):** Two Imprynt users tap each other's rings. Both get added to each other's Rolodex automatically. Mutual connection, both sides confirmed. This is the magic moment.
2. **Business card scan (OCR):** Snap a photo of a physical business card. OCR extracts name, title, company, phone, email, address. User reviews and confirms before saving. Handles messy layouts, vertical cards, non-English text (stretch goal).
3. **Manual entry:** Traditional add-a-contact form. Name, company, phone, email, notes.
4. **Profile save (inbound):** When a non-Imprynt visitor taps "Save Contact" on your profile, you get a record that someone saved your info (anonymous unless they're an Imprynt user). Paid analytics shows volume.

**Living contacts:**
- If a contact is an Imprynt user, their Rolodex entry is linked to their profile
- When they update their info (new job, new number, new photo), your copy updates automatically
- Visual indicator: "Connected on Imprynt" badge vs. "Manual contact"
- You always see their latest public info without them having to re-send anything
- This is the core value prop that makes Imprynt sticky, your network never goes stale

**Rolodex features:**
- Contact list with search, filter by tag/date/source
- Per-contact notes field ("Met at SXSW, interested in partnership", "Follow up re: Series A")
- Tags/labels ("investor", "client", "friend", "conference-2026")
- Source tracking: how you met (mutual tap, card scan, manual, event)
- Date met / last interacted timestamps
- Favorite/star contacts for quick access
- Contact groups for organizing by context
- Export as CSV or vCard bundle
- Merge duplicates (same person, multiple entries from different sources)

**Business card scanner:**
- Camera capture in mobile app (V2) or photo upload in web dashboard
- OCR pipeline: image → text extraction → field parsing (name, title, company, phone, email, address)
- Review screen: show extracted fields, let user correct before saving
- Store the original card image alongside the contact record
- Handle edge cases: vertical cards, logos over text, multiple phone numbers, non-standard layouts
- Consider: Google Cloud Vision API, Tesseract (open source), or a dedicated card scanning API
- Batch scan mode: photograph a stack of cards from a conference, process them all

**Social graph (future):**
- Mutual connections visible ("You both know 3 people")
- Introduction requests through mutual contacts
- Activity feed: "Jane updated her title", "You met 5 new people this month"
- Network stats: total connections, growth over time, most active month
- This is where Imprynt becomes a lightweight professional social network, not competing with LinkedIn on content, but owning the real-world connection layer

**Why this matters:** The Rolodex is the retention engine. Profiles get people in the door. The Rolodex keeps them coming back. Every contact added increases switching cost. Every mutual connection strengthens the network effect. This is what turns Imprynt from a tool into a platform.

### LinkedIn Import
OAuth integration, pull profile data to auto-populate Imprynt profile.

### Mobile App
iOS + Android. Ring reprogramming, dashboard, push notifications, card scanner.

### Custom Domains
Users point their own domain to their profile. CNAME + automated SSL.

### Team/Enterprise Plans
One account, many users. This is the big unlock for sales teams, brokerages, agencies, and any org that wants consistent branding across their people.

**Core concept:** An organization admin creates a company account, sets the brand (template, colors, logo), and invites team members. Each member gets their own profile but inherits the company's visual identity. Admin can enforce or allow overrides.

**Key features:**
- Org-level admin dashboard (invite/remove members, manage billing, view aggregate analytics)
- Company-managed templates: lock template + colors across all member profiles, or allow member customization within guardrails
- Bulk accessory ordering: order rings/bands for the whole team, ship to office or individual addresses
- Shared contact fields: company name, address, main phone auto-populated on all member profiles
- Member roles: admin (full control), manager (can view team analytics, manage members), member (own profile only)
- Team directory page: optional public or PIN-gated page listing all team members
- Aggregate analytics: total views across team, most-viewed members, link click breakdown
- Onboarding flow: admin sends invite link, member signs up with pre-populated company info and locked template
- Billing: single invoice, per-seat pricing, annual contracts
- SSO/SAML (V3): enterprise auth integration

**Pricing model (TBD):**
- Per-seat monthly/annual pricing (e.g. $8-12/seat/month)
- Volume discounts at 10+, 25+, 50+ seats
- Accessories billed separately or bundled
- Custom enterprise pricing for 100+ seats

**Why this matters:** Enterprise/team is the highest-LTV segment. One sale = dozens of seats with predictable recurring revenue. Real estate brokerages, sales orgs, and consulting firms are natural early targets.

### Internal Messaging System
Start simple, build the rails for something bigger.

**Phase 1: Admin Notifications (V2)**
One-way messaging from Imprynt admins to users. Think system announcements, feature updates, maintenance notices, account-specific alerts.

- Admin composes a message in the admin dashboard
- Target: all users, paid users only, specific user, or custom segment
- Message appears in a notification inbox in the user's dashboard (bell icon, unread count badge)
- Messages are persistent (not toast notifications that disappear)
- Supports: plain text, basic markdown, optional CTA button ("Check it out" linking to a feature/page)
- Read/unread tracking per user
- Admin can see delivery stats (sent to X users, Y read)
- Optional: email notification for important messages ("You have a new message from Imprynt")

Database:
- `messages` table: id, sender_id, subject, body, message_type (system/admin/direct), cta_url, cta_label, target_audience (all/paid/free/specific), created_at
- `message_recipients` table: id, message_id, user_id, read_at, delivered_at
- This schema supports both broadcast and targeted messages from day one

**Phase 2: User-to-User Chat (V2/V3, builds on Rolodex)**
Once the Rolodex exists and users have mutual connections, open the messaging layer for direct messages between connected users.

- Only between mutual Rolodex connections (both users must have each other saved)
- Simple chat: text messages, no media/attachments for V1 of this feature
- Conversation threads, not email-style (real-time feel, even if not literally real-time)
- Unread indicators in the Rolodex and main nav
- Push notifications in mobile app (V2)
- No group chat initially, just 1:1
- Message history persists, searchable
- Block/mute per conversation
- Same `messages` + `message_recipients` tables, just with message_type = 'direct' and sender_id = a real user instead of admin

**Why build the admin channel first:** It's simpler (one-way, no real-time requirements), immediately useful (you need to talk to your users), and it lays the database schema and UI patterns (inbox, unread badges, message rendering) that user-to-user chat will reuse. Build it once, extend it.

**What this is NOT:** This isn't Slack. This isn't a social feed. It's a lightweight messaging layer that keeps communication inside the platform instead of leaking to email or LinkedIn DMs. The goal is to keep users in the Imprynt ecosystem.

### API Access
Public API, webhook notifications, CRM integrations (Salesforce, HubSpot).

---

### Admin User Management
The admin dashboard currently shows user lists and details but has no action capabilities. Admins need full control over user accounts.

**User actions (V1, launch critical):**
- **Disable/suspend:** Toggle account off. Profile goes offline, user can't log in, data preserved. Reversible. Use case: abuse, billing disputes, temporary holds.
- **Re-enable:** Reverse a suspension. Account restored, profile goes live again.
- **Delete account:** Full cascade delete, same as user self-delete but admin-initiated. Confirmation required. Irreversible. Removes: user, profile, pods, links, protected pages, contact fields, analytics, accessories, documents.
- **Edit user details:** Change email, name, plan (upgrade/downgrade manually), reset password (trigger reset email).
- **Force plan change:** Override plan to free/premium without going through Stripe (for comps, testing, special cases).
- **View as user:** Open user's profile in a new tab to see exactly what visitors see.

**Account status model:**
- `active` (default, everything works)
- `suspended` (admin disabled, profile offline, can't log in, data preserved)
- `deleted` (hard delete, data gone)
- Add `account_status` column to users table (varchar, default 'active')
- Auth check: if status != 'active', deny login and show appropriate message
- Profile rendering: if status != 'active', show offline/unavailable page

**Admin roles (V1.5):**
- `super_admin` (full access, can manage other admins)
- `admin` (user management, invite codes, analytics, content moderation)
- `support` (read-only user details, can trigger password resets, can't delete or change plans)
- Store in `admin_role` column on users table or a separate `admin_roles` table
- Current `isAdmin()` check is email-based, migrate to role-based

**Admin audit log (V2):**
- Log every admin action: who did what to whom, when
- `admin_audit_log` table: id, admin_user_id, action, target_user_id, details (JSON), created_at
- Viewable in admin dashboard, filterable by action type and admin
- Important for accountability when multiple admins exist

**API endpoints needed:**
- `PATCH /api/admin/users/[userId]` - edit user fields (email, name, plan)
- `POST /api/admin/users/[userId]/suspend` - suspend account
- `POST /api/admin/users/[userId]/reactivate` - reactivate account
- `DELETE /api/admin/users/[userId]` - delete account (cascade)
- `POST /api/admin/users/[userId]/reset-password` - trigger password reset email

### Free Tier Signup CTA (Viral Loop)
Free profiles already have the "Powered by Imprynt" watermark. Make it a conversion tool, not just branding.

**On free user profiles, add a subtle but clear CTA:**
- Below the watermark or integrated into it: "Get your free Imprynt profile" linking to trysygnet.com/register
- When a visitor taps a free user's ring and sees their profile, there should be a gentle nudge to sign up
- This turns every free user into a distribution channel. Their profile is an ad for the platform.

**Implementation options (pick one or test both):**
1. **Watermark upgrade:** Expand the existing "Powered by Imprynt" badge to "Create your free profile → imprynt.io" with a subtle arrow or link styling
2. **Bottom banner:** A thin, dismissable banner at the bottom of free profiles: "Like this? Create your own Imprynt profile for free." with a signup button. Appears after 3 seconds or on scroll. Stores dismissal in sessionStorage so it doesn't nag.
3. **Post-save CTA:** After a visitor taps "Save Contact" on a free profile, show a success message + "Want your own digital business card? Create a free Imprynt profile." This is the highest-intent moment.

**Where to link:** trysygnet.com/register with a referral parameter (?ref=USER_SLUG or ?ref=USER_ID) so you can track which free users are driving signups. This data feeds into future referral program.

**Paid users:** No CTA, no banner, no signup nudge. Clean experience, that's part of what they're paying for.

---

## Identified Gaps (From Feb 12 Audit)

These are gaps found during a cross-reference of the codebase, roadmap, MVP spec, and user journey analysis.

### GAP-0: Free Tier Monetization (Ads + Watermark)
**Severity:** Medium (revenue/brand)
**Tier:** Free users

Free tier needs two things that aren't implemented yet:

**1. Bigger Imprynt Watermark:** Current watermark is 10px, 35% opacity, and easy to miss. For free users it should be a more prominent brand element, not obnoxious but clearly visible. Think "Powered by Imprynt" with logo mark, styled as a fixed footer badge or bottom-of-page banner. This doubles as free advertising for the platform.

**2. Ad Support:** The spec calls for ad-supported free tier. Not needed for V1 launch (per spec recommendation to skip until 1,000+ free users), but the profile template needs a designated ad slot so it can be activated later without re-architecting the page. Plan for a single ad unit, likely a banner between pods or at the bottom of the profile above the watermark.

Phased approach:
- V1 launch: Bigger watermark only. No ads.
- V1.5 (1,000+ free users): Activate ad slot. Google AdSense or similar.
- The ad slot should be template-aware (styled to not clash with each theme).

Implementation:
- Watermark: Update `.watermark` in profile.css and the JSX in ProfileTemplate.tsx
- Ad slot: Add a conditional `<div className="ad-slot">` in ProfileTemplate.tsx, hidden by default, enabled via feature flag or config

### GAP-1: No QR Code Sharing
**Severity:** Medium
**Tier:** All users

The spec mentions "Shareable via link or QR code" for free users, but there's no QR code generation anywhere in the platform. Free users without a ring need a way to share their profile. This is probably the most important gap for free-tier adoption.

Fix: Generate a QR code for each profile URL. Show it in the dashboard (downloadable PNG/SVG). Could also make it available as a vCard-embedded QR or a printable card layout.

### GAP-2: No Email Verification Flow
**Severity:** Medium (launch blocker for trust)
**Tier:** All users

The spec calls for email verification after registration. The `email_verified` column exists on the users table but there's no verification email flow visible in the codebase. Registration works but emails aren't confirmed. This matters for: preventing fake accounts, spam prevention, and building trust.

Fix: Implement email verification. Options: verification link on register, or defer to V1.5 if using invite-only (since invite codes partially gate this). At minimum, log a warning for unverified accounts.

### GAP-3: No Slug Rotation
**Severity:** Low-Medium
**Tier:** Paid only

The spec and schema support URL slug rotation (randomize your profile URL on demand or on a schedule). `slug_rotated_at` column exists on profiles. But there's no UI for this in the dashboard and likely no API endpoint. This is a privacy feature for users who want to invalidate old links.

Fix: Add "Rotate URL" button in profile settings or account settings. Generate new random slug, update the profile, old slug returns 404.

### GAP-4: No vCard Download on Public Profile
**Severity:** Medium
**Tier:** All users

The profile template has a "Save Contact" button that links to `/api/vcard/{profileId}`, but need to verify this actually works end-to-end and generates a proper vCard. The contact_fields system is built but may not be wired to the public vCard endpoint correctly. If a visitor taps Save Contact and nothing happens, that's a terrible first impression.

Fix: End-to-end test the vCard download flow. Ensure it works on iOS Safari, Android Chrome, and desktop browsers.

### GAP-5: No Link Click Tracking
**Severity:** Low
**Tier:** Paid only (analytics feature)

The analytics_events table supports `link_click` events, but there's no client-side tracking implemented. When a visitor clicks a link on someone's profile, it should log an event. This feeds into the enhanced analytics feature (roadmap #14) but the basic plumbing should be in place for launch.

Fix: Wrap link clicks in a tracking handler that fires a POST to an analytics endpoint before navigating.

### GAP-6: No Account Deletion Flow
**Severity:** Medium (legal/compliance)
**Tier:** All users

The spec calls for account deletion with confirmation. The privacy policy promises data deletion within 30 days. Need to verify there's a working delete account flow in the dashboard/account settings.

Fix: Verify or build the account deletion flow. Cascade delete all user data (profiles, pods, links, protected pages, analytics, accessories, contacts).

### GAP-7: No Error/404 Pages
**Severity:** Low-Medium
**Tier:** All users (visitor-facing)

When someone visits a dead slug, expired link, or invalid URL, they likely get a generic Next.js error page. Should have branded 404 and error pages that look like they belong to the platform.

Fix: Create `/app/not-found.tsx` and `/app/error.tsx` with Imprynt branding. For dead profile slugs specifically, show a "This profile doesn't exist or has been moved" page with a link to trysygnet.com.

### GAP-8: No Password Strength Requirements
**Severity:** Low
**Tier:** All users

Registration likely accepts any password. Should enforce minimum requirements (8+ chars, etc.) both client-side and server-side.

### GAP-9: FAQ / Trust Page
**Severity:** Medium (trust/conversion)
**Tier:** All users (public-facing)

There's a privacy policy and terms page, but no user-friendly FAQ that explains how the platform works, how data is protected, and answers common questions. This is a trust signal for potential users evaluating the product. See detailed spec below.

---

## Parking Lot (Ideas, Not Committed)

- QR code generator for profiles (share without ring)
- Profile analytics email digest (weekly summary)
- Social proof: "X people saved your contact this week"
- Seasonal/event templates (conference mode, holiday)
- Profile versioning (A/B test different bios/layouts)
- Referral program (invite friends, earn credit)
- White-label option for agencies/resellers
- Embeddable profile widget for websites
- Profile password protection (beyond PIN, full password gate)
- Accessibility audit and WCAG compliance certification
