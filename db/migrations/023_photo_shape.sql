-- 023: Add photo shape settings to profiles
-- Lets users pick a shape for their profile photo (circle, rounded, soft, square, hexagon, diamond, custom)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_shape VARCHAR(20) NOT NULL DEFAULT 'circle';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_radius INTEGER;
