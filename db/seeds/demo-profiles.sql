-- Demo Profile Seed
-- 10 personas, one per template, showcasing the full platform
--
-- Password for all demo accounts: demo2026!
-- Protected page PINs (unique per page, numeric): 1001 / 2002 / 3003 / 4004 / 5005
-- Hashes pre-generated: bcrypt 10 rounds
--
-- Idempotent: deletes all is_demo=true users (cascades to profiles, links, pods, etc.)
-- Run via: cat db/seeds/demo-profiles.sql | docker exec -i imprynt-db psql -U imprynt -d imprynt

BEGIN;

-- ─── CLEAN UP ────────────────────────────────────────────────────────────────
DELETE FROM users WHERE is_demo = true;

-- ─── CONSTANTS ───────────────────────────────────────────────────────────────
-- password_hash for 'demo2026!' (bcrypt, cost 10)
-- $2a$10$IGzaK.mxQqPw5/KeW7/JAuCNwmBxrA/6L/8bzTl6qAmItrDxp2hry

-- ─── USERS ───────────────────────────────────────────────────────────────────
INSERT INTO users (id, email, password_hash, first_name, last_name, plan, account_status, setup_completed, email_verified, is_demo) VALUES
  -- 1. clean template — Alex Morgan, Product Manager
  ('a1000000-0000-0000-0000-000000000001',
   'demo.alex@imprynt.io',
   '$2a$10$IGzaK.mxQqPw5/KeW7/JAuCNwmBxrA/6L/8bzTl6qAmItrDxp2hry',
   'Alex', 'Morgan', 'premium_monthly', 'active', true, NOW(), true),

  -- 2. warm template — Sarah Chen, Life Coach
  ('a1000000-0000-0000-0000-000000000002',
   'demo.sarah@imprynt.io',
   '$2a$10$IGzaK.mxQqPw5/KeW7/JAuCNwmBxrA/6L/8bzTl6qAmItrDxp2hry',
   'Sarah', 'Chen', 'premium_monthly', 'active', true, NOW(), true),

  -- 3. classic template — Robert Evans, Attorney
  ('a1000000-0000-0000-0000-000000000003',
   'demo.robert@imprynt.io',
   '$2a$10$IGzaK.mxQqPw5/KeW7/JAuCNwmBxrA/6L/8bzTl6qAmItrDxp2hry',
   'Robert', 'Evans', 'premium_monthly', 'active', true, NOW(), true),

  -- 4. soft template — Emma Patel, Photographer
  ('a1000000-0000-0000-0000-000000000004',
   'demo.emma@imprynt.io',
   '$2a$10$IGzaK.mxQqPw5/KeW7/JAuCNwmBxrA/6L/8bzTl6qAmItrDxp2hry',
   'Emma', 'Patel', 'premium_monthly', 'active', true, NOW(), true),

  -- 5. midnight template — Marcus Knight, DJ & Music Producer
  ('a1000000-0000-0000-0000-000000000005',
   'demo.marcus@imprynt.io',
   '$2a$10$IGzaK.mxQqPw5/KeW7/JAuCNwmBxrA/6L/8bzTl6qAmItrDxp2hry',
   'Marcus', 'Knight', 'premium_monthly', 'active', true, NOW(), true),

  -- 6. editorial template — Isabelle Durant, Journalist
  ('a1000000-0000-0000-0000-000000000006',
   'demo.isabelle@imprynt.io',
   '$2a$10$IGzaK.mxQqPw5/KeW7/JAuCNwmBxrA/6L/8bzTl6qAmItrDxp2hry',
   'Isabelle', 'Durant', 'premium_monthly', 'active', true, NOW(), true),

  -- 7. noir template — Jake Torres, Private Investigator
  ('a1000000-0000-0000-0000-000000000007',
   'demo.jake@imprynt.io',
   '$2a$10$IGzaK.mxQqPw5/KeW7/JAuCNwmBxrA/6L/8bzTl6qAmItrDxp2hry',
   'Jake', 'Torres', 'premium_monthly', 'active', true, NOW(), true),

  -- 8. signal template — Nia Williams, Cybersecurity Engineer
  ('a1000000-0000-0000-0000-000000000008',
   'demo.nia@imprynt.io',
   '$2a$10$IGzaK.mxQqPw5/KeW7/JAuCNwmBxrA/6L/8bzTl6qAmItrDxp2hry',
   'Nia', 'Williams', 'premium_monthly', 'active', true, NOW(), true),

  -- 9. studio template — Felix Yamamoto, Architect
  ('a1000000-0000-0000-0000-000000000009',
   'demo.felix@imprynt.io',
   '$2a$10$IGzaK.mxQqPw5/KeW7/JAuCNwmBxrA/6L/8bzTl6qAmItrDxp2hry',
   'Felix', 'Yamamoto', 'premium_monthly', 'active', true, NOW(), true),

  -- 10. dusk template — Luna Rivera, Yoga & Wellness Coach
  ('a1000000-0000-0000-0000-000000000010',
   'demo.luna@imprynt.io',
   '$2a$10$IGzaK.mxQqPw5/KeW7/JAuCNwmBxrA/6L/8bzTl6qAmItrDxp2hry',
   'Luna', 'Rivera', 'premium_monthly', 'active', true, NOW(), true);

