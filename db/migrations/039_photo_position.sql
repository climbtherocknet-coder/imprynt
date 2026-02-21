-- Migration 039: Numeric photo position (0-100 slider, replaces left/center/right)
-- Zones: 0-33 = left, 34-66 = center, 67-100 = right
-- Backward compat: photo_align column still maintained as a derived value

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_position SMALLINT DEFAULT NULL CHECK (photo_position BETWEEN 0 AND 100);

-- Also add photo_align if it was never migrated (migration 035 may not have run)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_align VARCHAR(10) DEFAULT 'left' CHECK (photo_align IN ('left', 'center', 'right'));

-- Set photo_position for existing profiles based on photo_align
UPDATE profiles SET photo_position = CASE photo_align WHEN 'center' THEN 50 WHEN 'right' THEN 100 ELSE 0 END WHERE photo_position IS NULL;
