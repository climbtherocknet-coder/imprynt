-- ============================================================
-- Command Center seed — Feb 24, 2026
-- ============================================================

-- CLEAR existing CC data (safe — these are internal planning tables)
TRUNCATE cc_votes, cc_comments, cc_changelog, cc_roadmap, cc_features, cc_docs CASCADE;

-- ============================================================
-- FEATURES — current state as of Feb 24, 2026
-- ============================================================
INSERT INTO cc_features (name, description, category, status, release_phase, priority) VALUES
  -- SHIPPED (v1)
  ('User Registration & Auth', 'Email/password signup, email verification, session management, password reset', 'auth', 'shipped', 'v1', 1),
  ('Profile Pages', 'Public business page with name, bio, photo, links, templates, vCard download', 'platform', 'shipped', 'v1', 2),
  ('Protected Pages', 'PIN-gated Impression and Portfolio pages with hidden (easter egg) and visible (protected link) modes', 'platform', 'shipped', 'v1', 3),
  ('Template System', '10 templates (Clean, Warm, Classic, Soft, Midnight, Editorial, Noir, Signal, Studio, Dusk) with accent color, font pair, and custom theme overrides', 'templates', 'shipped', 'v1', 4),
  ('Content Blocks (Pods)', 'Text, text+image, stats, CTA, link preview, project pod types with drag-and-drop reorder', 'content_blocks', 'shipped', 'v1', 5),
  ('Listing Pods', 'Smart real estate listing cards with URL parsing (Zillow, Realtor, Redfin, Trulia), status lifecycle, open house mode, auto-remove scheduling', 'content_blocks', 'shipped', 'v1', 6),
  ('Event Pods', 'Date/time, venue, address, countdown timer, auto-hide after event ends, status badges (upcoming, cancelled, postponed, sold out)', 'content_blocks', 'shipped', 'v1', 7),
  ('Music Pods', 'Audio upload with playback, cover art, artist name, external link. Supports MP3, WAV, M4A, OGG, AAC.', 'content_blocks', 'shipped', 'v1', 8),
  ('Dashboard', 'Time-aware greeting, On Air toggle, status tags, My Links modal, navigation cards, mobile-responsive layout', 'ux', 'shipped', 'v1', 9),
  ('Page Editor', 'Tabbed editor (Profile, Personal, Portfolio) with inline preview, collapsible sections, floating save/view buttons', 'ux', 'shipped', 'v1', 10),
  ('Analytics', 'Page views, link clicks, view history with timestamps', 'analytics', 'shipped', 'v1', 11),
  ('Stripe Payments', 'Subscriptions (monthly/annual), one-time accessory purchases, hosted checkout, customer portal, webhook handling', 'payments', 'shipped', 'v1', 12),
  ('NFC Redirect System', 'Static redirect URLs (/r/USER_ID) with 302 to randomized slugs, slug rotation on demand', 'platform', 'shipped', 'v1', 13),
  ('Photo System', 'Profile photo, cover photo, background photo with drag-to-reposition (ImageCropper), zoom, opacity controls. Per-page photo independence.', 'ux', 'shipped', 'v1', 14),
  ('Custom Themes', 'User color overrides for any template via custom theme editor. Independent from template defaults.', 'templates', 'shipped', 'v1', 15),
  ('Gallery Backgrounds', 'Curated image gallery for cover and background photo selection', 'templates', 'shipped', 'v1', 16),
  ('Link Customization', 'Per-link button colors, link display modes (default, icons, stacked, full-width pills), link size and shape controls', 'ux', 'shipped', 'v1', 17),
  ('Demo Profiles', '10+ curated demo accounts across target segments with protected pages and content blocks', 'marketing', 'shipped', 'v1', 18),
  ('Invite System', 'Invite codes with granted plan levels, waitlist management', 'platform', 'shipped', 'v1', 19),
  ('Command Center', 'Internal operating hub: features, roadmap, changelog, docs, comments, voting, advisory access', 'platform', 'shipped', 'v1', 20),
  ('Feedback System', 'User feedback submission from profile pages with scoring', 'platform', 'shipped', 'v1', 21),
  ('Connections', 'Basic connection tracking between users', 'platform', 'shipped', 'v1', 22),
  ('Free Trial', '7-day premium trial for new users, trial activation from dashboard', 'payments', 'shipped', 'v1', 23),

  -- IN PROGRESS
  ('Editor Polish', 'Floating save/view buttons, link color inheritance across tabs, mobile layout refinements', 'ux', 'in_progress', 'v1', 24),

  -- PLANNED (v1.5)
  ('Testimonial Pods', 'Quote cards with attribution and optional photo for social proof', 'content_blocks', 'planned', 'v1.5', 25),
  ('Video Embed Pods', 'YouTube, Vimeo, TikTok inline embed with thumbnail preview', 'content_blocks', 'planned', 'v1.5', 26),
  ('AI-Assisted Onboarding', 'LLM-powered profile generation from prompts or LinkedIn URL', 'platform', 'planned', 'v1.5', 27),
  ('Dashboard Banners', 'Admin-posted announcements visible in user dashboards', 'marketing', 'planned', 'v1.5', 28),
  ('Email Communications', 'Transactional and marketing email with templates via Resend', 'marketing', 'planned', 'v1.5', 29),
  ('Enhanced Analytics', 'Geographic breakdown, referral source tracking, most-clicked links', 'analytics', 'planned', 'v1.5', 30),
  ('Token-Based Links', 'Time-limited URLs per NFC tap with configurable expiration', 'security', 'planned', 'v1.5', 31),
  ('Free Tier Branding', 'Powered by Imprynt watermark/banner on free profiles', 'platform', 'planned', 'v1.5', 32),

  -- PLANNED (v2)
  ('Contact Rolodex / CRM', 'Saved connections with notes, mutual sync, search, CSV export', 'platform', 'planned', 'v2', 33),
  ('LinkedIn Import', 'OAuth integration to auto-populate profile from LinkedIn', 'integrations', 'planned', 'v2', 34),
  ('Mobile App', 'iOS and Android native app with NFC programming, dashboard, push notifications', 'platform', 'exploring', 'v2', 35),
  ('Custom Domains', 'User-owned domain pointing to their profile with automated SSL', 'platform', 'exploring', 'v2', 36),
  ('Team/Enterprise Plans', 'Company-managed templates, bulk rings, admin dashboard', 'platform', 'exploring', 'v2', 37),
  ('API Access', 'Public API for integrations, webhooks, CRM connections', 'integrations', 'exploring', 'v2', 38);

