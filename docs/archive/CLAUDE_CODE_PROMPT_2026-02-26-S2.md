# Claude Code Prompt — February 26, 2026 (Session 2: Lightbox + QR + Free CTA)

Read `CLAUDE.md` first. Follow all rules. Back up files before modifying them.

This prompt covers 3 tasks. Do them in order. Run `npx tsc --noEmit` after each task.

---

## Task 1: Profile Photo Lightbox with Save Contact

**Current state:** `ExpandablePhoto.tsx` shows a basic fullscreen overlay with just the photo. No name, no Save Contact, no themed styling.

**Goal:** When a visitor taps the profile photo on the public page, open a themed lightbox/modal with:
- Larger version of the photo (centered, rounded, 260-300px)
- Person's full name below the photo
- Title / company below the name (if present)
- "Save Contact" button below the info
- Tap outside or X to dismiss
- Subtle backdrop blur overlay
- Uses the template's CSS variables for consistent theming

**Modify `src/components/templates/ExpandablePhoto.tsx`:**

Add new props:
```typescript
interface ExpandablePhotoProps {
  photoUrl: string;
  fullName: string;
  customPhotoStyle?: React.CSSProperties;
  positionStyle?: React.CSSProperties;
  initials: string;
  // NEW props:
  title?: string;
  company?: string;
  profileId: string;
  vcardPinEnabled?: boolean;
}
```

Replace the lightbox overlay with a proper modal:

```tsx
{lightboxOpen && photoUrl && (
  <div className="photo-lightbox-overlay" onClick={() => setLightboxOpen(false)}>
    <div className="photo-lightbox-card" onClick={e => e.stopPropagation()}>
      {/* Close button */}
      <button
        className="photo-lightbox-close"
        onClick={() => setLightboxOpen(false)}
        aria-label="Close"
      >
        ✕
      </button>

      {/* Large photo */}
      <img
        src={photoUrl}
        alt={fullName}
        className="photo-lightbox-img"
      />

      {/* Name + info */}
      <h3 className="photo-lightbox-name">{fullName}</h3>
      {(title || company) && (
        <p className="photo-lightbox-info">
          {title}{title && company ? ' · ' : ''}{company}
        </p>
      )}

      {/* Save Contact button */}
      <SaveContactButton
        profileId={profileId}
        pinProtected={vcardPinEnabled || false}
        iconOnly={false}
      />
    </div>
  </div>
)}
```

Import `SaveContactButton` at the top of `ExpandablePhoto.tsx`:
```typescript
import SaveContactButton from '@/components/templates/SaveContactButton';
```

**Update `src/components/templates/ProfileTemplate.tsx`** to pass the new props to ExpandablePhoto:

Find where ExpandablePhoto is rendered and add:
```tsx
<ExpandablePhoto
  photoUrl={photoUrl}
  fullName={`${firstName} ${lastName}`.trim()}
  customPhotoStyle={customPhotoStyle}
  positionStyle={positionStyle}
  initials={initials}
  title={title}
  company={company}
  profileId={profileId}
  vcardPinEnabled={vcardPinEnabled}
/>
```

**Update CSS in `src/styles/profile.css`:**

Replace the existing `.photo-lightbox-overlay` and `.photo-lightbox-overlay img` rules with:

```css
.photo-lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  cursor: pointer;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

.photo-lightbox-card {
  position: relative;
  background: var(--surface, #161c28);
  border: 1px solid var(--border, #1e2535);
  border-radius: 1.25rem;
  padding: 2rem 1.5rem 1.5rem;
  max-width: 320px;
  width: 100%;
  text-align: center;
  cursor: default;
  animation: scaleIn 0.25s ease;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
}

.photo-lightbox-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--border, #1e2535);
  background: var(--bg, #0c1017);
  color: var(--text-muted, #5d6370);
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s, border-color 0.2s;
}

.photo-lightbox-close:hover {
  color: var(--text, #eceef2);
  border-color: var(--text-muted, #5d6370);
}

.photo-lightbox-img {
  width: 280px;
  height: 280px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 1rem;
  display: block;
  border: 2px solid var(--border, #1e2535);
}

.photo-lightbox-name {
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text, #eceef2);
  font-family: var(--font-heading, inherit);
}

.photo-lightbox-info {
  margin: 0 0 1.25rem;
  font-size: 0.875rem;
  color: var(--text-mid, #a8adb8);
}

/* Override save-btn inside lightbox to be full-width and themed */
.photo-lightbox-card .save-row {
  margin: 0;
  padding: 0;
}

.photo-lightbox-card .save-btn {
  width: 100%;
  background: var(--accent, #e8a849);
  color: var(--accent-contrast, #fff);
  border: none;
  border-radius: 9999px;
  padding: 0.625rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s;
}

.photo-lightbox-card .save-btn:hover {
  opacity: 0.9;
}
```

