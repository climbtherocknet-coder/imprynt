# Claude Code Prompt — February 25, 2026

Read `CLAUDE.md` first. Follow all rules. Back up files before modifying them.

This prompt covers 4 tasks. Do them in order. Run `npx tsc --noEmit` after each task.

---

## Task 1: Noir Template Button Fix

**Problem:** On the Noir template, buttons with `background: var(--accent)` and `color: #fff` are invisible because Noir's accent is `#f5f0e8` (cream). White text on cream = invisible.

**Fix:** Add a CSS utility that detects light accent colors and flips button text to dark.

In `src/components/templates/ProfileTemplate.tsx` (or wherever the CSS variables are injected), compute a `--accent-contrast` variable based on the accent color luminance. If the accent color is light (relative luminance > 0.5), set `--accent-contrast` to the template's `--bg` or `#111111`. If dark, set it to `#ffffff`.

Then update `src/styles/profile.css`:

- `.pod-cta-btn`: change `color: #fff` to `color: var(--accent-contrast, #fff)`
- `.save-contact-btn` or any other button using `background: var(--accent); color: #fff`: same fix
- Search the entire profile.css for any `background: var(--accent)` paired with `color: #fff` and apply the same pattern

**How to compute luminance:** Given hex color, extract RGB, apply sRGB linearization, compute relative luminance = 0.2126*R + 0.7152*G + 0.0722*B. If > 0.5, accent is "light." This can be a small helper function in `themes.ts` or computed inline where CSS vars are injected.

