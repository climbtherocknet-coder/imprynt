# Claude Code Prompt — February 26, 2026 (Event Enhancements)

Read `CLAUDE.md` first. Follow all rules. Back up files before modifying them.

This prompt covers 3 tasks. Do them in order. Run `npx tsc --noEmit` after each task.

---

## Task 1: Fix PodEditor Timezone Double-Conversion (Leftover Bug)

**Problem:** The previous prompt asked for a timezone fix, but the PodEditor datetime-local inputs still have the broken double-conversion pattern:

```typescript
value={pod.eventStart ? new Date(new Date(pod.eventStart).getTime() - new Date(pod.eventStart).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
onChange={e => updatePodField(pod.id, 'eventStart', e.target.value ? new Date(e.target.value).toISOString() : '')}
```

This pattern converts to UTC on save and does a reverse offset on display, which is fragile and causes the "next day" timezone bug for evening events.

**Fix in `src/components/pods/PodEditor.tsx`:**

For ALL `datetime-local` inputs related to events (eventStart, eventEnd, and the listing open house dates), change:

**Value display (reading):**
```typescript
// OLD (broken double-conversion):
value={pod.eventStart ? new Date(new Date(pod.eventStart).getTime() - new Date(pod.eventStart).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}

// NEW (direct display — the stored value IS the local datetime):
value={pod.eventStart ? pod.eventStart.slice(0, 16) : ''}
```

If the stored value is already an ISO string with timezone (from before this fix), the `.slice(0, 16)` still works because ISO strings start with "YYYY-MM-DDTHH:MM". If it's a bare datetime-local string, it also works.

**onChange (saving):**
```typescript
// OLD (converts to UTC):
onChange={e => updatePodField(pod.id, 'eventStart', e.target.value ? new Date(e.target.value).toISOString() : '')}

// NEW (store the raw datetime-local value as-is):
onChange={e => updatePodField(pod.id, 'eventStart', e.target.value || '')}
```

**Also save the timezone automatically** when the user changes an event datetime. After the onChange for eventStart, also set the timezone:
```typescript
onChange={e => {
  updatePodField(pod.id, 'eventStart', e.target.value || '');
  if (e.target.value && !pod.eventTimezone) {
    updatePodField(pod.id, 'eventTimezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
  }
}}
```

Do this for eventStart only (not eventEnd, not listing open house dates). The timezone gets set once when the user first enters a start date.

**Apply the same value/onChange fix to ALL datetime-local inputs in PodEditor.tsx:**
- Event Start (in the event section)
- Event End (in the event section)
- Listing Open House Start (in the listing section)
- Listing Open House End (in the listing section)

There are 4 total datetime-local inputs. Search for `type="datetime-local"` to find them all.

**Also add `eventTimezone` to the pod creation defaults** where new pods are initialized (search for `eventStart: ''` in the initial state). Add `eventTimezone: ''` alongside it.

**Also update the pod save logic** (the section that builds the body for the PUT/POST request). Make sure `eventTimezone` is sent to the API:
```typescript
if (pod.podType === 'event') {
  body.eventStart = pod.eventStart;
  body.eventEnd = pod.eventEnd;
  body.eventVenue = pod.eventVenue;
  body.eventAddress = pod.eventAddress;
  body.eventStatus = pod.eventStatus;
  body.eventAutoHide = pod.eventAutoHide;
  body.eventTimezone = pod.eventTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
}
```

---

## Task 2: Facebook Event Import

**Overview:** When creating an event pod, users can paste a Facebook event URL to auto-populate the event fields. This is a convenience feature, not a dependency. If the scrape fails, the user fills in fields manually.

### Step 1: Install the scraper package

```bash
npm install facebook-event-scraper
```

This is a lightweight npm package that does a simple GET request to public Facebook event pages and extracts structured data. No API key required. No authentication. It may break if Facebook changes their markup, which is fine — it's a nice-to-have.

### Step 2: Create the API endpoint

Create `src/app/api/events/facebook/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { url } = await req.json();
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL required' }, { status: 400 });
  }

  // Validate it looks like a Facebook event URL
  const fbEventPattern = /facebook\.com\/(events\/\d+|events\/[a-zA-Z0-9-]+)/;
  if (!fbEventPattern.test(url)) {
    return NextResponse.json({ error: 'Not a valid Facebook event URL' }, { status: 400 });
  }

  try {
    // Dynamic import since the package is ESM
    const { scrapeFbEvent } = await import('facebook-event-scraper');
    const data = await scrapeFbEvent(url);

    // Map Facebook event data to our pod fields
    const result: Record<string, string> = {};

    if (data.name) result.title = data.name;
    if (data.description) result.body = data.description.slice(0, 500);
    if (data.photo?.url) result.imageUrl = data.photo.url;
    if (data.photo?.imageUri) result.imageUrl = data.photo.imageUri;
    if (data.ticketUrl) {
      result.ctaUrl = data.ticketUrl;
      result.ctaLabel = 'Get Tickets';
    }
    // If no ticket URL, use the Facebook event URL itself as the CTA
    if (!result.ctaUrl) {
      result.ctaUrl = url;
      result.ctaLabel = 'View on Facebook';
    }

    // Location
    if (data.location?.name) result.eventVenue = data.location.name;
    // Try to build address from location fields
    const addrParts: string[] = [];
    if (data.location?.address) addrParts.push(data.location.address);
    if (data.location?.city?.name) addrParts.push(data.location.city.name);
    if (data.location?.city?.stateAbbreviation) addrParts.push(data.location.city.stateAbbreviation);
    if (addrParts.length > 0) result.eventAddress = addrParts.join(', ');

    // Date/time — the scraper returns startTimestamp and endTimestamp (unix seconds)
    if (data.startTimestamp) {
      const d = new Date(data.startTimestamp * 1000);
      // Convert to datetime-local format in the browser's timezone
      // We'll let the frontend handle this, just pass the ISO string
      result.eventStart = d.toISOString();
    }
    if (data.endTimestamp) {
      const d = new Date(data.endTimestamp * 1000);
      result.eventStart_iso = result.eventStart || '';
      result.eventEnd = d.toISOString();
    }

    // Pass along whether we got timestamps so the frontend can convert to local
    result._hasTimestamps = data.startTimestamp ? 'true' : 'false';

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch event data';
    return NextResponse.json({ error: message, fallback: true }, { status: 422 });
  }
}
```

