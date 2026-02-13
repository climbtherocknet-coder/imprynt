# Setup Wizard P0 Fix — Handoff Instructions

**Date:** February 12, 2026
**Fixes:** BUG-001, BUG-002, BUG-003

## What Changed

The setup wizard has been rewritten to fix three P0 launch blockers:

1. **10-template system** (was using old 5-template list)
2. **Photo upload step** (was missing entirely)
3. **Font pair removed** (was disconnected from template system)

The wizard is now 6 steps: Name → About → Photo → Template + Accent → Links → Review

## Files to Deploy

All staged files are in `D:\Docker\imprynt\staged-fixes\`

### 1. SetupWizard.tsx
**Source:** `staged-fixes/SetupWizard.tsx`
**Target:** `src/app/dashboard/setup/SetupWizard.tsx` (full replacement)

Changes:
- Imports from `@/lib/themes` (THEMES, ALL_TEMPLATES, isDarkTemplate, etc.)
- New `isPaid` prop (controls template locking)
- Photo upload step (step 3) using existing `/api/upload/photo` endpoint
- 10 templates in picker, derived from `themes.ts` (not hardcoded)
- Premium templates show lock icon + "Pro" badge for free users
- Font pair step removed entirely
- Old primaryColor/fontPair state removed
- Template selection auto-sets accent color to template default
- Review step shows actual photo if uploaded
- Step indicator labels below progress bar

### 2. setup-route.ts
**Source:** `staged-fixes/setup-route.ts`
**Target:** `src/app/api/setup/route.ts` (full replacement)

Changes:
- Imports `isValidTemplate` and `isFreeTier` from `@/lib/themes`
- GET now returns `isPaid` (derived from user.plan) and `photoUrl`
- Step 3 is now a no-op (photo saved by upload endpoint)
- Step 4 is now template + accent color (combined, was separate steps 3 and 4)
- Template validation uses `isValidTemplate()` instead of hardcoded array
- Free tier enforcement: free users can't save premium templates
- Removed `primaryColor` and `fontPair` from step 4

### 3. setup-additions.css
**Source:** `staged-fixes/setup-additions.css`
**Target:** Append contents to `src/styles/setup.css`

New CSS classes for:
- `.setup-step-indicators` / `.setup-step-dot` — step labels
- `.setup-photo-*` — photo upload step (circle, placeholder, loading, actions)
- `.setup-template-btn--locked` / `.setup-template-lock` — premium lock state
- `.setup-template-badge` — "Pro" badge on premium templates
- Updated `.setup-template-grid` — 5-column layout for 10 templates
- `.setup-label-sub` — secondary label text
- `.setup-appearance-preview-photo` / `-initials` — photo in mini preview
- `.setup-review-photo` — photo in review step

### 4. setup-page.tsx
**Source:** `staged-fixes/setup-page.tsx`
**Target:** `src/app/dashboard/setup/page.tsx` (full replacement)

Changes:
- Queries `plan` from users table
- Passes `isPaid` prop to SetupWizard
- Passes `photoUrl` in initialData

## Testing Checklist

- [ ] Wizard loads with all 10 templates visible
- [ ] Free user sees lock icons on premium templates (Midnight, Editorial, Noir, Signal, Studio, Dusk)
- [ ] Free user cannot select locked templates
- [ ] Paid user can select all templates
- [ ] Selecting a template changes the accent color to the template default
- [ ] Custom accent color override works and persists
- [ ] Photo upload works (JPEG, PNG, WebP)
- [ ] Photo appears in template preview (step 4) and review (step 6)
- [ ] Photo too large (>5MB) shows error
- [ ] Photo remove button works
- [ ] Skip for now still works from any step
- [ ] Publish completes and redirects to dashboard
- [ ] Profile renders with correct template after wizard completion
- [ ] Back/forward navigation preserves all form state
