-- Command Center seed data
-- Run after migration 043

-- Features
INSERT INTO cc_features (name, description, category, status, release_phase, priority) VALUES
  ('User Registration & Auth', 'Email/password signup, verification, session management', 'auth', 'shipped', 'v1', 1),
  ('Profile Pages', 'Public business page with name, bio, photo, links, templates', 'platform', 'shipped', 'v1', 2),
  ('Protected Pages (Impression/Portfolio)', 'PIN-gated pages with hidden and visible modes', 'platform', 'shipped', 'v1', 3),
  ('Template System', '10 templates with accent color and font customization', 'templates', 'shipped', 'v1', 4),
  ('Content Blocks (Pods)', 'Text, text+image, stats, CTA, link preview, project pods', 'content_blocks', 'shipped', 'v1', 5),
  ('Listing Pods', 'Smart real estate listing cards with URL parsing and status lifecycle', 'content_blocks', 'in_progress', 'v1', 6),
  ('Dashboard', 'User admin panel with preview, status controls, navigation', 'ux', 'shipped', 'v1', 7),
  ('Analytics', 'Page views, link clicks, view history', 'analytics', 'shipped', 'v1', 8),
  ('Stripe Payments', 'Subscriptions, checkout, customer portal', 'payments', 'shipped', 'v1', 9),
  ('NFC Redirect System', 'Ring redirect URLs with slug rotation', 'platform', 'shipped', 'v1', 10),
  ('ImageCropper & Visuals', 'Drag-to-reposition photo, cover, background with zoom', 'ux', 'shipped', 'v1', 11),
  ('Event Pods', 'Date/time, venue, countdown, auto-expire for events', 'content_blocks', 'planned', 'v1.5', 12),
  ('Testimonial Pods', 'Quote cards with attribution and optional photo', 'content_blocks', 'planned', 'v1.5', 13),
  ('AI-Assisted Onboarding', 'LLM-powered profile generation from prompts or LinkedIn', 'platform', 'planned', 'v1.5', 14),
  ('Contact Rolodex / CRM', 'Saved connections, notes, mutual sync', 'platform', 'planned', 'v2', 15),
  ('Mobile App', 'iOS and Android native app', 'platform', 'exploring', 'v2', 16),
  ('Custom Domains', 'User-owned domain pointing to Sygnet profile', 'platform', 'exploring', 'v2', 17),
  ('Dashboard Banners', 'In-app announcements and notifications to users', 'marketing', 'planned', 'v1.5', 18),
  ('Email Communications', 'Transactional and marketing email with templates', 'marketing', 'planned', 'v1.5', 19),
  ('Gallery Backgrounds', 'Curated image gallery for cover and background photos', 'templates', 'planned', 'v1.5', 20);

-- Roadmap
INSERT INTO cc_roadmap (title, description, phase, category, priority) VALUES
  ('Listing pod badge fix', 'Fix status badge overlapping title when no image', 'done', 'content_blocks', 1),
  ('ImageCropper component', 'Drag-to-reposition for profile, cover, background photos', 'done', 'ux', 2),
  ('Unified Visuals section', 'Consolidate all photo controls into one editor section', 'done', 'ux', 3),
  ('Command Center', 'Internal operating hub for strategy, roadmap, docs', 'now', 'platform', 4),
  ('Event pods', 'Date/time, venue, location, countdown, auto-expire', 'next', 'content_blocks', 5),
  ('Testimonial pods', 'Quote, attribution, photo for social proof', 'next', 'content_blocks', 6),
  ('Video embed pods', 'YouTube, Vimeo, TikTok inline embed', 'next', 'content_blocks', 7),
  ('Dashboard banners system', 'Admin-posted announcements visible in user dashboards', 'next', 'marketing', 8),
  ('Free tier branding banner', 'Powered by Imprynt watermark on free profiles', 'later', 'platform', 9),
  ('Recovery email system', 'Password reset and account recovery emails', 'later', 'auth', 10),
  ('Waitlist modal', 'Pre-launch signup capture on trysygnet.com', 'later', 'marketing', 11),
  ('AI onboarding', 'LLM-powered profile builder', 'later', 'platform', 12),
  ('Contact Rolodex', 'Saved connections with notes and sync', 'icebox', 'platform', 13);

