# Claude Code Prompt — February 26, 2026 (Production Deploy)

Read `CLAUDE.md` first. Follow all rules.

This is a production deployment. Run all verification steps before deploying.

---

## Pre-Deploy Verification

### Step 1: Type check
```bash
npx tsc --noEmit
```
Must pass with zero errors. If there are errors, fix them before proceeding.

### Step 2: Build
```bash
docker compose build
```
Must succeed. If it fails, fix and retry.

### Step 3: Quick smoke test
Start the dev environment and verify these pages load without errors:
- http://localhost:3000 (landing page — verify new section order, no comparison table)
- http://localhost:3000/faq (FAQ page — verify accordion works)
- http://localhost:3000/demo (demo showcase)
- http://localhost:3000/login (auth page)
- Load any demo profile slug and verify:
  - Photo lightbox opens with name + Save Contact
  - QR button appears (should always show on free profiles)
  - Free CTA ("Create your free Imprynt profile") appears at bottom
  - Event pods display correctly if any exist

If anything is broken, stop and fix before deploying.

---

## Deploy

Run the production deploy script:
```bash
powershell -File deploy.ps1
```

If `deploy.ps1` handles the full pipeline (build, push, restart), let it run. If it needs manual steps, follow the existing production deploy process documented in the script.

---

## Post-Deploy: Update Command Center

### Changelog entry

```sql
INSERT INTO cc_changelog (title, body, version, entry_date, tags, is_public)
VALUES (
  'Production Deploy — v0.9.8',
  'System cleanup: dropped abandoned tables, removed legacy admin portal, archived deprecated docs. Event enhancements: timezone fix, Facebook event import, event link label updates. Profile polish: photo lightbox with Save Contact, QR always-on for free tier with themed modal, free tier signup CTA. FAQ/Trust page with accordion Q&A and trust signals. Landing page revision: removed comparison table, reordered sections, outcome-focused copy rewrite, trimmed use cases.',
  '0.9.8',
  CURRENT_DATE,
  '{deploy,production,cleanup,events,lightbox,qr,faq,landing}',
  true
);
```

### Mark roadmap items done

```sql
-- FAQ/Trust page
UPDATE cc_roadmap SET phase = 'done', completed_at = NOW()
WHERE title ILIKE '%faq%' OR title ILIKE '%trust page%';
```

### Mark features shipped (if not already)

```sql
-- FAQ page
UPDATE cc_features SET status = 'shipped', shipped_at = NOW()
WHERE name ILIKE '%faq%' AND status != 'shipped';
```

If there's no existing feature entry for FAQ, the one we inserted earlier should already be marked shipped.

---

## Post-Deploy: Update CONTEXT.md

Add this session log entry:

```markdown
### February 26, 2026 (Production Deploy — v0.9.8)
- **Deployed to production.** All changes from sessions 3-6 are now live.
- **What shipped:**
  - System cleanup (v0.9.6): dropped abandoned tables, removed legacy admin portal (/p-8k3x), archived deprecated docs, regenerated init.sql, fixed migration gap
  - Event enhancements (v0.9.7): timezone fix, Facebook event import, event link label updates
  - Profile polish: photo lightbox with Save Contact, QR always-on for free tier, themed QR modal, free tier signup CTA
  - FAQ/Trust page with grouped accordion Q&A, trust signals, signup CTA
  - Landing page revision: removed comparison table, reordered sections (How it works moved up, pricing before products), outcome-focused value props, tightened hero copy, trimmed use cases from 6 to 4
- **Version:** v0.9.8
- **Post-deploy:** Verify production site loads correctly. Check FAQ, landing page, and a demo profile.
```

---

## Post-Deploy Verification

After deploy completes, verify on the production URL:
1. Landing page loads with new section order
2. FAQ page loads at /faq
3. A demo profile loads with lightbox, QR, and free CTA
4. No console errors on any page
5. Mobile viewport looks correct

Report any issues found.
