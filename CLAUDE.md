# CLAUDE.md — Project Rules of Engagement

**Project:** Imprynt Platform
**Location:** D:\Docker\imprynt
**Owner:** Tim Kline
**Last updated:** February 26, 2026

This file governs how Claude (Code and Chat) operates on this project. Read this FIRST before doing anything. These rules are non-negotiable.

---

## 1. Environment Rules

### Local Development Only
- All work happens in the local Docker environment (`docker compose up --build`)
- App: http://localhost:3000 (or http://192.168.50.42 via nginx)
- Database: localhost:5432 (user: imprynt, db: imprynt)
- **NEVER push to production, deploy, or modify production servers without explicit approval from Tim**
- Production deploys happen only after Tim reviews and approves changes locally

### Branch Discipline
- Work on a feature branch or directly on `main` for local dev (Tim's preference TBD)
- Commit logical units of work with clear commit messages
- No giant single commits covering multiple unrelated changes

---

## 2. Code Change Rules

### Backup Before Modifying
Before making **functional changes** to any existing file (not new files, not CSS-only changes):
1. Copy the original file to `backups/` with a timestamp suffix
2. Example: `cp src/app/dashboard/admin/page.tsx backups/admin-page-2026-02-25.tsx`
3. The `backups/` directory is gitignored and exists purely as a safety net
4. This applies to: component files (.tsx), API routes (route.ts), library files (lib/), database migrations
5. This does NOT apply to: new files, CSS-only edits, documentation, config files

### No Silent Breaking Changes
- If a change affects how an existing feature works, call it out explicitly before making it
- If a database migration is needed, write it as a separate numbered file in `db/migrations/` and describe what it does
- Never alter `db/init.sql` directly for schema changes on an existing database — use migrations
- Run `npx tsc --noEmit` after each logical change to verify no type errors

### File Naming and Location Conventions
- Components: PascalCase (e.g., `ProfileEditor.tsx`)
- API routes: `route.ts` inside the appropriate directory
- CSS files: lowercase in `src/styles/` with descriptive names
- Editor sections (reusable): `src/components/editor/`
- Admin/CC components: `src/components/admin/`
- Pod components: `src/components/pods/`
- Template components: `src/components/templates/`

---

## 3. Approval Gates

### Tim Must Approve Before:
- Any production deployment
- Database schema changes (migrations)
- Deleting or removing existing features
- Changing auth/security logic
- Modifying Stripe integration
- Changing the URL structure or routing
- Any change to the design system color tokens or font stack

### Claude Can Proceed Without Approval:
- Bug fixes that don't change behavior (e.g., fixing a CSS color, correcting a typo)
- Adding new CSS classes
- Creating new files/components that don't modify existing ones
- Writing documentation
- Creating backups
- Running type checks, linting, or build verification

---

## 4. Documentation Requirements

### After Every Work Session
Update `CONTEXT.md` with:
- Date and what was worked on
- What was completed
- What's still in progress
- Any decisions made or direction changes
- Any new bugs found

### After Every Production Deploy
Update ALL of the following via the Command Center database (SQL inserts or the CC UI):

1. **cc_features** — Mark shipped features as `status = 'shipped'`, set `shipped_at = NOW()`. Add new features as `status = 'planned'` or `'in_progress'`.
2. **cc_roadmap** — Move completed items to `phase = 'done'`, set `completed_at = NOW()`. Add new items to appropriate phase (`now`, `next`, `later`).
3. **cc_changelog** — Insert a new changelog entry with title, body, version, tags, and `is_public = true`.
4. **Schema ERD (SchemaTab)** — If any database migrations were applied, the Schema tab auto-reads from `information_schema`. Verify it reflects the new tables/columns.
5. **CONTEXT.md** — Add a session log entry noting the deploy date, what was deployed, and any post-deploy observations.

### After Every Feature Completion (Local)
- Update `CONTEXT.md` "What's In Progress" and "What's Built" sections
- Note it in the session log
- CC updates happen at deploy time, not during local dev

### Migration Documentation
Every migration file in `db/migrations/` must have a header comment explaining what it does and why.

---

## 5. Testing Checklist

Before declaring any feature "done":
1. `npx tsc --noEmit` passes (zero type errors)
2. `docker compose build` succeeds
3. Feature works in the browser at localhost
4. Mobile viewport tested (375px width minimum)
5. If touching profiles: test on at least one light template (clean) and one dark template (noir or midnight)
6. If touching auth: test login, logout, and protected route access
7. If touching the editor: verify changes reflect on the public profile page

---

## 6. Design System Reference

Do NOT introduce new colors or fonts without approval. Use the existing system:

- **Dashboard/Admin/Auth:** Dark navy + warm gold
- **Profile pages:** Template-driven via `src/lib/themes.ts` CSS variables
- **CSS pattern:** Prefixed classes per area (lp-, auth-, legal-, dash-, setup-, cc-, profile-, admin-)
- **No Tailwind.** Inline styles + CSS files with CSS variables.
- **Fonts:** Inter (body/UI) + Instrument Serif (headlines), loaded in layout.tsx

---

## 7. Naming Conventions

Use these terms consistently across code, UI, and docs:

| Term | Meaning |
|------|---------|
| Impression | Hidden PIN-gated personal layer (was "Easter Egg") |
| Showcase / Portfolio | Visible PIN-gated professional content |
| Pods | Content blocks on profiles (text, text_image, stats, listing, music, event) |
| Command Center (CC) | Admin tooling: features, roadmap, changelog, docs, schema |
| On Air | Profile published/live toggle |
| Signa | Analytics/view count metric |
| Imprynt | The platform/company |
| Sygnet | The NFC ring product |
| Armilla | The NFC band product |
| Tactus | The NFC fingertip product (R&D) |

---

## 8. Language Rules

### Banned Words
- **"identity"** — Do not use anywhere in user-facing copy, marketing, or product descriptions. It carries legal/regulatory connotations (identity verification, identity theft, identity management) that misrepresent what Imprynt does. Use alternatives: "presence," "page," "profile," "impression," "intro," "connection."

---

## 9. Architecture Decisions (Do Not Revisit)

These are settled. Don't re-propose alternatives:

- **Fixed profile structure, NOT a block builder** (for V1/V1.5)
- **Inline styles + CSS files, NOT Tailwind** (for now)
- **Server-rendered profiles with client-side hydration** for interactive elements
- **Single PIN entry field** that checks all active PINs and routes to the correct page
- **Profiles use obfuscated random slugs**, not usernames
- **NFC accessories point to `/r/{redirectId}`** which 302 redirects to current slug
- **Editor components are reusable** — the wizard should embed the same components as the dashboard editor, not duplicate them

---

## 9. Authoritative Documents and Source of Truth

### Primary (always current):

| Document | Purpose |
|----------|---------|
| `CLAUDE.md` (this file) | Rules of engagement, workflow constraints |
| `CONTEXT.md` | Session state, current progress, session log |
| `src/lib/themes.ts` | Template definitions (10 templates + custom) |
| Command Center (DB) | Features, roadmap, changelog, docs, schema ERD |

### Command Center is the canonical source for:
- **Features** — `cc_features` table, managed via CC UI at `/dashboard/admin`
- **Roadmap** — `cc_roadmap` table, managed via CC UI
- **Changelog** — `cc_changelog` table, managed via CC UI
- **Docs** — `cc_docs` table (design specs, decisions, strategy)
- **Schema ERD** — Schema tab reads live from `information_schema`

Do NOT maintain separate roadmap or buglist markdown files. The CC database is canonical. If you need to understand what's shipped, planned, or in progress, query the CC tables or ask Tim to run the audit prompt.

### Audit Snapshots (regenerate when needed):
- `AUDIT_RESULTS.md` — full database + codebase audit
- `CLEANUP_AUDIT.md` — dead code and abandoned table audit

### Deprecated (archived to `docs/archive/`):
- `HANDOFF.md`, `DESIGN_HANDOFF.md`, `CLAUDE_CODE_HANDOFF.md`, `CLAUDE_CODE_PROMPT.md`
- `ROADMAP.md`, `buglist.md` — superseded by CC database
- `sygnet-mvp-spec.md` — original MVP spec, product evolved far beyond it
- Old dated prompt files — one-time use

---

## 10. Context Recovery Protocol

If conversation history is lost or a new session starts without context:

1. Read `CLAUDE.md` (this file)
2. Read `CONTEXT.md` for current state and session log
3. If CONTEXT.md seems stale, run the audit prompt (`CLAUDE_CODE_PROMPT_AUDIT.md`) to regenerate `AUDIT_RESULTS.md` from the live database
4. Check the CC tables (features, roadmap, changelog) for the latest shipped/planned state
5. Do NOT assume features are missing based on old docs. Verify against the codebase and database first.

---

## 11. Quick Reference

### Run the project
```bash
cd D:\Docker\imprynt
docker compose up --build
```

### Reset the database
```bash
docker compose down -v && docker compose up --build
```

### Connect to the database
```bash
docker exec -it imprynt-db psql -U imprynt
```

### Type check
```bash
npx tsc --noEmit
```

### Key URLs (local)
- App: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard
- Page Editor: http://localhost:3000/dashboard/page-editor
- Command Center: http://localhost:3000/dashboard/admin
- Profile example: http://localhost:3000/{slug}

### Create backup
```bash
mkdir -p backups
cp src/path/to/file.tsx backups/filename-$(date +%Y-%m-%d-%H%M).tsx
```
