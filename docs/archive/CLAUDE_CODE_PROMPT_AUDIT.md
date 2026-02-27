# Claude Code Prompt — February 26, 2026 (Context Audit)

Read `CLAUDE.md` first.

This is a READ-ONLY audit. Do NOT modify any files. Do NOT back up anything. Just query and report.

## Task: Export Command Center Data + Codebase Feature Audit

Run the following queries against the running PostgreSQL database and write the results to a single file: `AUDIT_RESULTS.md` in the project root.

### Step 1: Database Queries

Connect to the database using the same connection the app uses (check `.env` or `docker-compose.yml` for the DATABASE_URL or PG connection details). Run these queries and write the results as markdown tables:

```sql
-- 1. All features with status
SELECT name, category, status, release_phase, priority,
       CASE WHEN shipped_at IS NOT NULL THEN to_char(shipped_at, 'YYYY-MM-DD') ELSE '' END as shipped
FROM cc_features
ORDER BY status, priority;

-- 2. Roadmap items
SELECT title, phase, category, priority,
       CASE WHEN completed_at IS NOT NULL THEN to_char(completed_at, 'YYYY-MM-DD') ELSE '' END as completed,
       target_date
FROM cc_roadmap
ORDER BY phase, priority;

-- 3. Changelog entries
SELECT title, version, entry_date, tags, is_public
FROM cc_changelog
ORDER BY entry_date DESC
LIMIT 30;

-- 4. Schema summary — list all tables and their column counts
SELECT table_name, COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY table_name
ORDER BY table_name;

-- 5. Profile columns (to see what's actually built)
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 6. Users columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 7. Pods columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'pods'
ORDER BY ordinal_position;

-- 8. Protected pages columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'protected_pages'
ORDER BY ordinal_position;

-- 9. Links columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'links'
ORDER BY ordinal_position;

-- 10. All migrations applied
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'schema_migrations';
-- If schema_migrations exists:
-- SELECT * FROM schema_migrations ORDER BY 1;
-- If not, just list the migration files on disk:
-- ls db/migrations/

-- 11. Count of users, profiles, pods, links, protected_pages
SELECT 'users' as tbl, COUNT(*) as cnt FROM users
UNION ALL SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL SELECT 'pods', COUNT(*) FROM pods
UNION ALL SELECT 'links', COUNT(*) FROM links
UNION ALL SELECT 'protected_pages', COUNT(*) FROM protected_pages
UNION ALL SELECT 'cc_features', COUNT(*) FROM cc_features
UNION ALL SELECT 'cc_roadmap', COUNT(*) FROM cc_roadmap
UNION ALL SELECT 'cc_changelog', COUNT(*) FROM cc_changelog
UNION ALL SELECT 'cc_docs', COUNT(*) FROM cc_docs;
```

### Step 2: Codebase Feature Scan

Also scan the codebase and add these sections to the audit file:

**API Routes:** List every directory under `src/app/api/` (2 levels deep).

**Dashboard Pages:** List every directory/file under `src/app/dashboard/` (2 levels deep).

**Components:** List every file under `src/components/` (2 levels deep).

**Lib files:** List every file under `src/lib/`.

**Styles:** List every file under `src/styles/`.

**Key feature checks** — for each, report YES/NO and the file path if found:
- Slug rotation UI or API (search for "rotate" in src/)
- Link click tracking (search for "link_click" or "trackClick" in src/)
- FAQ page (search for "faq" in src/app/)
- Icon-only link mode (search for "icons-only" or "icon_only" or "iconOnly" in link-related files)
- Resume/document upload (search for "resume" or "document upload" in src/)
- Setup wizard — which file is active? (check what page.tsx imports)
- On Air toggle (search for "is_published" or "onAir" or "on-air" in dashboard)
- Free tier CTA on profiles (search for "free-cta" or "Create your" in ProfileTemplate)
- Link preview manual fallback (check og-preview route and link_preview pod editor)
- Multiple protected pages UI (check impression page for "add another" or multiple page management)

### Output

Write everything to `AUDIT_RESULTS.md` in the project root. Format as clean markdown with headers for each section. Include the raw query results as markdown tables. This file will be read by Claude.ai to update project context.

Do NOT modify any other files.