**Important:** The lightbox photo should use the same photo shape as the profile's setting. If the profile uses a square photo, the lightbox should show square. If circle, show circle. For now, default to `border-radius: 50%` (circle) since that looks best in a card context. We can refine later.

Also: remove the old `.photo-lightbox-overlay img` rule since we've replaced it with `.photo-lightbox-img`.

---

## Task 2: QR Code Button on Public Profile (Enhanced)

**Current state:** The QR button exists as a fixed-position floating circle in `ProfileClient.tsx` (bottom: 80, right: 16). It's opt-in via a toggle in the dashboard (`showQrButton`). When tapped, it opens a white modal with the QR code.

**Goal:** Make the QR button more useful and prominent, especially for free users.

### Part A: Always-on for free tier

The QR button should be **always visible** on free tier profiles regardless of the `showQrButton` setting. Free users without a ring need this as their primary sharing mechanism. The toggle should still work for paid users (opt-in/out).

**In `src/app/[slug]/page.tsx`:**

Find where `showQrButton` is passed to `ProfileClient`:
```tsx
showQrButton={!!profile.show_qr_button}
```

Change to:
```tsx
showQrButton={!isPaid || !!profile.show_qr_button}
```

This means: free users always get QR, paid users control it via toggle.

**In `src/components/pods/ProfileTab.tsx` (dashboard):**

Add a note under the QR toggle for free users. Find the QR toggle and wrap it conditionally:

```tsx
{plan === 'free' ? (
  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', padding: '0.5rem 0' }}>
    QR code button is always shown on free profiles. Upgrade for more sharing options.
  </div>
) : (
  <ToggleSwitch
    checked={showQrButton}
    onChange={...existing handler...}
    label="Show QR code button on your profile"
    description="Adds a QR code icon visitors can tap to share your profile URL."
  />
)}
```

