# Claude Code Handoff — Design System & UI Rebuild

**Date:** February 12, 2026
**Context:** Landing page, auth, and legal pages have been redesigned. Dashboard, setup wizard, and profile pages need to be rebuilt to match.

---

## Design System — Locked In

### Color Palette (Dark Navy + Warm Gold)

```css
--bg: #0c1017;           /* Page background */
--bg-lighter: #111621;   /* Alternating section bg */
--surface: #161c28;      /* Cards, inputs, panels */
--surface-2: #1b2233;    /* Elevated surfaces */
--surface-3: #212a3d;    /* Hover/active surfaces */
--text: #eceef2;         /* Primary text */
--text-mid: #a8adb8;     /* Secondary text */
--text-muted: #5d6370;   /* Labels, hints */
--accent: #e8a849;       /* Buttons, links, highlights */
--accent-hover: #f0b85e; /* Button hover state */
--accent-glow: rgba(232, 168, 73, 0.06);  /* Subtle glow backgrounds */
--accent-border: rgba(232, 168, 73, 0.14); /* Accent-tinted borders */
--border: #1e2535;       /* Default borders */
--border-light: #283042; /* Lighter borders, input borders */
```

### Fonts

- **Body/UI:** Inter (loaded via `next/font/google` in layout.tsx as `--font-sans`)
- **Headlines:** Instrument Serif (loaded via `next/font/google` in layout.tsx as `--font-serif`)
- **Logo:** Inter, 700 weight, all caps, letter-spacing 0.2em

Both fonts are already configured in `src/app/layout.tsx` with CSS variables and className applied to `<body>`.

### Logo

The Imprynt logo is a wordmark + icon mark:
- **Mark:** Circle (2px border, accent color) with a centered dot (accent color). Used for favicon, small contexts.
- **Wordmark:** "IMPRYNT" in Inter Bold, all caps, 0.2em letter-spacing
- **Combined:** Mark + wordmark side by side, 0.5rem gap

CSS for the mark:
```css
.logo-mark {
  width: 26px; height: 26px;
  border-radius: 50%;
  border: 2px solid var(--accent);
  display: flex; align-items: center; justify-content: center;
}
.logo-mark::after {
  content: ''; width: 6px; height: 6px;
  border-radius: 50%; background: var(--accent);
}
```

### Component Patterns

- **Buttons (primary):** `background: var(--accent)`, `color: var(--bg)`, `border-radius: 2rem`, font-weight 600
- **Buttons (ghost):** `background: transparent`, `border: 1px solid var(--border-light)`, `color: var(--text-mid)`, `border-radius: 2rem`
- **Cards:** `background: var(--surface)`, `border: 1px solid var(--border)`, `border-radius: 1rem`, hover: `border-color: var(--accent-border)`
- **Inputs:** `background: var(--bg)`, `border: 1px solid var(--border-light)`, `border-radius: 0.5rem`, focus: `border-color: var(--accent)`
- **Labels:** `font-size: 0.8125rem`, `font-weight: 500`, `color: var(--text-mid)`
- **Section labels:** `font-size: 0.6875rem`, `font-weight: 600`, `text-transform: uppercase`, `letter-spacing: 0.16em`, `color: var(--text-muted)`
- **Section headlines:** `font-family: var(--serif)`, `font-weight: 400`

### Existing CSS Files

- `src/styles/landing.css` — Landing page (complete)
- `src/styles/auth.css` — Auth pages: login, register, forgot-password, reset-password (complete)
- `src/styles/legal.css` — Terms, privacy pages (complete)

---

## What Needs to Be Built / Rebuilt

### 1. Setup Wizard (Priority: High)

**Current state:** Basic multi-step form with old light theme inline styles. Needs full redesign.

**Location:** `src/app/dashboard/setup/page.tsx`

**Requirements:**

The setup wizard should guide new users through building their profile. Steps:

1. **What's your name?** — First name, last name fields
2. **What do you do?** — Title/role, company/organization (optional)
3. **Pick a template** — Visual preview cards of 4-5 template options (see Templates below)
4. **Customize your look** — Primary color picker, accent color picker, profile photo upload
5. **Add your links** — Select from available link types, enter URLs/info, drag-and-drop reorder
6. **Review and publish** — Live preview of finished page, confirm button

**UX notes:**
- Progress indicator showing current step
- Back/Next navigation
- Should feel polished, not like a boring form
- Match the dark navy design system
- Step 3 (template selection) should show visual preview cards that update when you hover/click

### 2. Profile Templates (Priority: High)

**5 templates at launch, each visually distinct:**

1. **Clean/Minimal** — Light background, simple typography, card-style layout
2. **Dark/Premium** — Dark background, light text, modern and sleek
3. **Bold/Creative** — Bright accent colors, larger typography, more personality
4. **Classic/Professional** — Traditional business card feel, structured layout
5. **Warm/Personal** — Softer colors, rounded elements, approachable

**Template customization (paid tier):**
- Primary color
- Accent color
- Font selection (2-3 font pairs)

**Template customization (free tier):**
- Limited to 2 templates (Clean/Minimal and Dark/Premium)
- Primary color only

