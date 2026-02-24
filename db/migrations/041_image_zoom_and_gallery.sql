-- 041: Image zoom controls + gallery table

-- Add zoom columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS photo_zoom         SMALLINT NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS cover_position_x   INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS cover_zoom         SMALLINT NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS bg_image_position_x INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS bg_image_zoom      SMALLINT NOT NULL DEFAULT 100;

-- Add zoom columns to protected_pages
ALTER TABLE protected_pages
  ADD COLUMN IF NOT EXISTS photo_zoom         SMALLINT NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS cover_position_x   INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS cover_zoom         SMALLINT NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS bg_image_position_x INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS bg_image_zoom      SMALLINT NOT NULL DEFAULT 100;

-- Gallery table for curated backgrounds and covers
CREATE TABLE IF NOT EXISTS image_gallery (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category      VARCHAR(50) NOT NULL,
  url           VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  label         VARCHAR(100),
  tags          VARCHAR(200),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_image_gallery_category ON image_gallery(category);