**Important note on the scraper data shape:** The `facebook-event-scraper` package's return type may vary. The fields I've referenced (name, description, photo, ticketUrl, location, startTimestamp, endTimestamp) are based on the documented type. The scraper returns different shapes depending on what Facebook exposes. Wrap everything in optional chaining and handle missing fields gracefully. If the package export is different (e.g., `scrapeFbEvent` doesn't exist), check the package's actual exports and adapt. The key function signatures are:
- `scrapeFbEvent(url: string)` — scrape a single event URL
- `scrapeFbEventFromFbid(fbid: string)` — scrape by Facebook event ID

### Step 3: Add the import UI in PodEditor

In the event section of PodEditor, add an "Import from Facebook" feature at the TOP of the event form (before the event name field).

**UI design:**
```
┌──────────────────────────────────────────────────┐
│  Import from Facebook (optional)                 │
│  ┌──────────────────────────┐ ┌──────────────┐   │
│  │ Paste Facebook event URL │ │   Import ▸   │   │
│  └──────────────────────────┘ └──────────────┘   │
│  ↳ Importing... / ✓ Imported! / ✗ Failed, fill  │
│    in manually below.                            │
└──────────────────────────────────────────────────┘
```

When the user clicks Import:
1. Show a loading state ("Importing...")
2. POST to `/api/events/facebook` with the URL
3. On success: populate the pod fields (title, body, imageUrl, eventVenue, eventAddress, ctaUrl, ctaLabel) using `updatePodField`. For dates: if `_hasTimestamps === 'true'`, convert the ISO strings to datetime-local format for the input fields. Show "✓ Imported! Review the details below."
4. On failure: show "Couldn't import from Facebook. Fill in the details manually." in a non-blocking way (not an error that prevents usage). The user just fills in the form normally.

**Date conversion on the frontend:** When the API returns ISO strings for eventStart/eventEnd, convert them to datetime-local format for the input fields:
```typescript
function isoToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
```
This converts to the user's local timezone automatically since `new Date()` uses local time for `.getHours()` etc.

**Add state variables for the import:**
```typescript
const [fbImportUrl, setFbImportUrl] = useState<Record<string, string>>({});  // per-pod URL input
const [fbImportStatus, setFbImportStatus] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({});
const [fbImportError, setFbImportError] = useState<Record<string, string>>({});
```

These should be keyed by pod ID so multiple event pods can have independent import states.

**Style the import section** with inline styles matching the existing PodEditor patterns (same inputStyle, labelStyle, etc.). Use a subtle bordered section to visually separate it from the manual fields. Use accent color for the Import button.

---

## Task 3: Event Link Button Enhancement

**Problem:** The event CTA currently only has one button (ctaLabel + ctaUrl). The user wants more flexibility, specifically:
- An "Event Link" button that links to the original event page (Facebook, Eventbrite, etc.)
- A separate ticket/RSVP button if applicable

**However,** adding a second URL field to the pod schema is overkill for V1. The simpler approach:

**Rename the field labels in the PodEditor** from:
- "Button text" → "Button label"
- "Ticket / RSVP URL" → "Event link"
- Placeholder: change from "https://eventbrite.com/..." to "https://facebook.com/events/... or ticket link"

This is just label changes, no schema changes. The existing ctaLabel + ctaUrl fields already support any URL. The Facebook import (Task 2) already sets ctaUrl to either the ticket URL (if found) or the Facebook event URL itself with appropriate labels.

**Also update the default button text in PodRenderer.tsx:**
The renderer already defaults to "Event Details" for the button label. This is correct and generic enough. No change needed there.

**Update the PodEditor event section** to reorder the fields slightly for better flow:
1. Import from Facebook (Task 2)
2. Event name
3. Date/time (start + end)
4. Venue
5. Address
6. Event link (button label + URL) — rename from "Ticket / RSVP URL"
7. Event image
8. Description
9. Status
10. Auto-hide toggle

This is mostly already the order, just verify and adjust if needed after adding the Facebook import section.

---

## After All Tasks

1. Run `npx tsc --noEmit` — zero errors
2. Run `docker compose build` — succeeds  
3. Test: create an event pod, enter dates, verify they display correctly on the public profile
4. Test: paste a Facebook event URL (try https://www.facebook.com/events/ + any public event ID), verify fields auto-populate. If the scraper fails (likely without network access in Docker), verify the error is graceful and the user can proceed manually.
5. Test: verify the event pod renders on Noir template with readable button text
6. Update `CONTEXT.md` with a new session log entry
