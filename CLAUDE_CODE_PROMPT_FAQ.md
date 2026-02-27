# Claude Code Prompt — February 26, 2026 (FAQ/Trust Page)

Read `CLAUDE.md` first. Follow all rules.

This prompt creates a public FAQ/Trust page at `/faq` that serves as a conversion tool for visitors who want to understand what Imprynt is before signing up.

---

## Context

The FAQ page should answer the questions a skeptical visitor would have after seeing an Imprynt profile or landing on the site. It's not a support page. It's a trust-building page that closes the gap between "what is this?" and "I'll sign up."

Key audience: someone who just tapped an NFC ring or saw someone's Imprynt profile and thought "I want one of those" but needs reassurance before creating an account.

---

## Task 1: Create the FAQ Page

Create `src/app/faq/page.tsx`.

Use the same layout pattern as the legal pages (terms, privacy): `legal-page` wrapper, `legal-nav` header with Imprynt logo link, `legal-content` main area. Import `@/styles/legal.css` for base styling.

Also import a new `@/styles/faq.css` for FAQ-specific styles (accordion, trust section).

### Page Structure

```
Nav (logo link to /)
Hero section
  Headline: "How Imprynt works"
  Subtext: Brief one-liner about the platform

FAQ accordion sections (grouped by topic)
  About Imprynt
  Getting Started  
  Features & Plans
  NFC Accessories
  Privacy & Security

Trust section at the bottom
  Key trust signals

CTA section
  "Ready to build your page?"
  Button → /register or waitlist

Footer (same as legal pages: © 2026 Imprynt LLC, Terms, Privacy, email)
```

### FAQ Content

Use an accordion pattern: each question is a clickable header that expands to show the answer. Group questions by topic. Start with all collapsed.

Make this a client component (`'use client'`) for the accordion interactivity. Use React state to track which questions are open.

**About Imprynt:**

Q: What is Imprynt?
A: Imprynt is a digital identity platform that gives you a single, shareable page for everything about you: contact info, social links, portfolio, booking links, payment methods, whatever you need. Think of it as a modern business card that actually works. Share it with a link, a QR code, or a tap of an NFC ring.

Q: How is this different from Linktree or other link-in-bio tools?
A: Most link-in-bio tools give you a list of links. Imprynt gives you a full profile page with real customization: 10 templates, custom themes, content sections for text, images, stats, events, music, and listings. Plus features they don't have: a hidden personal layer (your "Impression") behind a PIN, portfolio pages, vCard downloads so people actually save your contact, and NFC accessories for in-person sharing.

Q: Is Imprynt free?
A: Yes. The free plan is a real product, not a teaser. You get a full profile page, 4 templates with color customization, unlimited links, QR code sharing, vCard downloads, and 2 content sections. No time limit, no credit card required. Premium adds more templates, unlimited content sections, protected pages, analytics, and NFC accessory support.

Q: Who is Imprynt for?
A: Anyone who shares who they are with other people. That includes professionals (realtors, lawyers, consultants), creatives (photographers, DJs, designers), service providers (trainers, coaches, handymen), and really anyone who wants a better way to share their contact info and online presence.

**Getting Started:**

Q: How do I create my page?
A: Sign up with your email, then follow the setup wizard. It walks you through adding your info, choosing a template, adding links, and customizing your look. Most people finish in 5 minutes.

Q: Do I need to download an app?
A: No. Imprynt is entirely web-based. You build and manage your page from any browser. When someone visits your page, they don't need an app either. It just works.

Q: Can I change my page after I set it up?
A: Yes. You can edit everything from your dashboard at any time: your info, links, template, photos, content sections, even your URL. Changes go live immediately.

**Features & Plans:**

Q: What's an "Impression" page?
A: It's a hidden personal layer behind your public profile. You set a PIN, and only people you share it with can access it. Think of it as the back of your business card, but for personal stuff: your real social accounts, personal photos, a note that says "nice to meet you." It's completely optional.

Q: What content can I add to my page?
A: Text sections, image sections with text, stat blocks, event listings with dates and RSVP links, music with audio players, real estate listings, project showcases, call-to-action buttons, and link previews. More types coming soon.

Q: What templates are available?
A: 10 templates ranging from minimal (Clean, Soft) to bold (Noir, Midnight, Signal). 4 are free, 6 are premium. Every template supports custom accent colors. Premium users can build fully custom themes with 13 color variables and layout controls.