-- ============================================================
-- ROADMAP — current work priorities
-- ============================================================
INSERT INTO cc_roadmap (title, description, phase, category, priority) VALUES
  ('Editor floating buttons', 'Fixed-position save/view/preview buttons replacing broken scroll detection', 'now', 'ux', 1),
  ('Link color inheritance', 'Per-link buttonColor flowing from Profile to Personal/Portfolio editor previews', 'now', 'ux', 2),
  ('Music pod production deploy', 'Run migration 048 on production, verify music pod creation works', 'now', 'content_blocks', 3),
  ('Cover photo Y-position fix', 'Default to 105% background-size instead of cover so Y repositioning always works', 'now', 'ux', 4),

  ('Testimonial pods', 'Quote, attribution, photo for social proof', 'next', 'content_blocks', 5),
  ('Video embed pods', 'YouTube, Vimeo, TikTok inline embed', 'next', 'content_blocks', 6),
  ('Dashboard banners system', 'Admin-posted announcements visible in user dashboards', 'next', 'marketing', 7),
  ('Animated explainer video', 'AI-generated explainer video with kraft paper aesthetic', 'next', 'marketing', 8),
  ('Template light/dark variants', 'Light and dark mode options for existing templates', 'next', 'templates', 9),

  ('Free tier branding banner', 'Powered by Imprynt watermark on free profiles', 'later', 'platform', 10),
  ('Recovery email improvements', 'Enhanced password reset flow and account recovery', 'later', 'auth', 11),
  ('Waitlist modal', 'Pre-launch signup capture on trysygnet.com', 'later', 'marketing', 12),
  ('AI onboarding', 'LLM-powered profile builder from prompts or LinkedIn', 'later', 'platform', 13),
  ('Impryntables LED prototypes', 'LED-enabled NFC accessories R&D', 'later', 'hardware', 14),
  ('Alternative NFC form factors', 'Phone cases, challenge coins, metal cards, guitar picks', 'later', 'hardware', 15),

  ('Listing pods', 'Smart real estate listing cards with URL parsing', 'done', 'content_blocks', 16),
  ('Event pods', 'Date/time, venue, countdown, auto-expire', 'done', 'content_blocks', 17),
  ('Music pods', 'Audio upload and playback in content blocks', 'done', 'content_blocks', 18),
  ('Dashboard redesign', 'Time-aware greeting, On Air controls, nav cards', 'done', 'ux', 19),
  ('Photo system overhaul', 'ImageCropper, cover photos, background photos, gallery', 'done', 'ux', 20),
  ('Custom themes', 'User color overrides for any template', 'done', 'templates', 21),
  ('Command Center Phase 1', 'Features, roadmap, changelog, docs, comments, voting', 'done', 'platform', 22),
  ('Protected pages redesign', 'Four-button control grid, PIN cards, breadcrumbs', 'done', 'ux', 23),

  ('Contact Rolodex', 'Saved connections with notes and sync', 'icebox', 'platform', 24),
  ('Business card scanner', 'OCR-based contact import from phone camera', 'icebox', 'platform', 25);