**Test:** View a profile using the Noir template. All buttons (CTA, Save Contact, link buttons) should have readable text. Also verify that Midnight (accent: #c8ff00, also light) looks correct. Light templates (Clean, Warm, etc.) should be unaffected.

---

## Task 2: Event Pod Timezone Fix

**Problem:** Event dates are stored as UTC (via `.toISOString()`) but displayed without timezone awareness. An event set to "Saturday March 7 at 7:00 PM MST" shows as "Sunday March 8" because UTC is ahead.

**Fix — two parts:**

### Part A: Store timezone on event creation

Add a `event_timezone` column to the pods table.

**Migration** `db/migrations/051_event_timezone.sql`:
```sql
ALTER TABLE pods ADD COLUMN IF NOT EXISTS event_timezone VARCHAR(50);
```

Run this migration against the database.

In the PodEditor (`src/components/pods/PodEditor.tsx`), when saving an event pod:
- Auto-detect the user's timezone via `Intl.DateTimeFormat().resolvedOptions().timeZone` (e.g., "America/Denver")
- Send it alongside eventStart/eventEnd as `eventTimezone`
- Store `datetime-local` values as-is WITHOUT converting to ISO/UTC. The datetime-local input gives you a naive datetime string like "2026-03-07T19:00". Store that directly as a TIMESTAMPTZ by appending the timezone offset, or better: store the naive datetime string + the timezone name separately.

**Recommended approach:** Change the event date storage to store the LOCAL datetime string (from the datetime-local input) directly in event_start/event_end without converting to UTC. The database column is TIMESTAMPTZ so PostgreSQL will interpret it in the session timezone. To make this work correctly:
- In the PodEditor onChange for eventStart/eventEnd, do NOT call `new Date(e.target.value).toISOString()`. Instead, store the raw `e.target.value` (e.g., "2026-03-07T19:00") and the timezone name.
- In the API route (pods/route.ts), when saving event_start/event_end, pass the value with timezone: `${eventStart}:00${tzOffset}` where tzOffset is computed from the timezone name, OR use PostgreSQL's `AT TIME ZONE` clause.
- Actually the simplest correct approach: store the raw datetime-local value + timezone name. On read, format for display using the stored timezone.

Actually, let me simplify. The cleanest fix:

1. Add `event_timezone VARCHAR(50)` column to pods
2. In PodEditor, auto-detect timezone and save it with the pod
3. In PodEditor, STOP converting datetime-local values to ISO. The datetime-local input gives "2026-03-07T19:00". Store that string directly. When reading back, display it directly. The timezone column tells you what timezone the datetime is in.
4. In the pods API POST and PUT, accept `eventTimezone` and save it to `event_timezone`
5. In the pods API GET and in `getPods()` in `[slug]/page.tsx`, return `eventTimezone`
6. Update the PodData interface in PodRenderer.tsx to include `eventTimezone?: string`

### Part B: Display timezone-aware in PodRenderer

In PodRenderer.tsx (Task 3 builds the event case), format dates using the stored timezone:
```typescript
const formatted = new Date(pod.eventStart).toLocaleString('en-US', {
  timeZone: pod.eventTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  weekday: 'short', month: 'short', day: 'numeric',
  hour: 'numeric', minute: '2-digit'
});
```

This way, everyone sees the event in the timezone it was created in. "Saturday, Mar 7 at 7:00 PM" regardless of viewer timezone. If no timezone is stored (legacy events), fall back to the viewer's local timezone.

**Also fix the PodEditor display:** The current PodEditor has this line for displaying dates:
```
new Date(new Date(pod.eventStart).getTime() - new Date(pod.eventStart).getTimezoneOffset() * 60000).toISOString().slice(0, 16)
```
This double-conversion is the source of the bug. Replace it with direct display of the stored value. If event_start stores "2026-03-07T19:00", just display that in the datetime-local input directly.

---

## Task 3: Event Pod Public Renderer

**Problem:** PodRenderer.tsx has no `event` case. Event pods return null on public profiles.

**Build the event pod renderer.** Add a new case in PodRenderer.tsx for `pod.podType === 'event'`.

**Update PodData interface** to include the event fields that are already being passed:
```typescript
eventStart?: string;
eventEnd?: string;
eventVenue?: string;
eventAddress?: string;
eventStatus?: string;
eventAutoHide?: boolean;
eventTimezone?: string;
```

**Design the event card.** It should look like this:

```
┌─────────────────────────────────────┐
│  📅 SAT, MAR 7                      │  ← date, large, accent color
│  7:00 PM                            │  ← time below date
│                                     │
│  The Cowboy & The Rocker             │  ← event title (h3)
│  Wild Goose Saloon                   │  ← venue name, --text-mid color
│  123 Main St, Castle Rock, CO        │  ← address, --text-muted, smaller
│                                     │
│  [  Event Link  ]                    │  ← CTA button if ctaUrl exists
│                                     │
│  ┌─ Event image if exists ─────┐    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  Description text here...            │  ← body text if exists
└─────────────────────────────────────┘
```

If `eventStatus` is not "upcoming", show a badge (same pattern as listing badges):
- `cancelled` → red badge "Cancelled"
- `postponed` → amber badge "Postponed"  
- `sold_out` → purple badge "Sold Out"

**CTA button:** Use the existing ctaLabel and ctaUrl fields. Default button text should be "Event Details" (not "Get Tickets"). The user can customize ctaLabel to say "Get Tickets", "RSVP", "Facebook Event", or whatever they want.

**Add CSS** for the event pod in `src/styles/profile.css`. Use CSS classes prefixed with `pod-event-`. Use template CSS variables (--accent, --text, --text-mid, --text-muted, --surface, --border, etc.) so it works across all templates. The date should use `--accent` color for emphasis. The card should use the same pod container styling as other pods.

**Body text:** If the pod has a body, render it below the image (or below the CTA if no image) using the same `pod-body pod-body-md` class pattern as text pods (supports markdown via renderMarkdown).

---

## Task 4: Admin Portal Consolidation into Command Center

**Problem:** Two separate admin interfaces exist: the legacy portal at `/p-8k3x` (Users, Codes, Waitlist, Feedback, Overview) and the Command Center at `/dashboard/admin` (CC Overview, Features, Roadmap, Changelog, Docs, Schema). These need to be unified.

**Approach:** Add the portal's admin tabs to the Command Center. The standalone admin tab components already exist in `src/components/admin/` (AdminUsersTab.tsx, AdminCodesTab.tsx, AdminWaitlistTab.tsx, AdminFeedbackTab.tsx, AdminTrafficTab.tsx). The CC already has RBAC via `accessLevel` ('admin' | 'advisory').

### Step 1: Update the CC page (`src/app/dashboard/admin/page.tsx`)

Add the admin tabs to the tab list. The tab type and arrays should become:

```typescript
type TabKey = 'overview' | 'features' | 'roadmap' | 'changelog' | 'docs' | 'schema' | 'users' | 'codes' | 'waitlist' | 'feedback' | 'traffic';

const ALL_TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'users', label: 'Users' },
  { key: 'codes', label: 'Codes' },
  { key: 'waitlist', label: 'Waitlist' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'traffic', label: 'Traffic' },
  { key: 'features', label: 'Features' },
  { key: 'roadmap', label: 'Roadmap' },
  { key: 'changelog', label: 'Changelog' },
  { key: 'docs', label: 'Docs' },
  { key: 'schema', label: 'Schema' },
];

// Advisory users only see these tabs
const ADVISORY_TABS: TabKey[] = ['features', 'roadmap'];
```

Add imports for the admin tab components:
```typescript
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import AdminCodesTab from '@/components/admin/AdminCodesTab';
import AdminWaitlistTab from '@/components/admin/AdminWaitlistTab';
import AdminFeedbackTab from '@/components/admin/AdminFeedbackTab';
import AdminTrafficTab from '@/components/admin/AdminTrafficTab';
```

Add rendering in the tab content section:
```typescript
{activeTab === 'users' && <AdminUsersTab />}
{activeTab === 'codes' && <AdminCodesTab />}
{activeTab === 'waitlist' && <AdminWaitlistTab />}
{activeTab === 'feedback' && <AdminFeedbackTab />}
{activeTab === 'traffic' && <AdminTrafficTab />}
```

### Step 2: Merge Overview stats

The CC Overview (`CCOverview.tsx`) already fetches admin stats when `accessLevel === 'admin'`. Check that it shows user counts, template stats, etc. from `/api/admin/stats`. If it already does, no changes needed. If the legacy portal's Overview had additional stats, add them to CCOverview.

### Step 3: Fix the AdminCodesTab adminEmail prop

The legacy portal passes `adminEmail` to the CodesTab. Check if AdminCodesTab needs this prop. If it does, pass it from the CC page (get it from the session fetch that already happens).

### Step 4: Style consistency

The admin tab components use classes from `src/styles/admin.css`. Make sure `admin.css` is imported in the CC page:
```typescript
import '@/styles/admin.css';
```

The CC page already imports `dashboard.css` and `cc.css`. Adding `admin.css` should be sufficient since the admin tabs reference their own class names.

### Step 5: Consider tab grouping

If the tab bar gets crowded with 11 tabs, group them visually. Add a subtle separator (a thin vertical line or extra gap) between the "admin" tabs (Overview through Traffic) and the "CC" tabs (Features through Schema). This can be done with a CSS class on the divider element or a gap in the tab bar.

### Step 6: Do NOT delete /p-8k3x yet

Keep the legacy portal functional until Tim verifies the consolidated CC works. Add a deprecation notice at the top of the legacy portal page: "This admin portal has moved to the Command Center. Go to Command Center →" with a link to `/dashboard/admin`.

### Step 7: Handle the `/api/p-8k3x/` routes

The admin tabs already call `/api/admin/*` endpoints, not `/api/p-8k3x/*`. The `/api/p-8k3x/` routes appear to be duplicates. Do NOT delete them yet, but verify that the admin tabs in the CC work correctly using the `/api/admin/*` endpoints. If they do, the `/api/p-8k3x/` routes can be removed later after Tim approves.

---

## After All Tasks

1. Run `npx tsc --noEmit` — zero errors
2. Run `docker compose build` — succeeds
3. Test the Noir template: buttons readable, event pod renders
4. Test an event pod: create one in the editor, verify it shows on the public profile with correct date/time
5. Test the Command Center: all tabs visible for admin, only Features + Roadmap for advisory users
6. Update `CONTEXT.md` with a new session log entry describing what was done
