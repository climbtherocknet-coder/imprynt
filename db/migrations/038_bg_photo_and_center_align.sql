-- Background photo (full page behind entire profile)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bg_image_url VARCHAR(500);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bg_image_opacity SMALLINT NOT NULL DEFAULT 20 CHECK (bg_image_opacity BETWEEN 5 AND 100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bg_image_position_y INTEGER NOT NULL DEFAULT 50 CHECK (bg_image_position_y BETWEEN 0 AND 100);

-- Update photo_align constraint to support center
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_photo_align_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_photo_align_check CHECK (photo_align IN ('left', 'center', 'right'));