Q: Can people save my contact info to their phone?
A: Yes. Every profile has a "Save Contact" button that generates a vCard file. When someone taps it, your name, phone, email, company, and title get added directly to their phone contacts. Premium users can PIN-protect the vCard for their Impression page.

**NFC Accessories:**

Q: What is NFC and how does it work?
A: NFC (Near Field Communication) is the same technology that powers tap-to-pay. Our accessories contain a small chip. When someone holds their phone near it, your Imprynt page opens automatically in their browser. No app needed on their end. Works with both iPhone (XS and newer) and Android.

Q: What NFC products do you offer?
A: Currently: the Sygnet (ceramic ring) and the Armilla (silicone wristband). Both are durable, waterproof, and don't need batteries or charging. We're exploring other form factors like metal cards and challenge coins.

Q: Do I need an NFC ring to use Imprynt?
A: No. NFC accessories are optional and only available with Premium. Free users share via link and QR code, which works great. The ring is for people who want the "tap and share" experience at events, meetings, or anywhere in person.

**Privacy & Security:**

Q: Who can see my profile?
A: Your public profile is visible to anyone with the link or QR code. Your Impression (hidden page) is only accessible to people who know the PIN. You control what goes on each layer. You can also take your entire profile offline at any time with the On Air toggle.

Q: Do you sell my data?
A: No. We don't sell, share, or monetize your personal data. Your profile information is used to display your page and nothing else. See our Privacy Policy for the full details.

Q: Can I delete my account?
A: Yes. You can delete your account at any time from your dashboard settings. This permanently removes all your data, including your profile, links, content, and analytics. It's irreversible and we don't keep backups of deleted accounts.

Q: Is my connection/PIN secure?
A: Your profile is served over HTTPS. PINs are hashed with bcrypt (the same algorithm banks use). Failed PIN attempts are rate-limited to prevent brute force. We never store PINs in plain text.

### Trust Section

After the FAQ accordion, add a trust section with key signals. Use a simple grid of trust items:

```
Built by real people    |  Your data stays yours  |  No ads, ever
Imprynt LLC, est. 2026  |  We don't sell data.    |  No tracking pixels.
                        |  Delete anytime.        |  No sponsored content.
                        |                         |  Clean experience.

Works everywhere        |  Secure by default
Any phone, any browser. |  HTTPS, bcrypt PINs,
No app required.        |  rate limiting,
iPhone + Android.       |  and you control who
                        |  sees what.
```

Display as 3-4 cards in a grid on desktop, stacking on mobile.

### CTA Section

After the trust section:
```
Ready to make your impression?
Build your page in five minutes. Free forever.
[Build your page free]  (links to waitlist or /register)
```

Use the WaitlistProvider/WaitlistButton pattern from the landing page.

### Footer

Same pattern as legal pages:
```
[Imprynt mark] © 2026 Imprynt LLC    Terms  Privacy  hello@imprynt.io
```

---

## Task 2: Create FAQ-Specific CSS

Create `src/styles/faq.css` with styles for:

### Hero
```css
.faq-hero {
  text-align: center;
  padding: 3rem 1.5rem 2rem;
  max-width: 640px;
  margin: 0 auto;
}

.faq-headline {
  font-family: var(--font-heading, 'Instrument Serif', serif);
  font-size: 2.25rem;
  font-weight: 400;
  color: var(--gold, #e8a849);
  margin: 0 0 0.75rem;
}

.faq-sub {
  color: var(--text-muted, #5d6370);
  font-size: 1rem;
  margin: 0;
  line-height: 1.6;
}
```

### Accordion
```css
.faq-section {
  max-width: 680px;
  margin: 0 auto 2rem;
  padding: 0 1.5rem;
}

.faq-group-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gold, #e8a849);
  margin: 2rem 0 0.75rem;
  padding-left: 0.25rem;
}

.faq-item {
  border-bottom: 1px solid var(--border, #1a2030);
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: none;
  border: none;
  padding: 1rem 0.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--heading, #eceef2);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  line-height: 1.4;
  gap: 1rem;
}

.faq-question:hover {
  color: var(--gold, #e8a849);
}

.faq-chevron {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
  color: var(--text-muted, #5d6370);
}

.faq-chevron.open {
  transform: rotate(180deg);
}

.faq-answer {
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease, padding 0.3s ease;
  padding: 0 0.25rem;
}

.faq-answer.open {
  max-height: 500px;
  padding: 0 0.25rem 1rem;
}

.faq-answer p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--text-secondary, #8a8f9a);
}
```

