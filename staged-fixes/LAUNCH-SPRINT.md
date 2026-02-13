# Launch Sprint Prompt for Claude Code

## Overview
5 tasks to get the platform launch-ready. Do them in order. Run `npx tsc --noEmit` after each task to verify no type errors.

---

## Task 1: Setup Wizard Restructure (5 steps)

Restructure the setup wizard in `src/app/dashboard/setup/SetupWizard.tsx`. The wizard was just rewritten (uses 10-template system, has photo upload), but the step order needs to change.

**New flow (5 steps, down from 6):**

**Step 1: "Who are you?"** (merge old steps 1 + 3)
- First name, last name fields in a row at top
- Photo upload circle below them (move from old step 3, keep all existing upload logic using `/api/upload/photo`)
- Live preview showing photo or initials + name

**Step 2: "What do you do?"** (same as current step 2, no changes)
- Title, company, short bio

**Step 3: "Your contact card"** (NEW step)
- Heading explanation: "This info powers your Save Contact button. When someone taps it, these fields go straight into their phone's address book."
- Show 4 fields only:
  - Work Email (field_type: `email_work`, input type: email)
  - Cell Phone (field_type: `phone_cell`, input type: tel)
  - Work Phone (field_type: `phone_work`, input type: tel)
  - Work Address (field_type: `address_work`, input type: text)
- Simple stacked layout, label + input for each
- Below the fields: subtle note text "You can add more contact fields like personal email, home address, and pronouns from your dashboard."
- Save via PUT to `/api/account/contact-fields` — look at that endpoint's existing PUT handler for the batch save pattern (delete + re-insert). Send all non-empty fields with `showBusiness: true, showPersonal: true`.

**Step 4: "Choose your look"** (same as current step 4, no changes)
- Template picker + accent color

**Step 5: "Add your links"** (same as current step 5)
- Link editor, no changes to content
- BUT: the "Publish Profile" button goes on this step now. When user clicks Publish on step 5, save links AND call `/api/setup/complete`. Remove the old step 6 review page entirely.

**Update `TOTAL_STEPS` to 5. Update `STEP_LABELS` to ['You', 'About', 'Contact Card', 'Template', 'Links'].**

**API route changes (`src/app/api/setup/route.ts`):**
- Step 3 is now contact card: save fields via PUT to `/api/account/contact-fields` inline, or add contact field save logic directly in the setup route. Either approach works. The contact-fields PUT handler pattern is: delete all existing for user, re-insert non-empty fields.
- Step 5 now triggers publish (save links + complete)
- Renumber step handlers: 1=name, 2=about, 3=contact card, 4=template+accent, 5=links

**Add CSS for the contact card step to `src/styles/setup.css`.** Match existing dark style, stacked fields with labels.

---

## Task 2: Admin User Management (suspend, delete, edit)

**Database migration** — create `db/migrations/011_account_status.sql`:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended'));
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
```

Run this migration against the database.

**New API endpoints:**

`src/app/api/admin/users/[userId]/route.ts` — add PATCH and DELETE handlers to the existing file:

**PATCH** — Edit user fields. Accepts JSON body with optional: `email`, `firstName`, `lastName`, `plan`, `accountStatus`. Validate plan against allowed values ('free', 'premium_monthly', 'premium_annual'). Validate accountStatus against ('active', 'suspended'). Update only provided fields.

**DELETE** — Delete user account. Since the database has CASCADE on most foreign keys from users, just `DELETE FROM users WHERE id = $1` will cascade. But also: delete uploaded photos from filesystem (`public/uploads/photos/`), delete any documents. Return 200 on success. Require admin auth via `isAdmin()`.

**New endpoints:**

`src/app/api/admin/users/[userId]/suspend/route.ts` — POST: set `account_status = 'suspended'`, set `profiles.is_published = false` for their profile. Return success.

`src/app/api/admin/users/[userId]/reactivate/route.ts` — POST: set `account_status = 'active'`. Don't auto-republish their profile (they can do that themselves). Return success.

**Auth gate on login** — In `src/lib/auth.ts`, in the authorize callback or session callback, check `account_status`. If user is suspended, deny login. Return an error message like "Your account has been suspended. Contact support."

**Profile rendering gate** — In `src/app/[slug]/page.tsx`, the `getProfile` query should add `AND u.account_status = 'active'` to the WHERE clause. Suspended users' profiles should return `notFound()`.

**Admin UI** — In `src/app/admin/AdminClient.tsx`, add action buttons to the user detail view:
- "Suspend Account" button (if active) / "Reactivate Account" button (if suspended)
- "Delete Account" button (with confirmation dialog: "This will permanently delete this user and all their data. Type DELETE to confirm.")
- "Change Plan" dropdown (free / premium_monthly / premium_annual)
- Show account status badge (green "Active" / red "Suspended") on user rows

---

## Task 3: Account Deletion (User Self-Service)

**New API endpoint:** `src/app/api/account/delete/route.ts`

POST handler (requires auth):
- Verify the user's password (require them to send `{ password }` in body, verify against stored hash)
- Delete the user row: `DELETE FROM users WHERE id = $1` (cascades handle the rest)
- Delete uploaded photos from filesystem: `rm public/uploads/photos/*` for that user (query photo_url from profile before deleting)
- Destroy the session
- Return `{ success: true }`

**UI in AccountClient.tsx:**
- Add a "Danger Zone" section at the bottom of the account settings page
- Red-bordered card with "Delete Account" heading
- Text: "This will permanently delete your account, profile, and all associated data. This action cannot be undone."
- Button: "Delete My Account" (red)
- On click: modal/dialog asking user to type their password to confirm
- On confirm: POST to `/api/account/delete`, then redirect to homepage

---

## Task 4: Branded 404 and Error Pages

**Create `src/app/not-found.tsx`:**
- Imprynt branded page
- Dark background matching the dashboard/auth aesthetic (#0a0e17 or similar)
- Centered content: Imprynt logo mark, "Page not found" heading, "This page doesn't exist or has been moved." subtext
- "Go to Imprynt" button linking to trysygnet.com
- "Back" link that calls router.back()
- Clean, minimal, on-brand

**Create `src/app/error.tsx`:**
- Must be a Client Component ('use client')
- Same visual style as 404
- "Something went wrong" heading
- "Try again" button that calls reset()
- "Go home" link to trysygnet.com

Both pages should import and use the same base styles. Add styles to a new `src/styles/error.css` or inline them.

---

## Task 5: Verify and Fix vCard + Contact Card Integration

The vCard endpoint is at `src/app/api/vcard/[profileId]/route.ts`. It already reads from both the `links` table and `contact_fields` table. But the new wizard contact card step (Task 1) means users will now have contact_fields populated during onboarding.

**Verify:**
1. Create a test user through the wizard, fill in contact card fields
2. Visit their profile, click "Save Contact"
3. Open the downloaded .vcf file and verify it contains the contact card fields (work email, cell phone, work phone, work address)
4. Test on iOS Safari and Android Chrome if possible

**Potential issue:** The vCard endpoint pulls `email` and `phone` from the `links` table AND from `contact_fields`. If a user enters their email as both a link and a contact field, it may appear twice in the vCard. Check for duplicates and deduplicate:
- If the same email appears in both links and contact_fields, only include it once
- If the same phone appears in both, only include it once
- Prefer the contact_fields version (it has type metadata like WORK vs CELL)

**Fix the deduplication** in the vCard route if needed.

---

## After All Tasks

Run `npx tsc --noEmit` to confirm zero errors.
Run `docker compose build` to verify the build succeeds.
Test the full flow: register → wizard → publish → view profile → save contact → admin panel.
