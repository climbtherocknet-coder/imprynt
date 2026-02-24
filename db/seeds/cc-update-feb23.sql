-- Command Center Updates — Feb 23, 2026 Session
-- Run this against local DB after command center is built

-- ═══════════════════════════════════════════════════
-- MARK COMPLETED FEATURES
-- ═══════════════════════════════════════════════════

UPDATE cc_features SET status = 'shipped', shipped_at = NOW()
WHERE name = 'Listing Pods';

-- If ImageCropper/Visuals was seeded:
UPDATE cc_features SET status = 'shipped', shipped_at = NOW()
WHERE name ILIKE '%ImageCropper%' OR name ILIKE '%Visuals%';

-- ═══════════════════════════════════════════════════
-- ADD NEW FEATURES
-- ═══════════════════════════════════════════════════

INSERT INTO cc_features (name, description, category, status, release_phase, priority) VALUES
  ('Event Pods', 'Date/time, venue, countdown, status lifecycle (upcoming/live/ended/cancelled/sold_out), auto-hide past events, Google Maps venue link', 'content_blocks', 'in_progress', 'v1', 21),
  ('Command Center Voting', 'Upvote/downvote on features and roadmap items, advisory + admin can vote, sort by votes', 'platform', 'in_progress', 'v1', 22),
  ('Link Preview Fix', 'Auto-fetch on paste, image upload fallback, URL title extraction, OG image validation, accent border no-image variant', 'content_blocks', 'in_progress', 'v1', 23),
  ('Link Button Sizes & Shapes', 'Small/medium/large size + pill/circle/square shape controls for link buttons per profile', 'ux', 'planned', 'v1', 24),
  ('Consolidated Sticky Save', 'One save button per editor tab, dirty state tracking, remove scattered save buttons', 'ux', 'planned', 'v1', 25),
  ('Pod Preview Auto-Refresh', 'Phone preview refreshes when content blocks are added/edited/deleted', 'ux', 'planned', 'v1', 26),
  ('PIN Controls on Dashboard', 'Protected page PIN status cards above phone preview on main dashboard', 'ux', 'planned', 'v1', 27),
  ('Admin + Command Center Merge', 'Consolidate old admin stats page into Command Center overview, role-based tab visibility', 'platform', 'planned', 'v1.5', 28),
  ('Open House on Listings', 'Open house status with date/time badge, auto-revert to active after event', 'content_blocks', 'in_progress', 'v1', 29),
  ('Personality Badges', 'Enneagram, MBTI, DISC, StrengthsFinder badges in status section. Enterprise potential.', 'platform', 'exploring', 'v2', 30);

-- ═══════════════════════════════════════════════════
-- UPDATE ROADMAP
-- ═══════════════════════════════════════════════════

-- Move completed items to done
UPDATE cc_roadmap SET phase = 'done', completed_at = NOW()
WHERE title ILIKE '%ImageCropper%' OR title ILIKE '%Visuals%' OR title ILIKE '%listing pod%';

-- Add new roadmap items
INSERT INTO cc_roadmap (title, description, phase, category, priority) VALUES
  ('Event pods', 'Date/time, venue, countdown, auto-hide, open house for listings', 'now', 'content_blocks', 1),
  ('CC voting + link preview fix', 'Upvotes on features/roadmap + link preview resilience improvements', 'now', 'content_blocks', 2),
  ('Link button sizes & shapes', 'S/M/L size + pill/circle/square shape per profile', 'now', 'ux', 3),
  ('Sticky save + pod refresh', 'One save button, dirty tracking, auto preview refresh', 'now', 'ux', 4),
  ('PIN controls on dashboard', 'Protected page status cards above phone preview', 'now', 'ux', 5),
  ('Admin/CC merge', 'Consolidate admin stats into CC overview, role-based tabs', 'next', 'platform', 6),
  ('Personality badges', 'Enneagram, MBTI, DISC badges in status section', 'later', 'platform', 7);

-- ═══════════════════════════════════════════════════
-- ADD CHANGELOG ENTRIES
-- ═══════════════════════════════════════════════════

INSERT INTO cc_changelog (title, body, version, entry_date, tags) VALUES
  ('Event Pods', 'New event content block with date/time, venue with Google Maps link, countdown display, status lifecycle (upcoming, live, ended, cancelled, sold out, postponed), and auto-hide for past events. Open house status added to listing pods with date badge.', 'v1.0', '2026-02-23', '{content_blocks,events}'),
  ('ImageCropper & Unified Visuals', 'Drag-to-reposition photo cropper for profile, cover, and background photos. Unified Visuals section at top of editor. Gallery architecture stubbed. Expandable photo lightbox on public profiles.', 'v1.0', '2026-02-23', '{ux,photos,editor}'),
  ('Command Center', 'Internal product hub with Features tracker, Roadmap kanban, Changelog timeline, and Docs with markdown rendering. Role-based access for admin and advisory users. Comments on all item types.', 'v1.0', '2026-02-23', '{platform,admin}'),
  ('Link Preview Improvements', 'Auto-fetch on URL paste with debounce. Photo upload fallback when OG images are blocked. URL path title extraction. OG image validation via HEAD request. Accent left-border for no-image cards.', 'v1.0', '2026-02-23', '{content_blocks,link_preview}');
