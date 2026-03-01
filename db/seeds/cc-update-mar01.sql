-- Command Center Updates — March 1, 2026
-- Status Tags relocation + Logo Mode for profile photos

-- ═══════════════════════════════════════════════════
-- ADD NEW FEATURE
-- ═══════════════════════════════════════════════════

INSERT INTO cc_features (name, description, category, status, release_phase, priority) VALUES
  ('Logo Mode', 'Profile photo toggle between Photo mode (headshot with shaped frame) and Logo mode (transparent-friendly, no frame, no border, object-fit contain). Cascades to protected pages. Database column photo_mode on profiles and protected_pages.', 'ux', 'shipped', 'v1', 31);

-- ═══════════════════════════════════════════════════
-- ADD CHANGELOG ENTRY
-- ═══════════════════════════════════════════════════

INSERT INTO cc_changelog (title, body, version, entry_date, tags) VALUES
  ('Status Tags & Logo Mode', 'Status tags moved from above cover photo to below name/title in the hero section. Styled as glassmorphic pills with backdrop-filter blur. New Logo Mode toggle in Photo Settings — switches profile photo rendering from shaped headshot to transparent-friendly logo display (object-fit contain, no frame). Logo mode auto-centers above name. Supported on main profile, personal, and portfolio pages.', 'v0.11.1', '2026-03-01', '{ux,photos,editor}');

-- ═══════════════════════════════════════════════════
-- COVER LOGO MODE
-- ═══════════════════════════════════════════════════

INSERT INTO cc_features (name, description, category, status, release_phase, priority) VALUES
  ('Cover Logo Mode', 'Cover photo slot supports Logo mode: displays transparent logos without opacity/gradient overlays. Position options: above profile photo or beside name. Zoom slider for sizing. Photo mode unchanged.', 'profile', 'shipped', 'v1', 8);

INSERT INTO cc_changelog (title, body, version, entry_date, tags, is_public) VALUES
  ('Cover Logo Mode', 'Cover photo slot now supports Photo and Logo modes. Logo mode renders transparent images cleanly without overlays or dimming. Two position options: above profile photo (centered header) or beside name (inline brand). Editor shows mode toggle, position picker, and size slider for logo mode. Status tags confirmed below name/title.', 'v0.11.2', '2026-03-01', '{cover,logo,layout,ux}', true);