### Trust Grid
```css
.faq-trust {
  max-width: 680px;
  margin: 3rem auto;
  padding: 0 1.5rem;
}

.faq-trust-headline {
  font-family: var(--font-heading, 'Instrument Serif', serif);
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--heading, #eceef2);
  text-align: center;
  margin: 0 0 1.5rem;
}

.faq-trust-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.faq-trust-card {
  background: var(--card-bg, #111621);
  border: 1px solid var(--border, #1a2030);
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.faq-trust-card h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--heading, #eceef2);
  margin: 0 0 0.375rem;
}

.faq-trust-card p {
  font-size: 0.8125rem;
  color: var(--text-muted, #5d6370);
  margin: 0;
  line-height: 1.5;
}
```

### CTA
```css
.faq-cta {
  text-align: center;
  padding: 3rem 1.5rem;
  max-width: 480px;
  margin: 0 auto;
}

.faq-cta h2 {
  font-family: var(--font-heading, 'Instrument Serif', serif);
  font-size: 1.75rem;
  font-weight: 400;
  color: var(--heading, #eceef2);
  margin: 0 0 0.5rem;
}

.faq-cta p {
  color: var(--text-muted, #5d6370);
  margin: 0 0 1.5rem;
  font-size: 0.9375rem;
}
```

Use the same button class from the landing page (`lp-btn-primary`) for the CTA button, or define a local equivalent that matches the gold button style.

### Responsive
```css
@media (max-width: 600px) {
  .faq-headline { font-size: 1.75rem; }
  .faq-trust-grid { grid-template-columns: 1fr; }
}
```

---

## Task 3: Add Navigation Link

### In the landing page nav

In `src/app/page.tsx`, add a "FAQ" link to the nav alongside the existing links:

```tsx
<a href="/faq" className="lp-nav-link hide-m">FAQ</a>
```

Place it after "Pricing" and before the ThemeToggle. Also add it to the MobileNav component if it has a links list.

### In the landing page footer

In `src/app/page.tsx`, add FAQ to the footer links:

```tsx
<Link href="/faq" className="lp-footer-link">FAQ</Link>
```

Place it after Privacy.

### In the legal page footers

In `src/app/terms/page.tsx` and `src/app/privacy/page.tsx`, if they have footer links, add FAQ there too for cross-linking.

---

## Task 4: Add to MobileNav

Check `src/components/MobileNav.tsx`. If it has a list of navigation links, add:
```tsx
<a href="/faq" className="...">FAQ</a>
```

Use the same class and pattern as the existing links.

---

## Task 5: Update CC and CONTEXT.md

### Command Center changelog

```sql
INSERT INTO cc_changelog (title, body, version, entry_date, tags, is_public)
VALUES (
  'FAQ / Trust Page',
  'Added public FAQ page at /faq with grouped accordion Q&A (About, Getting Started, Features, NFC, Privacy & Security), trust signal grid, and signup CTA. Added FAQ link to landing page nav, mobile nav, and footer. New faq.css stylesheet.',
  '0.9.7',
  CURRENT_DATE,
  '{feature,conversion,trust}',
  true
);
```

### Command Center features

Find the feature tracking entry. If there's no existing entry for FAQ, add one:

```sql
INSERT INTO cc_features (name, description, category, status, priority, release_phase, shipped_at)
VALUES (
  'FAQ / Trust Page',
  'Public-facing FAQ page with accordion Q&A, trust signals, and signup CTA. Addresses conversion gap for visitors who discover Imprynt through profiles or search.',
  'marketing',
  'shipped',
  39,
  'v1',
  NOW()
);
```

### CONTEXT.md

Add to the session log:

```markdown
### February 26, 2026 (Session 5) — FAQ/Trust Page
- **Created:** `/faq` page with grouped accordion FAQ (5 sections, 17 questions), trust signal grid, and signup CTA.
- **Stylesheet:** `src/styles/faq.css` with hero, accordion, trust grid, CTA, and responsive styles.
- **Navigation:** Added FAQ link to landing page nav, mobile nav, landing page footer, and legal page footers.
- **CC updated:** Feature entry + changelog v0.9.7.
```

---

## After All Tasks

1. Run `npx tsc --noEmit` — zero errors
2. Run `docker compose build` — succeeds
3. Test `/faq` page loads and renders correctly
4. Test accordion: click questions, verify expand/collapse animation
5. Test mobile: verify stacking, font sizes, accordion usability on 375px viewport
6. Test the CTA button links to the correct registration/waitlist route
7. Verify FAQ link appears in landing page nav, mobile nav, and footer
8. Verify the page uses the same dark navy + gold design system as the rest of the site
