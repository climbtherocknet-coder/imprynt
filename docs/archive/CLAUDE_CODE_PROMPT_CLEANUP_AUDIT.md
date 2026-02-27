# Claude Code Prompt — February 26, 2026 (Cleanup Audit)

Read `CLAUDE.md` first. This is a READ-ONLY audit with ONE write action at the end.

Do NOT modify, delete, or back up any application files. The only file you create is `CLEANUP_AUDIT.md` in the project root.

---

## Task: Identify Abandoned Tables, Dead Files, and Orphaned Code

### Part 1: Database Table Usage Audit

For EVERY table in the public schema, determine if it's actively used by the application. For each table:

1. Search the entire `src/` directory for references to the table name (SQL queries, ORM references, etc.)
2. Check if any API route reads from or writes to it
3. Check if any component displays data from it
4. Note the row count (from AUDIT_RESULTS.md or query directly)

Classify each table as:
- **ACTIVE** — referenced in application code, has data or is ready to receive data
- **INFRASTRUCTURE** — used by auth/sessions/framework, not directly by app features
- **PLACEHOLDER** — table exists, schema is fine, but no application code references it yet (future feature)
- **ABANDONED** — table exists but nothing references it, or the feature it served was removed/replaced
- **UNKNOWN** — can't determine, needs manual review

Format as a markdown table: `| table_name | row_count | status | referenced_by | notes |`

### Part 2: API Route Audit

For every route under `src/app/api/`, check:
1. Is it imported or called from any client component, page, or other route?
2. Search `src/` for fetch calls to that endpoint path
3. Is it a duplicate of another route? (e.g., `/api/p-8k3x/*` vs `/api/admin/*`)

Classify each route as:
- **ACTIVE** — called from the app
- **DEPRECATED** — superseded by another route (note which one)
- **ORPHANED** — no client code calls it
- **INFRASTRUCTURE** — auth callbacks, webhooks, health checks

Format as: `| route_path | status | called_from | notes |`

### Part 3: Component/File Audit

For every file under `src/components/`, `src/lib/`, and `src/app/dashboard/`, check:
1. Is it imported by any other file?
2. Search for import statements referencing it

Classify as:
- **ACTIVE** — imported and used
- **ORPHANED** — exists but nothing imports it
- **DEPRECATED** — superseded (note by what)

Format as: `| file_path | status | imported_by | notes |`

Also check:
- `src/app/dashboard/setup/SetupWizardNew.tsx` — is it imported anywhere or is it dead?
- Any files in the project root that are outdated (old handoff docs, old prompts, etc.)

### Part 4: CSS Audit

For every CSS file in `src/styles/`, check:
1. Is it imported by any component or page?
2. Are there class names defined in it that aren't used in any JSX/TSX file?

Don't do an exhaustive class-by-class check (that would take forever), but flag any CSS file that appears to have NO imports.

### Part 5: Migration Gap

Migrations 044, 045, and 046 are missing from `db/migrations/`. Check:
1. Is there any reference to these migration numbers in code, comments, or git history?
2. Are there columns in the database that don't correspond to any existing migration file?
3. Document what columns might have been added by the missing migrations

Cross-reference the columns in the AUDIT_RESULTS.md schema dump against what each existing migration adds. Identify any columns that have no corresponding migration file.

### Part 6: Root Directory File Audit

List every file in the project root (not directories, just files). For each, classify:
- **ACTIVE** — currently used by the build, deployment, or development workflow
- **GOVERNANCE** — project documentation that should be maintained (CLAUDE.md, CONTEXT.md, ROADMAP.md, etc.)
- **DEPRECATED** — old handoff docs, old prompts, superseded files
- **GENERATED** — audit outputs, one-time files

### Part 7: Staged Fixes Directory

Check `staged-fixes/` directory:
1. List every file in it
2. For each file, compare against the current version in the active codebase
3. Determine if the staged version has any changes that HAVEN'T been incorporated into the active codebase
4. If everything in staged-fixes is superseded, recommend deletion

---

## Output

Write ALL findings to `CLEANUP_AUDIT.md` in the project root. Format as clean markdown with a section for each part above.

End the file with a **Recommended Actions** section that lists:
1. Tables safe to DROP (if any)
2. Files safe to DELETE (if any)
3. Routes safe to REMOVE (if any)
4. Things that need manual review before deciding

Do NOT actually delete or modify anything. This is an audit only. Tim will review and approve actions.

Do NOT modify CONTEXT.md or any other file. Only create `CLEANUP_AUDIT.md`.
