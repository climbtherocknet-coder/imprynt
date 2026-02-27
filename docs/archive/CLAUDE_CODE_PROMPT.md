Read DESIGN_HANDOFF.md and sygnet-mvp-spec.md before doing anything. These are your source of truth for design decisions, product requirements, and technical architecture. Do not deviate from the design system documented in DESIGN_HANDOFF.md.

The project is a Next.js 15 app with PostgreSQL, running in Docker. The landing page, auth pages, and legal pages have already been redesigned with a dark navy + warm gold design system. The dashboard, setup wizard, and profile pages are still on the old light theme with inline styles and need to be rebuilt.

Here is the priority order:

1. **Setup wizard rebuild** (`src/app/dashboard/setup/page.tsx`). This is the first thing new users see after registration. Rebuild it as a multi-step wizard with the dark navy design system. Steps: name, role/company, template selection with visual preview cards, color customization, link management with add/remove/reorder, and a review/publish step with live preview. Add a progress indicator and back/next navigation. Reference the design tokens in `src/styles/auth.css` for the component patterns (inputs, buttons, labels, cards) and create a new `src/styles/setup.css` if needed.

2. **Profile template system**. Build 5 templates (Clean/Minimal, Dark/Premium, Bold/Creative, Classic/Professional, Warm/Personal) as separate components. Each template renders the same profile data with a different visual treatment. Templates must be mobile-first, responsive, and have consistent content placement so switching templates does not break the page. Free tier gets 2 templates, paid gets all 5. Template selection in the setup wizard should show visual preview cards of each option.

3. **Dashboard redesign**. Rebuild the dashboard pages to match the dark navy design system. Create `src/styles/dashboard.css` using the same CSS variable pattern as the other style files. Sections: My Profile (edit bio/name/title/photo, manage links, switch template, customize colors, preview), Content Sections (add/edit/remove blocks), Showcase (typed items: Project, Listing, Service, Event with public/private toggles), Impression Settings (was Easter Egg, rename throughout), Analytics (basic view count chart), Account Settings. The dashboard sidebar or nav should include the logo mark and feel consistent with the landing page nav.

4. **Rename Easter Egg to Impression** everywhere in the codebase: file names, route paths, component names, UI copy, database references if any exist in code. The directory `src/app/dashboard/easter-egg/` should become `src/app/dashboard/impression/`. Update any API routes that reference easter egg.

5. **Profile page rebuild** (`src/app/[slug]/page.tsx`). Implement the three-layer structure: public profile (Layer 1), portfolio/showcase with PIN gate (Layer 2), and Impression/hidden personal layer with PIN gate (Layer 3). The Impression icon is the circle-dot logo mark, user-customizable for color, opacity, and corner placement. A single PIN entry field on the profile checks against all active PINs and routes to the correct layer.

Do not change the landing page, auth pages, or legal pages. Those are done. Do not change the API routes or database schema unless necessary to support the new features. Run the dev server and verify your changes compile and render correctly as you go. Commit logical units of work, not one giant commit.

The CSS variables and font setup are already in `src/app/layout.tsx` and the existing style files. Use those variables everywhere. Do not introduce new colors or fonts. Do not use inline styles. Use CSS files with the `lp-`, `auth-`, `legal-` prefixed class pattern established in the existing stylesheets, choosing appropriate prefixes for new pages (e.g., `setup-`, `dash-`, `profile-`).
