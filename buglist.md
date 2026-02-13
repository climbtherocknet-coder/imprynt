# Imprynt Platform Bug List & Known Issues

**Last updated:** February 12, 2026
**Maintained by:** Tim Kline

**Priority key:** `P0` (blocks launch) | `P1` (should fix before launch) | `P2` (fix soon after launch) | `P3` (low priority)
**Status key:** `open` | `in-progress` | `fixed` | `wontfix`

---

## P0 — Launch Blockers

### BUG-001: Setup wizard uses old 5-template system
**Status:** staged (staged-fixes/SetupWizard.tsx)
**Found:** Code review, Feb 12 2026
**File:** `src/app/dashboard/setup/SetupWizard.tsx`

The wizard template picker still shows the old template list (`dark`, `bold`, `clean`, `classic`, `warm`) with hardcoded color swatches. The rest of the codebase has been migrated to the 10-template system. Users going through onboarding will select templates that may not map correctly to the new system.

**Fix:** Replace the `TEMPLATES` array in `SetupWizard.tsx` with the 10-template definitions from `src/lib/themes.ts`. Update the preview cards to reflect actual template colors and fonts. Show premium templates with lock icons for free users.

### BUG-002: No photo upload in setup wizard
**Status:** staged (staged-fixes/SetupWizard.tsx)
**Found:** Code review, Feb 12 2026
**File:** `src/app/dashboard/setup/SetupWizard.tsx`

The setup wizard has no step for uploading a profile photo. The photo upload endpoint exists (`/api/upload/photo`) and the dashboard profile editor supports it, but new users complete onboarding without ever setting a photo. The step 6 review shows initials only.

**Fix:** Add a photo upload step to the wizard (between "About" and "Template"). Reuse the existing upload endpoint. Show circular preview with crop guidance.

### BUG-003: Font pair selection disconnected from template system
**Status:** staged (staged-fixes/SetupWizard.tsx)
**Found:** Code review, Feb 12 2026
**File:** `src/app/dashboard/setup/SetupWizard.tsx`

The wizard offers three generic font pairs ("Modern" = system-ui, "Classic" = Georgia, "Technical" = monospace) that are completely disconnected from the template font system. Templates define their own font pairings in `themes.ts`. The wizard selection likely has no effect on the actual profile rendering, or worse, overrides the template fonts incorrectly.

**Fix:** Either remove the font pair step from the wizard (let templates drive fonts) or make it template-aware. Recommended: remove it for V1, since templates already handle typography.

---

## P1 — Should Fix Before Launch

### BUG-004: TypeScript errors in auth.ts
**Status:** fixed (Feb 12, 2026)
**Found:** Session handoff notes
**File:** `src/lib/auth.ts`

Two TS2352 errors reported. These are type assertion errors that may cause build warnings or failures in strict mode.

**Fix:** Investigate and resolve the type assertions. Likely needs `as unknown as X` pattern or proper type narrowing.

### BUG-005: image_position column may be missing from migrations
**Status:** open (needs verification)
**Found:** Code review, Feb 12 2026
**Files:** `src/app/api/pods/route.ts`, `src/components/pods/PodEditor.tsx`

The pods API and editor reference an `image_position` column (left/right) for text_image pods, but I don't see this column in migration 006 (which creates the pods table) or migration 009 (which extends it). The column may have been added in a migration I didn't review, or it may be missing and silently failing.

**Fix:** Verify the column exists in the database. If not, add a migration: `ALTER TABLE pods ADD COLUMN IF NOT EXISTS image_position VARCHAR(10) DEFAULT 'left';`

---

## P2 — Fix Soon After Launch

### BUG-006: Link preview reliability
**Status:** open
**Found:** User report / session notes
**File:** `src/app/api/og-preview/route.ts`, pod link_preview type

The link preview component (OG metadata fetching) has known issues:
- Some sites block server-side OG fetching (bot detection)
- Timeouts on slow sites
- Missing or incomplete metadata
- Manual fallback UX needs improvement

**Fix:** Full reevaluation of the link preview approach. See roadmap item #3.

### BUG-007: Wizard appearance step may override template colors
**Status:** open (needs verification)
**Found:** Code review, Feb 12 2026
**File:** `src/app/dashboard/setup/SetupWizard.tsx`, `src/app/api/setup/route.ts`

The wizard step 4 lets users pick `primaryColor`, `accentColor`, and `fontPair`. These may be stored on the profile and override template defaults. Need to verify:
- Does the profile renderer use these custom colors, or does it only use template colors from `themes.ts`?
- If custom colors are applied, do they break the template's designed palette?
- Should custom color overrides be a paid-only feature?

**Fix:** Audit the profile rendering pipeline. Determine if custom colors from the wizard are respected, ignored, or conflicting. Align with the roadmap theme customization plan.

---

## P3 — Low Priority

### BUG-008: Wizard "Skip for now" behavior
**Status:** open
**Found:** Code review, Feb 12 2026
**File:** `src/app/dashboard/setup/SetupWizard.tsx`

The "Skip for now" button saves the current step then redirects to the dashboard. But the user hasn't completed setup, so `setup_completed` may still be false. Need to verify: does the dashboard properly handle partially-completed profiles? Does the user get redirected back to the wizard on next login?

**Fix:** Verify the skip flow. Ensure users can resume setup, and the dashboard gracefully handles incomplete profiles.

### BUG-009: No QR code sharing for free users
**Status:** open
**Found:** Gap audit, Feb 12 2026
**Severity:** P2

Spec promises "Shareable via link or QR code" for free tier. No QR generation exists. Free users without a ring have no easy visual sharing mechanism. See roadmap GAP-1.

### BUG-010: Email verification not implemented
**Status:** open
**Found:** Gap audit, Feb 12 2026
**Severity:** P1

`email_verified` column exists on users table but no verification flow is implemented. Partially mitigated by invite-only registration, but should be addressed before opening registration.

### BUG-011: Account deletion flow unverified
**Status:** open (needs verification)
**Found:** Gap audit, Feb 12 2026
**Severity:** P1
**File:** `src/app/dashboard/account/AccountClient.tsx`

Privacy policy promises data deletion within 30 days. Need to verify the account deletion flow works end-to-end with proper cascade deletes.

### BUG-012: No branded 404/error pages
**Status:** open
**Found:** Gap audit, Feb 12 2026
**Severity:** P2

Dead slugs, invalid URLs, and server errors show generic Next.js pages. Need `/app/not-found.tsx` and `/app/error.tsx` with Imprynt branding.

### BUG-013: Accessibility audit needed
**Status:** open
**Found:** General
**Files:** All profile templates, dashboard

No formal accessibility audit has been done. Profile templates need:
- Proper contrast ratios verified (especially dark templates)
- Screen reader testing
- Keyboard navigation for all interactive elements
- ARIA labels on icon-only buttons
- Focus indicators on all focusable elements

**Fix:** Run automated audit (axe, Lighthouse) and manual testing. Address critical issues before launch, comprehensive fix post-launch.

---

## Resolved

(Move items here as they're fixed, with date and PR/commit reference)

<!-- Example:
### BUG-XXX: Description
**Status:** fixed
**Fixed:** Feb X, 2026
**Commit:** abc123
-->