**All templates must:**
- Be mobile-first and responsive
- Have consistent content placement (switching templates shouldn't break the page)
- Load fast (under 2 seconds on mobile)
- Support the three-layer profile structure (see below)

### 3. Profile Page Structure (Priority: High)

**Three layers (decided in previous session):**

**Layer 1 — Public Profile (everyone sees this)**
- Profile photo
- Name, title, bio (~200 chars)
- Link buttons (LinkedIn, website, email, phone, social, custom URL, etc.)
- Save Contact (vCard download) button
- Content sections (user-created blocks with title, body, optional image)
  - Free tier: 2 sections max
  - Paid tier: 4 sections max
- Showcase items that are marked as public (see Layer 2)
- Template-driven layout
- Impression icon (subtle, customizable — see below)

**Layer 2 — Portfolio/Showcase (PIN-gated, visible button on profile)**
- Labeled button on profile (user names it, e.g., "Projects", "Listings")
- Tapping prompts for PIN
- Contains typed showcase items:
  - **Project** — title, description, image, URL, tags, status
  - **Listing** — title, address/location, price, status (active/pending/sold), image, details
  - **Service** — title, description, pricing, booking link
  - **Event** — title, date, location, description, RSVP/ticket link
- Each item has a public/private toggle (public items appear on Layer 1)
- User can have multiple items of different types

**Layer 3 — Impression (hidden, Easter Egg replacement)**
- No visible indication on profile unless user configures the icon
- The "Impression icon" is the circle-dot logo mark
- User customizes: color, opacity (subtle/visible/bold), corner placement (4 options)
- Tapping the icon prompts for a separate PIN
- Contains personal content: personal email, phone, Instagram, Spotify, personal note, whatever they want
- Same link type options as public profile

**PIN behavior:**
- Single PIN entry field on the profile
- The PIN entered determines which page loads (portfolio vs impression)
- Each layer has its own unique 4-6 digit PIN
- Failed attempts: lock out after 5 attempts for 15 minutes
- PINs stored as salted hashes, content encrypted at rest

**Database note:** The existing `protected_pages` table should support this. Each user can have multiple protected pages with fields: user_id, page_title, visibility_mode (hidden/visible), pin_hash, content (encrypted), display_order, active flag.

### 4. Dashboard Rebuild (Priority: Medium)

**Current state:** Basic inline-styles light theme. Needs redesign to match dark navy system.

**Sections:**
- **My Profile** — Edit bio, name, title, photo, manage links (add/remove/reorder), switch template, customize colors, preview
- **Content Sections** — Add/edit/remove content blocks (title, body, optional image)
- **Showcase** — Add/edit typed showcase items, set public/private per item
- **Impression Settings** (paid) — Enable/disable, set PIN, edit content, customize icon (color, opacity, corner)
- **Portfolio Settings** (paid) — Enable/disable, set PIN, set button label, manage which showcase items are included
- **Analytics** (paid, basic V1) — Total views, views over time (30 day chart), last viewed
- **Account** — Email/password, subscription management (Stripe portal), ring shipping status, delete account

### 5. Framework Migration (Priority: Medium)

**Recommendation from design session:** Migrate dashboard and editor to **shadcn/ui + Tailwind CSS**.

**Rationale:**
- Current inline styles can't handle responsive breakpoints, hover states, animations
- shadcn/ui gives proper accessible components (dialogs, dropdowns, tabs, toggles, color pickers)
- Tailwind handles responsive design, dark theme, consistent spacing
- Profile pages stay custom CSS for creative control per template

**If not migrating to shadcn/ui immediately**, at minimum create a `src/styles/dashboard.css` file using the same design token pattern as auth.css and landing.css.

---

## Naming Changes

- **"Easter Egg" is now "Impression"** throughout all UI, copy, and code
  - The hidden personal layer is called an "Impression"
  - Marketing copy: "Leave an Impression"
  - The icon trigger is the circle-dot mark (same as logo mark)
  - User customizes: color, opacity, corner placement
  - Database/code can keep internal naming as `protected_pages` with `visibility_mode: 'hidden'`

---

## File Structure Reference

```
src/
  app/
    page.tsx                    ✅ Landing page (redesigned)
    layout.tsx                  ✅ Fonts loaded (Inter + Instrument Serif)
    (auth)/
      login/page.tsx            ✅ Redesigned
      register/page.tsx         ✅ Redesigned
      forgot-password/page.tsx  ✅ Redesigned
      reset-password/page.tsx   ✅ Redesigned
    terms/page.tsx              ✅ Redesigned
    privacy/page.tsx            ✅ Redesigned
    dashboard/
      page.tsx                  ❌ Needs redesign
      setup/page.tsx            ❌ Needs full rebuild
      profile/                  ❌ Needs redesign
      showcase/                 ❌ Needs redesign
      easter-egg/               ❌ Rename to impression, redesign
      account/                  ❌ Needs redesign
      SignOutButton.tsx          ❌ Needs restyling
    [slug]/                     ❌ Profile page — needs template system
    r/                          ✅ NFC redirect handler (functional)
    api/                        ✅ Backend routes (functional)
  styles/
    landing.css                 ✅ Complete
    auth.css                    ✅ Complete
    legal.css                   ✅ Complete
    dashboard.css               ❌ Needs creation
```

---

## MVP Spec Reference

The full product spec is at `/mnt/project/sygnet-mvp-spec.md` (or `D:\Docker\imprynt\sygnet-mvp-spec.md` in the project root). It covers all features, pricing, technical architecture, and database design in detail.

## Previous Handoff

There is an earlier handoff doc at `D:\Docker\imprynt\CLAUDE_CODE_HANDOFF.md` covering the initial MVP build (auth, vCard system, contact fields, token-gated downloads). That work is complete. This handoff covers the design system and UI rebuild phase.
