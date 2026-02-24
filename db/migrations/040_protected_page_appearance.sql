-- 040: Per-page photo, cover, and background settings for protected pages
ALTER TABLE protected_pages
  ADD COLUMN IF NOT EXISTS photo_shape        VARCHAR(20) NOT NULL DEFAULT 'circle',
  ADD COLUMN IF NOT EXISTS photo_radius       INTEGER,
  ADD COLUMN IF NOT EXISTS photo_size         VARCHAR(10) NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS photo_position_x   INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS photo_position_y   INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS photo_animation    VARCHAR(20) NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS photo_align        VARCHAR(10) NOT NULL DEFAULT 'center',
  ADD COLUMN IF NOT EXISTS cover_url          VARCHAR(500),
  ADD COLUMN IF NOT EXISTS cover_opacity      SMALLINT NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS cover_position_y   INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS bg_image_url       VARCHAR(500),
  ADD COLUMN IF NOT EXISTS bg_image_opacity   SMALLINT NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS bg_image_position_y INTEGER NOT NULL DEFAULT 50;