-- Changelog
INSERT INTO cc_changelog (title, body, version, entry_date, tags) VALUES
  ('Listing Pods', 'Added listing card pod type with smart URL parsing for Zillow, Realtor.com, Redfin, and Trulia. Status lifecycle (Active, Pending, Sold, Rented) with auto-remove scheduling. Photo upload fallback for sites that block OG images.', 'v1.0', '2026-02-23', '{content_blocks,real_estate}'),
  ('Dashboard Redesign', 'Time-aware greeting, consolidated On Air and Status controls, My Links modal with QR code, PIN indicator links, streamlined navigation cards.', 'v1.0', '2026-02-23', '{ux,dashboard}'),
  ('Photo Alignment Rewrite', 'Three-button Left/Center/Right alignment with CSS specificity fix for all templates. Removed broken slider.', 'v1.0', '2026-02-22', '{ux,photos}'),
  ('Protected Pages Redesign', 'Four-button control grid, consolidated info boxes, impression icon in PIN cards, navigation breadcrumbs.', 'v1.0', '2026-02-22', '{ux,protected_pages}'),
  ('Custom Themes', 'User color overrides for any template. Independent cover photo and background photo systems.', 'v1.0', '2026-02-22', '{templates,customization}'),
  ('10 Templates', 'Shipped Clean, Warm, Classic, Soft, Midnight, Editorial, Noir, Signal, Studio, and Dusk templates.', 'v1.0', '2026-02-20', '{templates}'),
  ('Demo Profiles', '10 curated demo accounts across target segments with protected pages and content blocks.', 'v1.0', '2026-02-20', '{marketing,demos}');

-- Docs
INSERT INTO cc_docs (title, body, doc_type, visibility, is_pinned, tags) VALUES
  ('V1 MVP Specification', 'The full product spec is maintained in the project repository as sygnet-mvp-spec.md. This document covers: product summary, target audience, value propositions, feature specifications, pricing tiers, technical architecture, sourcing/fulfillment, and success metrics.', 'design_spec', 'advisory', true, '{product,spec,v1}'),
  ('Target Segments', E'**Networkers:** Product managers, realtors, lawyers, founders, sales professionals, conference attendees.\n\n**Creatives:** Photographers, DJs, content creators, designers, musicians.\n\n**Service Providers:** Handymen, auto detailers, personal trainers, yoga instructors, coaches.\n\nGen Z is a key secondary audience, drawn to the easter egg feature for separating professional and personal identities.', 'strategy', 'advisory', true, '{marketing,segments}'),
  ('Pricing Model', E'**Free Tier:** 1 profile page, 2 templates, Imprynt branding, no protected pages.\n\n**Premium Monthly:** $5.99/mo, all features.\n\n**Premium Annual:** $49.99/yr (~$4.17/mo).\n\n**Bundles:**\n- Sygnet Starter: Ring + 1yr Premium = $59.99\n- Armilla Starter: Band + 1yr Premium = $49.99\n- Combo: Ring + Band + 1yr Premium = $79.99', 'strategy', 'advisory', false, '{pricing,business_model}'),
  ('Hardware Notes', E'**Sygnet Ring:** Ceramic NFC, NTAG216. Sizes 7-11. Bulk from Alibaba (Hecere, Jianhe).\n\n**Armilla Band:** Adjustable silicone, NTAG216. Bulk from RFIDSilicone/CXJ.\n\n**Tactus Tip:** R&D phase. Silicone dip-coat over micro NFC inlay. EcoFlex 00-30. Prototype BOM ~$60-80.', 'note', 'admin', false, '{hardware,nfc,manufacturing}');