-- ─── PROFILES ────────────────────────────────────────────────────────────────
INSERT INTO profiles (id, user_id, slug, redirect_id, title, company, tagline, bio, template, accent_color, is_published, photo_size, photo_shape, photo_animation) VALUES

  -- 1. clean — Alex Morgan
  ('b2000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'demo-alex', 'rdemo-alex',
   'Senior Product Manager', 'Meridian Tech',
   'Building products people love',
   'PM at Meridian Tech with 10+ years shipping B2B SaaS. Previously at Dropbox and HubSpot. I love talking roadmap strategy, user research, and the messy middle of product decisions.',
   'clean', '#4f46e5', true, 'medium', 'circle', 'none'),

  -- 2. warm — Sarah Chen
  ('b2000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000002',
   'demo-sarah', 'rdemo-sarah',
   'Certified Life Coach', 'Inner Growth LLC',
   'Helping you live with intention',
   'I work with high-achievers navigating transitions — career pivots, burnout recovery, and what comes next. 200+ clients across 4 continents. Certified through ICF. Former tech lead turned coach.',
   'warm', '#d97706', true, 'medium', 'circle', 'none'),

  -- 3. classic — Robert Evans
  ('b2000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000003',
   'demo-robert', 'rdemo-robert',
   'Managing Partner', 'Evans & Partners LLP',
   'Trusted corporate and real estate counsel',
   'Managing Partner at Evans & Partners. Corporate law, M&A, and complex real estate transactions. Former federal prosecutor (SDNY). Admitted NY, NJ, and DC bars. 25 years in practice.',
   'classic', '#1e40af', true, 'medium', 'circle', 'none'),

  -- 4. soft — Emma Patel
  ('b2000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000004',
   'demo-emma', 'rdemo-emma',
   'Portrait & Brand Photographer', NULL,
   'Light, story, connection',
   'Brooklyn-based photographer specializing in portrait and brand work. I shoot the moments between poses — real emotion, real light. Available for editorial, personal branding, and events.',
   'soft', '#db2777', true, 'medium', 'circle', 'none'),

  -- 5. midnight — Marcus Knight
  ('b2000000-0000-0000-0000-000000000005',
   'a1000000-0000-0000-0000-000000000005',
   'demo-marcus', 'rdemo-marcus',
   'DJ & Music Producer', 'Night Records',
   'Making rooms move since 2015',
   'Residencies in NYC and Berlin. Deep house, techno, Afrobeats. Available for clubs, events, and private bookings. Studio work and original productions released on Night Records.',
   'midnight', '#7c3aed', true, 'medium', 'circle', 'none'),

  -- 6. editorial — Isabelle Durant
  ('b2000000-0000-0000-0000-000000000006',
   'a1000000-0000-0000-0000-000000000006',
   'demo-isabelle', 'rdemo-isab',
   'Senior Correspondent', 'The Tribune',
   'Reporting what matters',
   'Covering politics, climate policy, and social justice for The Tribune. Bylines in The Atlantic, NYT, and Foreign Affairs. Based in Washington, D.C. Fluent in English and French.',
   'editorial', '#b45309', true, 'medium', 'circle', 'none'),

  -- 7. noir — Jake Torres
  ('b2000000-0000-0000-0000-000000000007',
   'a1000000-0000-0000-0000-000000000007',
   'demo-jake', 'rdemo-jake',
   'Licensed Private Investigator', 'Torres Consulting',
   'Find what others miss',
   '15 years law enforcement, 8 years private practice. Specializing in forensic interviews, asset investigation, and corporate due diligence. Licensed in NY, NJ, CT. Discretion guaranteed.',
   'noir', '#374151', true, 'medium', 'circle', 'none'),

  -- 8. signal — Nia Williams
  ('b2000000-0000-0000-0000-000000000008',
   'a1000000-0000-0000-0000-000000000008',
   'demo-nia', 'rdemo-nia',
   'Senior Cybersecurity Engineer', 'CipherCore',
   'Securing systems, not just screens',
   'Red team ops, threat modeling, zero-trust architecture. OSCP, CISSP certified. Previously: CISA audit team, DARPA contractor. I speak at DEF CON. Open to advisory roles.',
   'signal', '#059669', true, 'medium', 'circle', 'none'),

  -- 9. studio — Felix Yamamoto
  ('b2000000-0000-0000-0000-000000000009',
   'a1000000-0000-0000-0000-000000000009',
   'demo-felix', 'rdemo-felix',
   'Principal Architect', 'Studio FY',
   'Space that shapes experience',
   'Award-winning residential and hospitality architecture across Japan and the Pacific Northwest. Founder of Studio FY. AIA Fellow. Passionate about biophilic design and adaptive reuse.',
   'studio', '#dc2626', true, 'medium', 'circle', 'none'),

  -- 10. dusk — Luna Rivera
  ('b2000000-0000-0000-0000-000000000010',
   'a1000000-0000-0000-0000-000000000010',
   'demo-luna', 'rdemo-luna',
   'Yoga & Wellness Coach', 'Bloom Wellness',
   'Breathe. Move. Return to yourself.',
   '500-hour certified yoga instructor. Rooftop vinyasa, sound healing, and one-on-one coaching in LA and online. Founder of Bloom Wellness. Retreats in Tulum and Bali annually.',
   'dusk', '#7e22ce', true, 'medium', 'circle', 'none');

