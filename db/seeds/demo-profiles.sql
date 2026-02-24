-- Demo Profile Seed — 12 Personas
-- Full content spec: networking professionals, creatives, service providers
--
-- Password for all demo accounts: Demo2026!!
-- All links route to Imprynt properties (no dead ends)
--
-- Idempotent: deletes all is_demo=true users (cascades to profiles, links, pods, etc.)
-- Run via: cat db/seeds/demo-profiles.sql | docker exec -i imprynt-db psql -U imprynt -d imprynt

BEGIN;

-- ─── CLEAN UP ────────────────────────────────────────────────────────────────
DELETE FROM users WHERE is_demo = true;

-- ─── CONSTANTS ───────────────────────────────────────────────────────────────
-- password_hash for 'Demo2026!!' (bcrypt, cost 10)
-- $2a$10$E5o91BF1p.qqtcAS8aSqTekB6gtDwm7VhnnFTrE/TLJ2CavBCd0Rm

-- ─── USERS ───────────────────────────────────────────────────────────────────
INSERT INTO users (id, email, password_hash, first_name, last_name, plan, account_status, setup_completed, email_verified, is_demo) VALUES

  -- 1. Alex Morgan — Product Manager (clean)
  ('a1000000-0000-0000-0000-000000000001',
   'demo.alex@imprynt.io',
   '$2a$10$E5o91BF1p.qqtcAS8aSqTekB6gtDwm7VhnnFTrE/TLJ2CavBCd0Rm',
   'Alex', 'Morgan', 'premium_monthly', 'active', true, NOW(), true),

  -- 2. Sarah Chen — Life Coach (warm)
  ('a1000000-0000-0000-0000-000000000002',
   'demo.sarah@imprynt.io',
   '$2a$10$E5o91BF1p.qqtcAS8aSqTekB6gtDwm7VhnnFTrE/TLJ2CavBCd0Rm',
   'Sarah', 'Chen', 'premium_monthly', 'active', true, NOW(), true),

  -- 3. Robert Evans — Attorney (classic)
  ('a1000000-0000-0000-0000-000000000003',
   'demo.robert@imprynt.io',
   '$2a$10$E5o91BF1p.qqtcAS8aSqTekB6gtDwm7VhnnFTrE/TLJ2CavBCd0Rm',
   'Robert', 'Evans', 'premium_monthly', 'active', true, NOW(), true),

  -- 4. Daniela Rojas — Realtor (classic)
  ('a1000000-0000-0000-0000-000000000004',
   'demo.daniela@imprynt.io',
   '$2a$10$E5o91BF1p.qqtcAS8aSqTekB6gtDwm7VhnnFTrE/TLJ2CavBCd0Rm',
   'Daniela', 'Rojas', 'premium_monthly', 'active', true, NOW(), true),

  -- 5. Jordan Okafor — Startup Founder (clean)
  ('a1000000-0000-0000-0000-000000000005',
   'demo.jordan@imprynt.io',
   '$2a$10$E5o91BF1p.qqtcAS8aSqTekB6gtDwm7VhnnFTrE/TLJ2CavBCd0Rm',
   'Jordan', 'Okafor', 'premium_monthly', 'active', true, NOW(), true),

  -- 6. Emma Patel — Photographer (soft)
  ('a1000000-0000-0000-0000-000000000006',
   'demo.emma@imprynt.io',
   '$2a$10$E5o91BF1p.qqtcAS8aSqTekB6gtDwm7VhnnFTrE/TLJ2CavBCd0Rm',
   'Emma', 'Patel', 'premium_monthly', 'active', true, NOW(), true),

  -- 7. Marcus Knight — DJ & Producer (midnight)
  ('a1000000-0000-0000-0000-000000000007',
   'demo.marcus@imprynt.io',
   '$2a$10$E5o91BF1p.qqtcAS8aSqTekB6gtDwm7VhnnFTrE/TLJ2CavBCd0Rm',
   'Marcus', 'Knight', 'premium_monthly', 'active', true, NOW(), true),

  -- 8. Ava Kimura — Content Creator (dusk)
  ('a1000000-0000-0000-0000-000000000008',
   'demo.ava@imprynt.io',
   '$2a$10$E5o91BF1p.qqtcAS8aSqTekB6gtDwm7VhnnFTrE/TLJ2CavBCd0Rm',
   'Ava', 'Kimura', 'premium_monthly', 'active', true, NOW(), true),

  -- 9. Felix Yamamoto — Architect (studio)
  ('a1000000-0000-0000-0000-000000000009',
   'demo.felix@imprynt.io',
   '$2a$10$E5o91BF1p.qqtcAS8aSqTekB6gtDwm7VhnnFTrE/TLJ2CavBCd0Rm',
   'Felix', 'Yamamoto', 'premium_monthly', 'active', true, NOW(), true),

  -- 10. Chris Delgado — Handyman (signal)
  ('a1000000-0000-0000-0000-000000000010',
   'demo.chris@imprynt.io',
   '$2a$10$E5o91BF1p.qqtcAS8aSqTekB6gtDwm7VhnnFTrE/TLJ2CavBCd0Rm',
   'Chris', 'Delgado', 'premium_monthly', 'active', true, NOW(), true),

  -- 11. Brianna Scott — Mobile Detailer (signal)
  ('a1000000-0000-0000-0000-000000000011',
   'demo.brianna@imprynt.io',
   '$2a$10$E5o91BF1p.qqtcAS8aSqTekB6gtDwm7VhnnFTrE/TLJ2CavBCd0Rm',
   'Brianna', 'Scott', 'premium_monthly', 'active', true, NOW(), true),

  -- 12. Darius Webb — Personal Trainer (midnight)
  ('a1000000-0000-0000-0000-000000000012',
   'demo.darius@imprynt.io',
   '$2a$10$E5o91BF1p.qqtcAS8aSqTekB6gtDwm7VhnnFTrE/TLJ2CavBCd0Rm',
   'Darius', 'Webb', 'premium_monthly', 'active', true, NOW(), true);