-- ============================================================
-- CHANGELOG — shipped updates timeline
-- ============================================================
INSERT INTO cc_changelog (title, body, version, entry_date, tags, is_public) VALUES
  ('Editor Save Buttons + Link Consistency', 'Fixed-position save/view buttons in bottom-right corner of page editor (replacing broken scroll-detection approach). Per-link colors now carry through from Profile to Personal and Portfolio previews. Link size, shape, and global button color settings propagate to protected page previews. Mobile dashboard cards stack single-column.', '0.9.3', '2026-02-24', '{shipped,fix,editor}', true),
  ('Event Pods', 'Added event content block type with date/time, venue, address, countdown timer, and auto-hide after event ends. Status badges for upcoming, cancelled, postponed, and sold out. Integrated into listing pod open house mode.', '0.9.2', '2026-02-24', '{content_blocks,events}', true),
  ('Listing Pods', 'Smart real estate listing cards with URL parsing for Zillow, Realtor.com, Redfin, and Trulia. Status lifecycle (Active, Pending, Sold, Rented, Open House) with auto-remove scheduling. Photo upload fallback.', '0.9.1', '2026-02-23', '{content_blocks,real_estate}', true),
  ('Dashboard Redesign', 'Time-aware greeting, consolidated On Air and Status controls, My Links modal with QR code, PIN indicator links, streamlined navigation cards.', '0.9.0', '2026-02-23', '{ux,dashboard}', true),
  ('Photo Alignment Rewrite', 'Three-button Left/Center/Right alignment with CSS specificity fix for all templates. Per-page photo independence for cover and background images.', '0.8.5', '2026-02-22', '{ux,photos}', true),
  ('Protected Pages Redesign', 'Four-button control grid, consolidated info boxes, impression icon in PIN cards, navigation breadcrumbs.', '0.8.4', '2026-02-22', '{ux,protected_pages}', true),
  ('Custom Themes + Cover Photos', 'User color overrides for any template. Independent cover photo and background photo systems with opacity and position controls.', '0.8.3', '2026-02-22', '{templates,customization}', true),
  ('10 Templates', 'Shipped Clean, Warm, Classic, Soft, Midnight, Editorial, Noir, Signal, Studio, and Dusk templates with accent color and font pair customization.', '0.8.0', '2026-02-20', '{templates}', true),
  ('Demo Profiles', '10 curated demo accounts across target segments (networkers, creatives, service providers) with protected pages and content blocks.', '0.7.5', '2026-02-20', '{marketing,demos}', true),
  ('Unified Link System', 'Single link list with per-link visibility toggles (Profile, Personal, Portfolio). Drag-and-drop reorder. Icon-only and pill display modes.', '0.7.0', '2026-02-14', '{platform,links}', true),
  ('Hetzner Production Deploy', 'Docker-based production deployment on Hetzner VPS with Caddy reverse proxy, Cloudflare CDN, automated SSL, Umami analytics.', '0.6.0', '2026-02-13', '{infrastructure,deployment}', true),
  ('Auth + Stripe Integration', 'Email/password auth via Auth.js, Stripe subscriptions and one-time purchases, customer portal, webhook handling.', '0.5.0', '2026-02-13', '{auth,payments}', true),
  ('MVP Foundation', 'Core platform scaffold: Next.js 15, PostgreSQL 16, Docker development environment, profile pages, protected pages, NFC redirect system.', '0.1.0', '2026-02-11', '{platform,foundation}', true);

