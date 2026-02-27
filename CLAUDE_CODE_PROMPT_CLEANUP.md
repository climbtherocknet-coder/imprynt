# Claude Code Prompt — February 26, 2026 (System Cleanup)

Read `CLAUDE.md` first. Follow all rules.

This prompt cleans up abandoned tables, dead files, orphaned code, and misplaced migrations identified in `CLEANUP_AUDIT.md`. Every action is documented.

---

## Task 1: Drop Abandoned Database Tables

Write a migration file `db/migrations/052_drop_abandoned_tables.sql`:

```sql
-- 052: Drop abandoned tables identified in cleanup audit (Feb 26, 2026)
--
-- sessions: NextAuth DB session table. App uses JWT strategy, never read or written. 0 rows.
-- verification_tokens: NextAuth adapter table. App uses email_verification_tokens instead. 0 rows.

DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS verification_tokens;
```

Run this migration against the database:
```bash
docker exec -i imprynt-db psql -U imprynt -d imprynt < db/migrations/052_drop_abandoned_tables.sql
```

---

## Task 2: Move Misplaced Migrations

Move these three files from `db/` to `db/migrations/`:

```bash
mv db/044_cc_votes.sql db/migrations/044_cc_votes.sql
mv db/045_event_pod.sql db/migrations/045_event_pod.sql
mv db/046_link_button_settings.sql db/migrations/046_link_button_settings.sql
```

Verify all 52 migration files are now in `db/migrations/` (001 through 052, no gaps).

---

## Task 3: Delete Dead Files

### Delete orphaned component
```bash
rm src/app/dashboard/setup/SetupWizardNew.tsx
```

### Delete legacy admin portal (page + API routes)
```bash
rm -rf src/app/p-8k3x/
rm -rf src/app/api/p-8k3x/
```

### Delete orphaned API routes
```bash
rm -rf src/app/api/auth/signout/
rm -rf src/app/api/showcase-items/
```

### Delete staged-fixes directory (all files superseded)
```bash
rm -rf staged-fixes/
```

### Delete empty/stale root files
```bash
rm -f sygnet-mvp-spec.md
rm -f db_production_dump.sql
```

---

## Task 4: Archive Deprecated Docs

Create `docs/archive/` directory and move deprecated docs there:

```bash
mkdir -p docs/archive
mv HANDOFF.md docs/archive/
mv DESIGN_HANDOFF.md docs/archive/
mv CLAUDE_CODE_HANDOFF.md docs/archive/
mv CLAUDE_CODE_PROMPT.md docs/archive/
mv ROADMAP.md docs/archive/
mv buglist.md docs/archive/
mv CLAUDE_CODE_PROMPT_2026-02-25.md docs/archive/
mv CLAUDE_CODE_PROMPT_2026-02-26.md docs/archive/
mv CLAUDE_CODE_PROMPT_2026-02-26-S2.md docs/archive/
mv CLAUDE_CODE_PROMPT_AUDIT.md docs/archive/
mv CLAUDE_CODE_PROMPT_CLEANUP_AUDIT.md docs/archive/
```

Move audit results to `docs/audits/`:
```bash
mkdir -p docs/audits
mv AUDIT_RESULTS.md docs/audits/
mv CLEANUP_AUDIT.md docs/audits/
```

---

## Task 5: Regenerate init.sql from Live Database

The current `db/init.sql` is stale (missing columns from migrations 040-051). Regenerate it from the live database schema so fresh `docker compose down -v && up` setups work correctly.

```bash
docker exec imprynt-db pg_dump -U imprynt -d imprynt --schema-only --no-owner --no-privileges > db/init.sql.new
```

Review `db/init.sql.new`:
- It should contain all 28 active tables (30 minus the 2 just dropped)
- Verify it includes all columns from the profiles table (49 columns), pods (33), protected_pages (40), etc.
- Remove any `SET` statements or connection parameters at the top that are Docker-specific
- Keep `CREATE TABLE`, `CREATE INDEX`, `CREATE TRIGGER`, and `CREATE FUNCTION` statements
- Add a header comment:

```sql
-- Imprynt Platform — Database Schema
-- Generated from live database: February 26, 2026
-- This file is used for fresh Docker environment setup.
-- For incremental changes, use numbered migration files in db/migrations/
```