-- ─── PROFILES ────────────────────────────────────────────────────────────────
INSERT INTO profiles (id, user_id, slug, redirect_id, title, company, tagline, bio, template, accent_color, is_published, photo_size, photo_shape, photo_animation) VALUES

  -- 1. Alex Morgan (clean)
  ('b2000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'demo-alex', 'rdemo-alex',
   'Senior Product Manager', 'Meridian Tech',
   'Building products people love',
   'Product leader at Meridian Tech. I turn messy problems into elegant solutions and ship things that matter. Always happy to talk product, strategy, or what you''re building next.',
   'clean', '#3B82F6', true, 'medium', 'circle', 'none'),

  -- 2. Sarah Chen (warm)
  ('b2000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000002',
   'demo-sarah', 'rdemo-sarah',
   'Certified Life Coach', 'Inner Growth LLC',
   'Helping you live with intention',
   'I work with professionals navigating transitions, finding clarity, and building lives that actually feel like theirs. ICF-certified. Based in Denver. Let''s talk about what''s next for you.',
   'warm', '#c2703e', true, 'medium', 'circle', 'none'),

  -- 3. Robert Evans (classic)
  ('b2000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000003',
   'demo-robert', 'rdemo-robert',
   'Managing Partner', 'Evans & Partners LLP',
   'Trusted corporate and real estate counsel',
   '18 years in corporate and real estate law. I help businesses close deals cleanly and protect what they''ve built. Managing partner at Evans & Partners. Licensed in New York and Connecticut.',
   'classic', '#1e3a5f', true, 'medium', 'circle', 'none'),

  -- 4. Daniela Rojas (classic)
  ('b2000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000004',
   'demo-daniela', 'rdemo-daniela',
   'Licensed Realtor', 'Compass Real Estate',
   'Your home search starts here',
   'Helping buyers and sellers navigate Austin''s real estate market with honesty and hustle. 6 years at Compass. I know every neighborhood, every school district, and where to get the best breakfast tacos.',
   'classic', '#1e3a5f', true, 'medium', 'circle', 'none'),

  -- 5. Jordan Okafor (clean)
  ('b2000000-0000-0000-0000-000000000005',
   'a1000000-0000-0000-0000-000000000005',
   'demo-jordan', 'rdemo-jordan',
   'Founder & CEO', 'Layup Labs',
   'Shipping fast, learning faster',
   'Building Layup Labs, a dev tools company helping small teams ship better software. Previously engineering at Stripe. YC W24. Based in SF. I like talking to founders, builders, and anyone who''s figured out something I haven''t.',
   'clean', '#3B82F6', true, 'medium', 'circle', 'none'),

  -- 6. Emma Patel (soft)
  ('b2000000-0000-0000-0000-000000000006',
   'a1000000-0000-0000-0000-000000000006',
   'demo-emma', 'rdemo-emma',
   'Portrait & Brand Photographer', NULL,
   'Light, story, connection',
   'I photograph people and the brands they build. Based in LA. Clients include startups, small businesses, and humans who want to look like themselves on camera. Currently booking Q2.',
   'soft', '#5b8a72', true, 'medium', 'circle', 'none'),

  -- 7. Marcus Knight (midnight)
  ('b2000000-0000-0000-0000-000000000007',
   'a1000000-0000-0000-0000-000000000007',
   'demo-marcus', 'rdemo-marcus',
   'DJ & Music Producer', 'Night Records',
   'Making rooms move since 2015',
   'DJ, producer, and founder of Night Records. Resident at The Basement. I play house, disco, and whatever makes the room lose track of time. Booking and press inquiries welcome.',
   'midnight', '#c8ff00', true, 'medium', 'circle', 'none'),

  -- 8. Ava Kimura (dusk)
  ('b2000000-0000-0000-0000-000000000008',
   'a1000000-0000-0000-0000-000000000008',
   'demo-ava', 'rdemo-ava',
   'Content Creator', '@avakimura',
   'Style, travel, and good energy',
   'Creating things that make people stop scrolling. 180K on IG, 300K on TikTok. Partnerships, collabs, and "where''d you get that" are my love languages. LA based, everywhere else frequently.',
   'dusk', '#e8a849', true, 'medium', 'circle', 'none'),

  -- 9. Felix Yamamoto (studio)
  ('b2000000-0000-0000-0000-000000000009',
   'a1000000-0000-0000-0000-000000000009',
   'demo-felix', 'rdemo-felix',
   'Principal Architect', 'Studio FY',
   'Space that shapes experience',
   'I design homes and commercial spaces that feel inevitable. Principal at Studio FY. AIA member. Based in Portland. Interested in sustainability, material honesty, and the argument that brutalism was actually good.',
   'studio', '#8b9cf7', true, 'medium', 'circle', 'none'),

  -- 10. Chris Delgado (signal)
  ('b2000000-0000-0000-0000-000000000010',
   'a1000000-0000-0000-0000-000000000010',
   'demo-chris', 'rdemo-chris',
   'Handyman & Home Repairs', 'Delgado Home Services',
   'Honest work, fair prices',
   'Licensed and insured handyman serving the Denver metro area. Plumbing, electrical, drywall, painting, furniture assembly, and the stuff you keep putting off. Same-week availability. Your neighbors already have my number.',
   'signal', '#e8553d', true, 'medium', 'circle', 'none'),

  -- 11. Brianna Scott (signal)
  ('b2000000-0000-0000-0000-000000000011',
   'a1000000-0000-0000-0000-000000000011',
   'demo-brianna', 'rdemo-brianna',
   'Mobile Auto Detailer', 'Pristine Detail Co.',
   'Your car''s best day, every time',
   'Mobile detailing in Atlanta and surrounding areas. Full interior/exterior details, ceramic coating, paint correction, and the kind of clean your car hasn''t seen since the lot. 5 stars on Google. I come to you.',
   'signal', '#e8553d', true, 'medium', 'circle', 'none'),

  -- 12. Darius Webb (midnight)
  ('b2000000-0000-0000-0000-000000000012',
   'a1000000-0000-0000-0000-000000000012',
   'demo-darius', 'rdemo-darius',
   'Certified Personal Trainer', NULL,
   'Strength is built, not given',
   'NASM-certified trainer specializing in strength and hypertrophy. I train in-person in Chicago and online everywhere else. No fads, no shortcuts, just smart programming and accountability. Free consult for new clients.',
   'midnight', '#c8ff00', true, 'medium', 'circle', 'none');