-- ─── LINKS ───────────────────────────────────────────────────────────────────
INSERT INTO links (user_id, profile_id, link_type, label, url, display_order, show_business) VALUES

  -- Alex Morgan (clean)
  ('a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'linkedin', 'LinkedIn', 'https://linkedin.com/in/demo-alex-morgan', 0, true),
  ('a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'email', 'Email', 'alex.morgan@meridiantech.io', 1, true),
  ('a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'website', 'Portfolio', 'https://alexmorgan.io', 2, true),
  ('a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'booking', 'Book a call', 'https://cal.com/demo-alex', 3, true),

  -- Sarah Chen (warm)
  ('a1000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'website', 'innergrowth.co', 'https://innergrowth.co', 0, true),
  ('a1000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'email', 'Email', 'sarah@innergrowth.co', 1, true),
  ('a1000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'booking', 'Book a session', 'https://cal.com/demo-sarah', 2, true),
  ('a1000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'instagram', 'Instagram', 'https://instagram.com/sarahchen.coach', 3, true),

  -- Robert Evans (classic)
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000003',
   'website', 'evanspartners.com', 'https://evanspartners.com', 0, true),
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000003',
   'email', 'Email', 'r.evans@evanspartners.com', 1, true),
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000003',
   'phone', 'Office', '+1 (212) 555-0143', 2, true),
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000003',
   'linkedin', 'LinkedIn', 'https://linkedin.com/in/demo-robert-evans', 3, true),

  -- Emma Patel (soft)
  ('a1000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000004',
   'website', 'emmapatel.photo', 'https://emmapatel.photo', 0, true),
  ('a1000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000004',
   'email', 'Email', 'hello@emmapatel.photo', 1, true),
  ('a1000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000004',
   'instagram', 'Instagram', 'https://instagram.com/emmapatelphotos', 2, true),
  ('a1000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000004',
   'booking', 'Book a shoot', 'https://cal.com/demo-emma', 3, true),

  -- Marcus Knight (midnight)
  ('a1000000-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000005',
   'website', 'marcusknight.dj', 'https://marcusknight.dj', 0, true),
  ('a1000000-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000005',
   'instagram', 'Instagram', 'https://instagram.com/marcusknightdj', 1, true),
  ('a1000000-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000005',
   'email', 'Bookings', 'bookings@marcusknight.dj', 2, true),
  ('a1000000-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000005',
   'spotify', 'Spotify', 'https://open.spotify.com/artist/demo-marcus', 3, true),

  -- Isabelle Durant (editorial)
  ('a1000000-0000-0000-0000-000000000006', 'b2000000-0000-0000-0000-000000000006',
   'website', 'isabelledurant.com', 'https://isabelledurant.com', 0, true),
  ('a1000000-0000-0000-0000-000000000006', 'b2000000-0000-0000-0000-000000000006',
   'twitter', 'X / Twitter', 'https://twitter.com/idurant', 1, true),
  ('a1000000-0000-0000-0000-000000000006', 'b2000000-0000-0000-0000-000000000006',
   'email', 'Press inquiries', 'press@isabelledurant.com', 2, true),
  ('a1000000-0000-0000-0000-000000000006', 'b2000000-0000-0000-0000-000000000006',
   'linkedin', 'LinkedIn', 'https://linkedin.com/in/demo-isabelle-durant', 3, true),

  -- Jake Torres (noir)
  ('a1000000-0000-0000-0000-000000000007', 'b2000000-0000-0000-0000-000000000007',
   'website', 'torresconsulting.com', 'https://torresconsulting.com', 0, true),
  ('a1000000-0000-0000-0000-000000000007', 'b2000000-0000-0000-0000-000000000007',
   'phone', 'Direct line', '+1 (347) 555-0187', 1, true),
  ('a1000000-0000-0000-0000-000000000007', 'b2000000-0000-0000-0000-000000000007',
   'email', 'Secure email', 'jtorres@torresconsulting.com', 2, true),

  -- Nia Williams (signal)
  ('a1000000-0000-0000-0000-000000000008', 'b2000000-0000-0000-0000-000000000008',
   'github', 'GitHub', 'https://github.com/demo-nia-williams', 0, true),
  ('a1000000-0000-0000-0000-000000000008', 'b2000000-0000-0000-0000-000000000008',
   'linkedin', 'LinkedIn', 'https://linkedin.com/in/demo-nia-williams', 1, true),
  ('a1000000-0000-0000-0000-000000000008', 'b2000000-0000-0000-0000-000000000008',
   'website', 'Blog', 'https://niawilliams.dev', 2, true),
  ('a1000000-0000-0000-0000-000000000008', 'b2000000-0000-0000-0000-000000000008',
   'email', 'Work', 'nia@ciphercore.io', 3, true),

  -- Felix Yamamoto (studio)
  ('a1000000-0000-0000-0000-000000000009', 'b2000000-0000-0000-0000-000000000009',
   'website', 'studiofy.com', 'https://studiofy.com', 0, true),
  ('a1000000-0000-0000-0000-000000000009', 'b2000000-0000-0000-0000-000000000009',
   'email', 'Studio', 'felix@studiofy.com', 1, true),
  ('a1000000-0000-0000-0000-000000000009', 'b2000000-0000-0000-0000-000000000009',
   'instagram', 'Instagram', 'https://instagram.com/studiofy', 2, true),
  ('a1000000-0000-0000-0000-000000000009', 'b2000000-0000-0000-0000-000000000009',
   'linkedin', 'LinkedIn', 'https://linkedin.com/in/demo-felix-yamamoto', 3, true),

  -- Luna Rivera (dusk)
  ('a1000000-0000-0000-0000-000000000010', 'b2000000-0000-0000-0000-000000000010',
   'website', 'bloomwellness.co', 'https://bloomwellness.co', 0, true),
  ('a1000000-0000-0000-0000-000000000010', 'b2000000-0000-0000-0000-000000000010',
   'instagram', 'Instagram', 'https://instagram.com/luna.bloom', 1, true),
  ('a1000000-0000-0000-0000-000000000010', 'b2000000-0000-0000-0000-000000000010',
   'booking', 'Book a class', 'https://cal.com/demo-luna', 2, true),
  ('a1000000-0000-0000-0000-000000000010', 'b2000000-0000-0000-0000-000000000010',
   'email', 'Email', 'luna@bloomwellness.co', 3, true);

-- ─── CONTACT FIELDS ──────────────────────────────────────────────────────────
INSERT INTO contact_fields (user_id, field_type, field_value, show_business, show_personal, display_order) VALUES
  -- Alex Morgan
  ('a1000000-0000-0000-0000-000000000001', 'phone_cell',   '+1 (646) 555-0191', true, true, 0),
  ('a1000000-0000-0000-0000-000000000001', 'email_work',   'alex.morgan@meridiantech.io', true, false, 1),
  -- Robert Evans
  ('a1000000-0000-0000-0000-000000000003', 'phone_work',   '+1 (212) 555-0143', true, false, 0),
  ('a1000000-0000-0000-0000-000000000003', 'email_work',   'r.evans@evanspartners.com', true, false, 1),
  -- Emma Patel
  ('a1000000-0000-0000-0000-000000000004', 'phone_cell',   '+1 (718) 555-0204', true, true, 0),
  ('a1000000-0000-0000-0000-000000000004', 'email_personal', 'hello@emmapatel.photo', true, true, 1),
  -- Nia Williams
  ('a1000000-0000-0000-0000-000000000008', 'email_work',   'nia@ciphercore.io', true, false, 0),
  ('a1000000-0000-0000-0000-000000000008', 'phone_cell',   '+1 (202) 555-0173', false, true, 1),
  -- Luna Rivera
  ('a1000000-0000-0000-0000-000000000010', 'phone_cell',   '+1 (310) 555-0229', true, true, 0),
  ('a1000000-0000-0000-0000-000000000010', 'email_work',   'luna@bloomwellness.co', true, false, 1);

-- ─── PODS (public profile content blocks) ────────────────────────────────────
INSERT INTO pods (profile_id, pod_type, display_order, title, body, show_on_profile, is_active) VALUES

  -- Alex Morgan: About + Stats pod
  ('b2000000-0000-0000-0000-000000000001', 'text', 0,
   'What I''m working on',
   'Currently leading the AI-assisted search revamp at Meridian Tech. Previously shipped the bulk workflow engine that handles 2M+ tasks/day. Always happy to grab a coffee and talk product.',
   true, true),

  -- Sarah Chen: Services pod
  ('b2000000-0000-0000-0000-000000000002', 'text', 0,
   'How I can help',
   'One-on-one coaching (6 and 12 week programs), team workshops on sustainable performance, and intensive weekend retreats. First session is always a free 30-minute clarity call.',
   true, true),

  -- Robert Evans: Practice areas pod
  ('b2000000-0000-0000-0000-000000000003', 'text', 0,
   'Practice Areas',
   'Corporate formation and governance, M&A transactions (buy-side and sell-side), commercial real estate, venture financing, and regulatory compliance for financial services firms.',
   true, true),

  -- Emma Patel: Work pod
  ('b2000000-0000-0000-0000-000000000004', 'text', 0,
   'Recent work',
   'Brand shoots for Oat Studio, Heirloom Coffee, and seven independent restaurants in Brooklyn. Editorial work in New York Magazine and Bon Appétit. Portrait sessions open quarterly.',
   true, true),

  -- Marcus Knight: Upcoming shows pod
  ('b2000000-0000-0000-0000-000000000005', 'text', 0,
   'Upcoming',
   'Fabric London — March 8th · OUTPUT Brooklyn — March 22nd · Tresor Berlin — April 5th. For private events and corporate bookings, use the email below.',
   true, true),

  -- Isabelle Durant: Recent bylines
  ('b2000000-0000-0000-0000-000000000006', 'text', 0,
   'Recent bylines',
   'The Atlantic: "The Carbon Credit Illusion" · NYT Opinion: "When Algorithms Govern" · Foreign Affairs: "Who Owns the Arctic Now?" · The Tribune: ongoing climate policy series.',
   true, true),

  -- Jake Torres: Services
  ('b2000000-0000-0000-0000-000000000007', 'text', 0,
   'Services',
   'Background investigations, asset searches, forensic interviews, corporate due diligence, surveillance operations, and expert witness services. All engagements are fully confidential.',
   true, true),

  -- Nia Williams: Talks and publications
  ('b2000000-0000-0000-0000-000000000008', 'text', 0,
   'Talks & Publications',
   'DEF CON 31: "Zero Trust Isn''t Zero Effort" · BSides NYC · Published in IEEE Security & Privacy. Open to advisory engagements and red team consulting outside CipherCore.',
   true, true),

  -- Felix Yamamoto: Selected work
  ('b2000000-0000-0000-0000-000000000009', 'text', 0,
   'Selected projects',
   'Kiso Valley Residence (AIA Award 2023) · The Arroyo Hotel, Bend OR · Portland Adaptive Lofts · Hakone Cultural Center expansion. Currently accepting residential commissions.',
   true, true),

  -- Luna Rivera: Programs
  ('b2000000-0000-0000-0000-000000000010', 'text', 0,
   'Programs & Classes',
   'Rooftop Vinyasa (Saturdays, Silver Lake) · Sound healing circles (first Sunday of month) · Tulum retreat (May) · Bali immersion (October). Online 1:1 coaching year-round.',
   true, true);

-- ─── PROTECTED PAGES (5 of 10 profiles) ─────────────────────────────────────
-- Unique numeric PINs per page (bcrypt, cost 10):
--   Alex Morgan personal:    1001
--   Emma Patel personal:     2002
--   Marcus Knight personal:  3003
--   Nia Williams portfolio:  4004
--   Luna Rivera personal:    5005

INSERT INTO protected_pages (id, user_id, profile_id, page_title, visibility_mode, pin_hash, bio_text, button_label, is_active) VALUES

  -- Alex Morgan: hidden personal page — PIN: 1001
  ('c3000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'b2000000-0000-0000-0000-000000000001',
   'Personal', 'hidden',
   '$2a$10$xOCxgQ8BjqqmqwSPh0cwBez1tP4Pj7c3In7aZaCZ48E4JBikHmDOm',
   'Hey — glad you found this. This is the real me. My cell is below. Text anytime.',
   NULL, true),

  -- Emma Patel: hidden personal page — PIN: 2002
  ('c3000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000004',
   'b2000000-0000-0000-0000-000000000004',
   'Personal', 'hidden',
   '$2a$10$Xxr5tovPMzSSFQAFbAXfx.krefr5MUX0TRsUkH2LoR1rvsQOMNSCG',
   'You found the hidden layer. This is where I share personal work and my direct number for people I trust.',
   NULL, true),

  -- Marcus Knight: hidden personal page — PIN: 3003
  ('c3000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000005',
   'b2000000-0000-0000-0000-000000000005',
   'Personal', 'hidden',
   '$2a$10$z41KCRPFXBvzDMM3xfqW5uzArhgE7tpS5WxKdGKHrwDN0YxO/9ATG',
   'Inner circle only. My personal number and some unreleased tracks. Keep it between us.',
   NULL, true),

  -- Nia Williams: visible portfolio page — PIN: 4004
  ('c3000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000008',
   'b2000000-0000-0000-0000-000000000008',
   'Research Portfolio', 'visible',
   '$2a$10$J.70NIS9.3IswYOVgDaWtOGI8dAdPvJCkUeUxery4sw2n6zhKv2ga',
   'Detailed case studies, published CVEs, and red team reports. PIN required — contact me for access.',
   'Research Portfolio', true),

  -- Luna Rivera: hidden personal page — PIN: 5005
  ('c3000000-0000-0000-0000-000000000005',
   'a1000000-0000-0000-0000-000000000010',
   'b2000000-0000-0000-0000-000000000010',
   'Personal', 'hidden',
   '$2a$10$GA3riDx8RzhJ.symRk75YeeP8yroDyIG2T6T33wfinrL65/e3HpdO',
   'This is my personal space. If you''re here, you''ve already earned it. My number and retreat invites below.',
   NULL, true);

COMMIT;