Replace the old init.sql:
```bash
mv db/init.sql db/init.sql.bak
mv db/init.sql.new db/init.sql
```

Keep `db/init.sql.bak` temporarily in case anything breaks on a fresh reset.

---

## Task 6: Update Key URLs in CLAUDE.md

The legacy admin portal URL was removed. Verify `CLAUDE.md` no longer references `/p-8k3x`. If it does, remove that line from the Quick Reference section. (Note: I already updated CLAUDE.md from the Claude.ai side, but verify the file on disk matches.)

---

## Task 7: Clean Up CSS Import for Deleted Admin Portal

Check if `src/styles/admin.css` was imported by `src/app/p-8k3x/AdminClient.tsx` (now deleted). The audit showed it's also imported by `dashboard/admin/page.tsx`, so it should still be actively used. Verify no broken imports exist after the p-8k3x deletion.

Run:
```bash
npx tsc --noEmit
```

If there are type errors related to the deleted files, fix the imports.

---

## Task 8: Update Command Center

Run these SQL statements to log this cleanup in the CC:

```sql
-- Add changelog entry
INSERT INTO cc_changelog (title, body, version, entry_date, tags, is_public, created_by)
VALUES (
  'System Cleanup',
  'Dropped abandoned database tables (sessions, verification_tokens). Deleted legacy admin portal (/p-8k3x and its 6 duplicate API routes). Removed orphaned files (SetupWizardNew.tsx, /api/auth/signout, /api/showcase-items). Archived deprecated documentation. Regenerated init.sql from live schema. Moved misplaced migrations 044-046 to correct directory.',
  '0.9.6',
  CURRENT_DATE,
  '{cleanup,infrastructure,database}',
  true,
  (SELECT id FROM users WHERE email = (SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ',')) LIMIT 1) LIMIT 1)
);
```

If the admin email lookup fails, just use:
```sql
INSERT INTO cc_changelog (title, body, version, entry_date, tags, is_public)
VALUES (
  'System Cleanup',
  'Dropped abandoned database tables (sessions, verification_tokens). Deleted legacy admin portal (/p-8k3x and its 6 duplicate API routes). Removed orphaned files (SetupWizardNew.tsx, /api/auth/signout, /api/showcase-items). Archived deprecated documentation. Regenerated init.sql from live schema. Moved misplaced migrations 044-046 to correct directory.',
  '0.9.6',
  CURRENT_DATE,
  '{cleanup,infrastructure,database}',
  true
);
```

---

## Task 9: Update CONTEXT.md

Add a session log entry to CONTEXT.md:

```markdown
### February 26, 2026 (Session 3) — System Cleanup
- **What happened:** Executed cleanup based on CLEANUP_AUDIT.md findings.
- **Database:** Dropped 2 abandoned tables (sessions, verification_tokens). Migration 052 created.
- **Files deleted:** SetupWizardNew.tsx (orphaned), p-8k3x/ page + 6 API routes (deprecated), /api/auth/signout (orphaned), /api/showcase-items (orphaned), staged-fixes/ (all superseded), sygnet-mvp-spec.md (empty), db_production_dump.sql (one-time dump)
- **Files archived:** 11 deprecated docs moved to docs/archive/. 2 audit files moved to docs/audits/.
- **Migrations fixed:** 044, 045, 046 moved from db/ to db/migrations/. No more gap.
- **init.sql regenerated:** Fresh schema dump from live database replaces stale init.sql.
- **CC updated:** Changelog entry v0.9.6 for system cleanup.
- **CLAUDE.md updated:** Section 9 now points to CC as canonical source. Deprecated docs listed. Context recovery protocol added as section 10.
```

---

## After All Tasks

1. Run `npx tsc --noEmit` — zero errors
2. Run `docker compose build` — succeeds
3. Verify `db/migrations/` has 52 files (001-052, no gaps)
4. Verify `docs/archive/` has the moved files
5. Verify `docs/audits/` has the audit files
6. Verify `src/app/p-8k3x/` no longer exists
7. Verify `staged-fixes/` no longer exists
8. Test a page load at localhost to confirm nothing broke