-- ─── LINKS ───────────────────────────────────────────────────────────────────
-- All links route to Imprynt properties — no dead ends
INSERT INTO links (user_id, profile_id, link_type, label, url, display_order, show_business) VALUES

  -- 1. Alex Morgan (clean)
  ('a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'linkedin', 'LinkedIn', 'https://linkedin.com/company/imprynt', 0, true),
  ('a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'website', 'Portfolio', 'https://imprynt.io', 1, true),
  ('a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'email', 'Email me', 'info@imprynt.io', 2, true),
  ('a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'booking', 'Book a chat', 'https://outlook.office.com/book/IMPRYNTio1@tdkconsultingllc.com/?ismsaljsauthenabled=true', 3, true),
  ('a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'custom', 'Stay in the loop', 'https://imprynt.io/newsletter', 4, true),
  ('a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'vcard', 'Save Contact', '/api/vcard/b2000000-0000-0000-0000-000000000001', 5, true),

  -- 2. Sarah Chen (warm)
  ('a1000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'website', 'My practice', 'https://imprynt.io', 0, true),
  ('a1000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'instagram', 'Instagram', 'https://instagram.com/tryimprynt', 1, true),
  ('a1000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'booking', 'Book a session', 'https://outlook.office.com/book/IMPRYNTio1@tdkconsultingllc.com/?ismsaljsauthenabled=true', 2, true),
  ('a1000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'email', 'Get in touch', 'info@imprynt.io', 3, true),
  ('a1000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'custom', 'Join the journey', 'https://imprynt.io/newsletter', 4, true),
  ('a1000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   'vcard', 'Save Contact', '/api/vcard/b2000000-0000-0000-0000-000000000002', 5, true),

  -- 3. Robert Evans (classic)
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000003',
   'linkedin', 'LinkedIn', 'https://linkedin.com/company/imprynt', 0, true),
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000003',
   'website', 'Firm website', 'https://imprynt.io', 1, true),
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000003',
   'email', 'Email', 'info@imprynt.io', 2, true),
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000003',
   'phone', 'Call the office', '+1 (555) 123-4567', 3, true),
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000003',
   'booking', 'Schedule a consult', 'https://outlook.office.com/book/IMPRYNTio1@tdkconsultingllc.com/?ismsaljsauthenabled=true', 4, true),
  ('a1000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000003',
   'vcard', 'Save Contact', '/api/vcard/b2000000-0000-0000-0000-000000000003', 5, true),

  -- 4. Daniela Rojas (classic)
  ('a1000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000004',
   'website', 'View my listings', 'https://imprynt.io', 0, true),
  ('a1000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000004',
   'instagram', 'Instagram', 'https://instagram.com/tryimprynt', 1, true),
  ('a1000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000004',
   'booking', 'Book a showing', 'https://outlook.office.com/book/IMPRYNTio1@tdkconsultingllc.com/?ismsaljsauthenabled=true', 2, true),
  ('a1000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000004',
   'phone', 'Call or text', '+1 (555) 123-4567', 3, true),
  ('a1000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000004',
   'email', 'Email me', 'info@imprynt.io', 4, true),
  ('a1000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000004',
   'youtube', 'Home tours', 'https://youtube.com/@tryimprynt', 5, true),
  ('a1000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000004',
   'custom', 'Market updates', 'https://imprynt.io/newsletter', 6, true),
  ('a1000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000004',
   'vcard', 'Save Contact', '/api/vcard/b2000000-0000-0000-0000-000000000004', 7, true),

  -- 5. Jordan Okafor (clean)
  ('a1000000-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000005',
   'linkedin', 'LinkedIn', 'https://linkedin.com/company/imprynt', 0, true),
  ('a1000000-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000005',
   'twitter', 'Follow along', 'https://x.com/tryimprynt', 1, true),
  ('a1000000-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000005',
   'website', 'Layup Labs', 'https://imprynt.io', 2, true),
  ('a1000000-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000005',
   'booking', 'Let''s talk', 'https://outlook.office.com/book/IMPRYNTio1@tdkconsultingllc.com/?ismsaljsauthenabled=true', 3, true),
  ('a1000000-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000005',
   'email', 'Email', 'info@imprynt.io', 4, true),
  ('a1000000-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000005',
   'custom', 'Founder updates', 'https://imprynt.io/newsletter', 5, true),
  ('a1000000-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000005',
   'vcard', 'Save Contact', '/api/vcard/b2000000-0000-0000-0000-000000000005', 6, true),

  -- 6. Emma Patel (soft)
  ('a1000000-0000-0000-0000-000000000006', 'b2000000-0000-0000-0000-000000000006',
   'website', 'Portfolio', 'https://imprynt.io', 0, true),
  ('a1000000-0000-0000-0000-000000000006', 'b2000000-0000-0000-0000-000000000006',
   'instagram', 'Instagram', 'https://instagram.com/tryimprynt', 1, true),
  ('a1000000-0000-0000-0000-000000000006', 'b2000000-0000-0000-0000-000000000006',
   'email', 'Inquiries', 'info@imprynt.io', 2, true),
  ('a1000000-0000-0000-0000-000000000006', 'b2000000-0000-0000-0000-000000000006',
   'booking', 'Book a shoot', 'https://outlook.office.com/book/IMPRYNTio1@tdkconsultingllc.com/?ismsaljsauthenabled=true', 3, true),
  ('a1000000-0000-0000-0000-000000000006', 'b2000000-0000-0000-0000-000000000006',
   'tiktok', 'Behind the scenes', 'https://tiktok.com/@tryimprynt', 4, true),
  ('a1000000-0000-0000-0000-000000000006', 'b2000000-0000-0000-0000-000000000006',
   'custom', 'Get inspired', 'https://imprynt.io/newsletter', 5, true),
  ('a1000000-0000-0000-0000-000000000006', 'b2000000-0000-0000-0000-000000000006',
   'vcard', 'Save Contact', '/api/vcard/b2000000-0000-0000-0000-000000000006', 6, true),

  -- 7. Marcus Knight (midnight)
  ('a1000000-0000-0000-0000-000000000007', 'b2000000-0000-0000-0000-000000000007',
   'instagram', 'Instagram', 'https://instagram.com/tryimprynt', 0, true),
  ('a1000000-0000-0000-0000-000000000007', 'b2000000-0000-0000-0000-000000000007',
   'youtube', 'Mixes & sets', 'https://youtube.com/@tryimprynt', 1, true),
  ('a1000000-0000-0000-0000-000000000007', 'b2000000-0000-0000-0000-000000000007',
   'website', 'Night Records', 'https://imprynt.io', 2, true),
  ('a1000000-0000-0000-0000-000000000007', 'b2000000-0000-0000-0000-000000000007',
   'email', 'Booking inquiries', 'info@imprynt.io', 3, true),
  ('a1000000-0000-0000-0000-000000000007', 'b2000000-0000-0000-0000-000000000007',
   'tiktok', 'TikTok', 'https://tiktok.com/@tryimprynt', 4, true),
  ('a1000000-0000-0000-0000-000000000007', 'b2000000-0000-0000-0000-000000000007',
   'custom', 'Show dates & drops', 'https://imprynt.io/newsletter', 5, true),
  ('a1000000-0000-0000-0000-000000000007', 'b2000000-0000-0000-0000-000000000007',
   'vcard', 'Save Contact', '/api/vcard/b2000000-0000-0000-0000-000000000007', 6, true),

  -- 8. Ava Kimura (dusk)
  ('a1000000-0000-0000-0000-000000000008', 'b2000000-0000-0000-0000-000000000008',
   'instagram', 'Instagram', 'https://instagram.com/tryimprynt', 0, true),
  ('a1000000-0000-0000-0000-000000000008', 'b2000000-0000-0000-0000-000000000008',
   'tiktok', 'TikTok', 'https://tiktok.com/@tryimprynt', 1, true),
  ('a1000000-0000-0000-0000-000000000008', 'b2000000-0000-0000-0000-000000000008',
   'youtube', 'YouTube', 'https://youtube.com/@tryimprynt', 2, true),
  ('a1000000-0000-0000-0000-000000000008', 'b2000000-0000-0000-0000-000000000008',
   'website', 'My blog', 'https://imprynt.io', 3, true),
  ('a1000000-0000-0000-0000-000000000008', 'b2000000-0000-0000-0000-000000000008',
   'email', 'Collabs & press', 'info@imprynt.io', 4, true),
  ('a1000000-0000-0000-0000-000000000008', 'b2000000-0000-0000-0000-000000000008',
   'custom', 'Join my world', 'https://imprynt.io/newsletter', 5, true),
  ('a1000000-0000-0000-0000-000000000008', 'b2000000-0000-0000-0000-000000000008',
   'vcard', 'Save Contact', '/api/vcard/b2000000-0000-0000-0000-000000000008', 6, true),

  -- 9. Felix Yamamoto (studio)
  ('a1000000-0000-0000-0000-000000000009', 'b2000000-0000-0000-0000-000000000009',
   'website', 'Studio FY', 'https://imprynt.io', 0, true),
  ('a1000000-0000-0000-0000-000000000009', 'b2000000-0000-0000-0000-000000000009',
   'linkedin', 'LinkedIn', 'https://linkedin.com/company/imprynt', 1, true),
  ('a1000000-0000-0000-0000-000000000009', 'b2000000-0000-0000-0000-000000000009',
   'instagram', 'Project gallery', 'https://instagram.com/tryimprynt', 2, true),
  ('a1000000-0000-0000-0000-000000000009', 'b2000000-0000-0000-0000-000000000009',
   'email', 'Contact', 'info@imprynt.io', 3, true),
  ('a1000000-0000-0000-0000-000000000009', 'b2000000-0000-0000-0000-000000000009',
   'booking', 'Consultation', 'https://outlook.office.com/book/IMPRYNTio1@tdkconsultingllc.com/?ismsaljsauthenabled=true', 4, true),
  ('a1000000-0000-0000-0000-000000000009', 'b2000000-0000-0000-0000-000000000009',
   'vcard', 'Save Contact', '/api/vcard/b2000000-0000-0000-0000-000000000009', 5, true),

  -- 10. Chris Delgado (signal)
  ('a1000000-0000-0000-0000-000000000010', 'b2000000-0000-0000-0000-000000000010',
   'phone', 'Call for estimate', '+1 (555) 123-4567', 0, true),
  ('a1000000-0000-0000-0000-000000000010', 'b2000000-0000-0000-0000-000000000010',
   'custom', 'Service menu & pricing', 'https://imprynt.io/demo', 1, true),
  ('a1000000-0000-0000-0000-000000000010', 'b2000000-0000-0000-0000-000000000010',
   'email', 'Email', 'info@imprynt.io', 2, true),
  ('a1000000-0000-0000-0000-000000000010', 'b2000000-0000-0000-0000-000000000010',
   'custom', 'Pay with Venmo', 'https://imprynt.io/demo', 3, true),
  ('a1000000-0000-0000-0000-000000000010', 'b2000000-0000-0000-0000-000000000010',
   'custom', 'Google reviews', 'https://imprynt.io/demo', 4, true),
  ('a1000000-0000-0000-0000-000000000010', 'b2000000-0000-0000-0000-000000000010',
   'booking', 'Schedule a visit', 'https://outlook.office.com/book/IMPRYNTio1@tdkconsultingllc.com/?ismsaljsauthenabled=true', 5, true),
  ('a1000000-0000-0000-0000-000000000010', 'b2000000-0000-0000-0000-000000000010',
   'custom', 'Seasonal home tips', 'https://imprynt.io/newsletter', 6, true),
  ('a1000000-0000-0000-0000-000000000010', 'b2000000-0000-0000-0000-000000000010',
   'vcard', 'Save Contact', '/api/vcard/b2000000-0000-0000-0000-000000000010', 7, true),

  -- 11. Brianna Scott (signal)
  ('a1000000-0000-0000-0000-000000000011', 'b2000000-0000-0000-0000-000000000011',
   'website', 'Packages & pricing', 'https://imprynt.io', 0, true),
  ('a1000000-0000-0000-0000-000000000011', 'b2000000-0000-0000-0000-000000000011',
   'instagram', 'Before & afters', 'https://instagram.com/tryimprynt', 1, true),
  ('a1000000-0000-0000-0000-000000000011', 'b2000000-0000-0000-0000-000000000011',
   'phone', 'Text or call', '+1 (555) 123-4567', 2, true),
  ('a1000000-0000-0000-0000-000000000011', 'b2000000-0000-0000-0000-000000000011',
   'custom', 'Pay with Cash App', 'https://imprynt.io/demo', 3, true),
  ('a1000000-0000-0000-0000-000000000011', 'b2000000-0000-0000-0000-000000000011',
   'booking', 'Book your detail', 'https://outlook.office.com/book/IMPRYNTio1@tdkconsultingllc.com/?ismsaljsauthenabled=true', 4, true),
  ('a1000000-0000-0000-0000-000000000011', 'b2000000-0000-0000-0000-000000000011',
   'custom', 'Google reviews', 'https://imprynt.io/demo', 5, true),
  ('a1000000-0000-0000-0000-000000000011', 'b2000000-0000-0000-0000-000000000011',
   'custom', 'Deals & car tips', 'https://imprynt.io/newsletter', 6, true),
  ('a1000000-0000-0000-0000-000000000011', 'b2000000-0000-0000-0000-000000000011',
   'vcard', 'Save Contact', '/api/vcard/b2000000-0000-0000-0000-000000000011', 7, true),

  -- 12. Darius Webb (midnight)
  ('a1000000-0000-0000-0000-000000000012', 'b2000000-0000-0000-0000-000000000012',
   'instagram', 'Instagram', 'https://instagram.com/tryimprynt', 0, true),
  ('a1000000-0000-0000-0000-000000000012', 'b2000000-0000-0000-0000-000000000012',
   'booking', 'Book a session', 'https://outlook.office.com/book/IMPRYNTio1@tdkconsultingllc.com/?ismsaljsauthenabled=true', 1, true),
  ('a1000000-0000-0000-0000-000000000012', 'b2000000-0000-0000-0000-000000000012',
   'website', 'Training programs', 'https://imprynt.io', 2, true),
  ('a1000000-0000-0000-0000-000000000012', 'b2000000-0000-0000-0000-000000000012',
   'tiktok', 'Workout clips', 'https://tiktok.com/@tryimprynt', 3, true),
  ('a1000000-0000-0000-0000-000000000012', 'b2000000-0000-0000-0000-000000000012',
   'custom', 'Pay via Venmo', 'https://imprynt.io/demo', 4, true),
  ('a1000000-0000-0000-0000-000000000012', 'b2000000-0000-0000-0000-000000000012',
   'email', 'Email', 'info@imprynt.io', 5, true),
  ('a1000000-0000-0000-0000-000000000012', 'b2000000-0000-0000-0000-000000000012',
   'custom', 'Weekly training tips', 'https://imprynt.io/newsletter', 6, true),
  ('a1000000-0000-0000-0000-000000000012', 'b2000000-0000-0000-0000-000000000012',
   'vcard', 'Save Contact', '/api/vcard/b2000000-0000-0000-0000-000000000012', 7, true);

-- ─── CONTACT FIELDS ──────────────────────────────────────────────────────────
INSERT INTO contact_fields (user_id, field_type, field_value, show_business, show_personal, display_order) VALUES
  -- Robert Evans
  ('a1000000-0000-0000-0000-000000000003', 'phone_work',   '+1 (555) 123-4567', true, false, 0),
  ('a1000000-0000-0000-0000-000000000003', 'email_work',   'info@imprynt.io', true, false, 1),
  -- Chris Delgado
  ('a1000000-0000-0000-0000-000000000010', 'phone_cell',   '+1 (555) 123-4567', true, true, 0),
  ('a1000000-0000-0000-0000-000000000010', 'email_work',   'info@imprynt.io', true, false, 1);

-- ─── PODS (public profile content blocks) ────────────────────────────────────
INSERT INTO pods (profile_id, pod_type, display_order, title, body, show_on_profile, is_active) VALUES

  -- Alex Morgan
  ('b2000000-0000-0000-0000-000000000001', 'text', 0,
   'What I''m working on',
   'Currently leading the AI-assisted search revamp at Meridian Tech. Previously shipped the bulk workflow engine that handles 2M+ tasks/day. Always happy to grab a coffee and talk product.',
   true, true),

  -- Sarah Chen
  ('b2000000-0000-0000-0000-000000000002', 'text', 0,
   'How I can help',
   'One-on-one coaching (6 and 12 week programs), team workshops on sustainable performance, and intensive weekend retreats. First session is always a free 30-minute clarity call.',
   true, true),

  -- Robert Evans
  ('b2000000-0000-0000-0000-000000000003', 'text', 0,
   'Practice Areas',
   'Corporate formation and governance, M&A transactions (buy-side and sell-side), commercial real estate, venture financing, and regulatory compliance for financial services firms.',
   true, true),

  -- Daniela Rojas
  ('b2000000-0000-0000-0000-000000000004', 'text', 0,
   'What I do',
   'Full-service real estate: buyer representation, seller listing, market analysis, and negotiation. I specialize in Austin''s central neighborhoods and new-build communities in the hill country.',
   true, true),

  -- Jordan Okafor
  ('b2000000-0000-0000-0000-000000000005', 'text', 0,
   'What we''re building',
   'Layup Labs makes dev tools for small teams. Our first product helps engineering teams ship 40% faster with AI-assisted code review and deployment pipelines. Backed by YC and First Round.',
   true, true),

  -- Emma Patel
  ('b2000000-0000-0000-0000-000000000006', 'text', 0,
   'Recent work',
   'Brand shoots for Oat Studio, Heirloom Coffee, and seven independent restaurants in Brooklyn. Editorial work in New York Magazine and Bon Appétit. Portrait sessions open quarterly.',
   true, true),

  -- Marcus Knight
  ('b2000000-0000-0000-0000-000000000007', 'text', 0,
   'Upcoming',
   'Fabric London — March 8th · OUTPUT Brooklyn — March 22nd · Tresor Berlin — April 5th. For private events and corporate bookings, use the email below.',
   true, true),

  -- Ava Kimura
  ('b2000000-0000-0000-0000-000000000008', 'text', 0,
   'Currently into',
   'Partnering with Glossier, Alo Yoga, and Away for spring campaigns. Filming a travel series on hidden spots in Tokyo. DMs open for collabs — or just to say hi.',
   true, true),

  -- Felix Yamamoto
  ('b2000000-0000-0000-0000-000000000009', 'text', 0,
   'Selected projects',
   'Kiso Valley Residence (AIA Award 2023) · The Arroyo Hotel, Bend OR · Portland Adaptive Lofts · Hakone Cultural Center expansion. Currently accepting residential commissions.',
   true, true),

  -- Chris Delgado
  ('b2000000-0000-0000-0000-000000000010', 'text', 0,
   'Services',
   'Plumbing repairs · Electrical (outlets, fixtures, fans) · Drywall patching · Interior/exterior painting · Furniture assembly · TV mounting · Seasonal maintenance. Licensed and insured.',
   true, true),

  -- Brianna Scott
  ('b2000000-0000-0000-0000-000000000011', 'text', 0,
   'Packages',
   'Express Wash ($45) · Full Interior/Exterior ($120) · Premium Detail with Ceramic Coat ($250) · Paint correction available. All services are mobile — I come to your home or office.',
   true, true),

  -- Darius Webb
  ('b2000000-0000-0000-0000-000000000012', 'text', 0,
   'Programs',
   '1-on-1 training (in-person, Chicago) · Online coaching with custom programming · 8-week strength fundamentals course · 12-week hypertrophy program. Free 30-min consult for new clients.',
   true, true);

-- ─── PROTECTED PAGES ─────────────────────────────────────────────────────────
-- Easter eggs (hidden) + portfolio pages (visible)
-- PINs: 1111 / 2024 / 4040 / 3030 / 8080 / 2222 / 5050 / 9090

INSERT INTO protected_pages (id, user_id, profile_id, page_title, visibility_mode, pin_hash, bio_text, button_label, is_active) VALUES

  -- Sarah Chen: easter egg — PIN: 1111
  ('c3000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000002',
   'b2000000-0000-0000-0000-000000000002',
   'The Real Sarah', 'hidden',
   '$2a$10$diBoqzU/BBOxt55.j96mV.D4VfdyeW0n2ys/4N/dlCgkMAiXpWIsa',
   'Hey! Glad you found the secret page. Here''s where I keep the non-coach stuff.',
   NULL, true),

  -- Daniela Rojas: visible portfolio — PIN: 2024
  ('c3000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000004',
   'b2000000-0000-0000-0000-000000000004',
   'Daniela''s Current Listings', 'visible',
   '$2a$10$H9kI4IdnKEx/hzcqrg8Gaucy7Vky.K8SIHhMcv3u4w02anzCkor1.',
   'Here''s what I''m working with right now. These move fast, so don''t wait if something catches your eye. Call me anytime.',
   'Current Listings', true),

  -- Jordan Okafor: visible portfolio — PIN: 4040
  ('c3000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000005',
   'b2000000-0000-0000-0000-000000000005',
   'Layup Labs — Series A Materials', 'visible',
   '$2a$10$emXVz5wI9SGOH8df5l769OokbNVgYlZt3lpAN7H8qRs78MaYx4evu',
   'Thanks for your interest. Here''s our latest deck and key materials. Happy to walk through anything live — just book a time.',
   'Pitch Deck', true),

  -- Emma Patel: visible portfolio — PIN: 3030
  ('c3000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000006',
   'b2000000-0000-0000-0000-000000000006',
   'Client Access', 'visible',
   '$2a$10$vwdHUtG6n3bfKLREUGJwluHVmPffK8jclpDUc708slZSaiZNKWI8m',
   'Here''s where your gallery lives. If you''re seeing this on the demo, imagine your wedding photos or brand shoot waiting right here.',
   'Client Gallery', true),

  -- Marcus Knight: easter egg — PIN: 8080
  ('c3000000-0000-0000-0000-000000000005',
   'a1000000-0000-0000-0000-000000000007',
   'b2000000-0000-0000-0000-000000000007',
   'The Off-Duty Marcus', 'hidden',
   '$2a$10$IBBIawhy/CHyDZDkXwrssempPadR4zk13Mj4VJsiDu9SJu2i2zEqa',
   'You found it. This is the side that doesn''t make it to the flyer. Welcome.',
   NULL, true),

  -- Ava Kimura: easter egg — PIN: 2222
  ('c3000000-0000-0000-0000-000000000006',
   'a1000000-0000-0000-0000-000000000008',
   'b2000000-0000-0000-0000-000000000008',
   'Close Friends IRL', 'hidden',
   '$2a$10$OayKYwWXl6xs39quRooim.SAFQxWKdFztDI/SBlUn4HkyHHbdLX4u',
   'This is my actual page, not the brand. If you''re here, we''re cool.',
   NULL, true),

  -- Felix Yamamoto: visible portfolio — PIN: 5050
  ('c3000000-0000-0000-0000-000000000007',
   'a1000000-0000-0000-0000-000000000009',
   'b2000000-0000-0000-0000-000000000009',
   'Studio FY — In Progress', 'visible',
   '$2a$10$E073t72VOSbaj1nS4ckvoORniBOiol0mz6H4/L8a/BRydUzJPQF0y',
   'These are active projects in various stages. Shared under NDA. Please don''t redistribute.',
   'Current Projects', true),

  -- Darius Webb: easter egg — PIN: 9090
  ('c3000000-0000-0000-0000-000000000008',
   'a1000000-0000-0000-0000-000000000012',
   'b2000000-0000-0000-0000-000000000012',
   'Off the Clock', 'hidden',
   '$2a$10$VJHiVXBEcpXXm48XNkuE6O7EvfCw7FbJd1xw2Kaai24lCixfU0M/K',
   'Training is what I do, not all I am. Here''s the rest.',
   NULL, true);

COMMIT;