You'll need the user's plan. Check how other sections in ProfileTab access the plan (it's likely already available in the component state from the profile fetch).

### Part B: Theme the QR modal

The current QR modal is hardcoded white (`background: '#ffffff'`). It should match the template's theme.

**In `src/app/[slug]/ProfileClient.tsx`:**

Find the QR modal and update the card styling:

```tsx
// The outer modal card:
style={{
  background: 'var(--surface, #161c28)',
  borderRadius: '1.25rem',
  padding: '1.5rem',
  width: '100%',
  maxWidth: 280,
  textAlign: 'center',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  border: '1px solid var(--border, #1e2535)',
}}

// The "Scan to open profile" text:
style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text, #eceef2)' }}

// The QR image needs to stay on a white background for scanability.
// Wrap it in a white container:
<div style={{ background: '#ffffff', borderRadius: '0.75rem', padding: '0.75rem', display: 'inline-block' }}>
  <img ... />
</div>

// The close button at the bottom:
style={{
  marginTop: '1rem',
  padding: '0.5rem 1.5rem',
  background: 'transparent',
  border: '1px solid var(--border, #1e2535)',
  borderRadius: '9999px',
  fontSize: '0.8125rem',
  color: 'var(--text-mid, #a8adb8)',
  cursor: 'pointer',
  fontFamily: 'inherit',
}}
```

### Part C: Position the QR button better

Currently the QR button sits at `bottom: 80, right: 16`. This can overlap with content. Also check what else is in that corner (the easter egg button, sharing button, feedback button all live in ProfileClient as fixed-position elements).

Look at the existing fixed button positions in ProfileClient and make sure:
1. QR button doesn't overlap other floating buttons
2. The buttons stack vertically with consistent spacing (12-16px gap)
3. Bottom-to-top order: feedback (lowest), share, QR, easter egg (highest)

If there's already a good stacking system, just verify QR fits in. If buttons are at hardcoded positions, refactor them to stack. The simplest approach: give the bottom-right corner a flex column container:

```tsx
<div style={{
  position: 'fixed',
  bottom: 16,
  right: 16,
  zIndex: 50,
  display: 'flex',
  flexDirection: 'column-reverse',
  gap: '0.5rem',
  alignItems: 'center',
}}>
  {/* Buttons rendered in order: first = bottom */}
  {allowFeedback && <FeedbackButton ... />}
  {allowSharing && <ShareButton ... />}
  {showQrButton && <QrButton ... />}
</div>
```

Only do this refactor if the buttons are currently at independent hardcoded positions. If they already stack well, just adjust the QR button position.

---

## Task 3: Free Tier Signup CTA (Viral Loop)

**Current state:** Free profiles show "Powered by Imprynt" watermark linking to trysygnet.com. It's small and subtle. This needs to become a conversion tool.

**Goal:** Turn every free profile into a distribution channel. When someone views a free user's profile, they should see a gentle nudge to create their own.

### Implementation: Enhanced watermark + post-save CTA

**Part A: Upgrade the watermark**

In `src/components/templates/ProfileTemplate.tsx`, find the watermark section:

```tsx
{!isPaid && (
  <a href="https://trysygnet.com" target="_blank" rel="noopener noreferrer" className="watermark">
    <span className="watermark-mark" />
    <span className="watermark-text">Powered by <strong>Imprynt</strong></span>
  </a>
)}
```

Replace with a more prominent CTA:

```tsx
{!isPaid && (
  <a href="/register?ref=profile" className="free-cta" target="_blank" rel="noopener noreferrer">
    <span className="free-cta-mark" />
    <span className="free-cta-text">
      Create your free <strong>Imprynt</strong> profile →
    </span>
  </a>
)}
```

Use `/register?ref=profile` as the link (internal route, tracks referral source). If the register page doesn't exist at that exact path, check the actual registration route (likely `/register` or `/(auth)/register`). Use whatever the correct path is. Include `?ref=profile` as a query parameter for future referral tracking.

**Part B: CSS for the free CTA**

In `src/styles/profile.css`, add (and remove or keep the old `.watermark` rules since paid profiles don't use them, but keep them as fallback):

```css
.free-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  margin: 1rem auto 0;
  border-radius: 9999px;
  border: 1px solid var(--border, #1e2535);
  background: var(--surface, #161c28);
  color: var(--text-mid, #a8adb8);
  font-size: 0.8125rem;
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s;
  max-width: 280px;
}

.free-cta:hover {
  border-color: var(--accent, #e8a849);
  color: var(--text, #eceef2);
}

.free-cta-mark {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid var(--accent, #e8a849);
  position: relative;
  flex-shrink: 0;
}

.free-cta-mark::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent, #e8a849);
}

.free-cta strong {
  color: var(--accent, #e8a849);
  font-weight: 600;
}
```

This makes the CTA look like a real button/badge at the bottom of free profiles. It uses the template's accent color so it feels themed, not like a foreign ad. The Imprynt circle mark gives brand recognition.

**Part C: Post-save CTA (optional, do if time permits)**

In `SaveContactButton.tsx`, after a successful vCard download (non-PIN-protected path), briefly show a small toast or inline message:

After the download anchor click, show a temporary message:
```tsx
// After successful download, show CTA for non-logged-in visitors on free profiles
// This requires knowing if the profile is free tier, so add an `isFree` prop
```

Actually, this is complex because SaveContactButton doesn't know the plan tier. **Skip Part C for now.** The watermark CTA (Part A) is the primary conversion mechanism. We can add the post-save CTA later when we refactor SaveContactButton.

---

## After All Tasks

1. Run `npx tsc --noEmit` — zero errors
2. Run `docker compose build` — succeeds
3. Test the photo lightbox: click profile photo, verify modal shows photo + name + title + Save Contact
4. Test QR button: verify it appears on free profiles even if toggle is off, verify themed modal
5. Test free CTA: verify "Create your free Imprynt profile" appears at the bottom of free profiles, verify it links to register page
6. Verify paid profiles: no free CTA, QR toggle still controls visibility
7. Test across multiple templates (at least one dark, one light) to verify theming
8. Update `CONTEXT.md` with a new session log entry
