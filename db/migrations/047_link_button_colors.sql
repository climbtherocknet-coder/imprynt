-- 047: Link button color customization
-- Global button color on profiles, per-link color on links
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS link_button_color VARCHAR(7);  -- hex, NULL = use accent

ALTER TABLE links
  ADD COLUMN IF NOT EXISTS button_color VARCHAR(7);  -- hex, NULL = use global/accent

-- Fix shape values: rename 'circle' → 'rounded' (spec correction)
UPDATE profiles SET link_shape = 'rounded' WHERE link_shape = 'circle';
UPDATE protected_pages SET link_shape = 'rounded' WHERE link_shape = 'circle';