-- ============================================================
-- DOCS — strategy and reference documents
-- ============================================================
INSERT INTO cc_docs (title, body, doc_type, visibility, is_pinned, tags) VALUES
  ('V1 MVP Specification', E'The full product spec is maintained in the project repository as sygnet-mvp-spec.md. This document covers: product summary, target audience, value propositions, feature specifications (profiles, protected pages, templates, dashboard, analytics), pricing tiers, technical architecture, NFC sourcing/fulfillment, Tactus prototype plan, and success metrics.\n\nKey decisions: Next.js 15 + PostgreSQL 16, Hetzner VPS, Cloudflare CDN, Stripe payments, Auth.js authentication.', 'design_spec', 'advisory', true, '{product,spec,v1}'),

  ('Target Segments', E'**Networkers:** Product managers, realtors, lawyers, founders, sales professionals, conference attendees.\n\n**Creatives:** Photographers, DJs, content creators, designers, musicians.\n\n**Service Providers:** Handymen, auto detailers, personal trainers, yoga instructors, coaches.\n\nGen Z is a key secondary audience, drawn to the easter egg feature for separating professional and personal identities. The dual-nature (networking tool + micro-storefront) creates broader market appeal than traditional digital business cards.', 'strategy', 'advisory', true, '{marketing,segments}'),

  ('Pricing Model', E'**Free Tier:** 1 profile page, 2 templates, Imprynt branding, no protected pages, no analytics.\n\n**Premium Monthly:** $5.99/mo, all features, all templates, protected pages, analytics.\n\n**Premium Annual:** $49.99/yr (~$4.17/mo), ~30% discount.\n\n**Bundles:**\n- Sygnet Starter: Ring + 1yr Premium = $59.99\n- Armilla Starter: Band + 1yr Premium = $49.99\n- Combo: Ring + Band + 1yr Premium = $79.99\n\n**Free Trial:** 7-day premium trial for new users, activated from dashboard.', 'strategy', 'advisory', false, '{pricing,business_model}'),

  ('Hardware & Accessories', E'**Sygnet Ring:** Ceramic NFC, NTAG215 (preferred for cost/capacity balance). US sizes 7-11. Bulk sourcing from Alibaba (Hecere, Jianhe Smartcard). Custom logo engraving available. COGS ~$12 bulk, retail $39-49.\n\n**Armilla Band:** Adjustable silicone, NTAG216. Bulk from RFIDSilicone/CXJ. COGS ~$10, retail $29-39.\n\n**Tactus Tip:** R&D phase. Silicone dip-coat (EcoFlex 00-30) over micro NFC inlay on 3D-printed finger forms. Prototype BOM ~$60-80.\n\n**Key Learning:** Standard NFC tags do not work on metal surfaces. Anti-metal NTAG tags with ferrite layers required for challenge coins and metal cards.\n\n**Alternative Form Factors Under Exploration:** Phone cases, challenge coins, metal cards, guitar picks.', 'note', 'advisory', false, '{hardware,nfc,manufacturing}'),

  ('Architecture & Infrastructure', E'**Stack:** Next.js 15 (frontend + API), PostgreSQL 16, Docker + Docker Compose, Caddy reverse proxy\n\n**Hosting:** Hetzner VPS (CX21/CX31), Cloudflare CDN/DNS\n\n**Services:** Stripe (payments), Auth.js (authentication), Resend (email, planned), Umami (analytics)\n\n**Dev Workflow:** Local Docker -> GitHub -> Hetzner VPS\n\n**Performance Targets:** Profile pages < 2s mobile, NFC redirect < 200ms, 99.9% uptime', 'note', 'admin', false, '{infrastructure,architecture}'),

  ('Success Metrics (V1)', E'- First 50 paid users within 90 days of launch\n- Profile page load time under 2 seconds\n- User setup completion rate above 70%\n- Less than 5% ring return/exchange rate\n- Net Promoter Score above 50 from early users', 'strategy', 'advisory', false, '{metrics,goals}');
