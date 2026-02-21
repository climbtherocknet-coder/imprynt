-- Migration 037: Cover / background photo support
-- cover_style: how the image is displayed (none | banner | fullpage)
-- cover_opacity: for fullpage mode, controls image brightness (100=full, 10=very dark)
-- cover_position_y: vertical focal point for object-position (0=top, 50=center, 100=bottom)

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_url VARCHAR(500);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_style VARCHAR(20) NOT NULL DEFAULT 'none' CHECK (cover_style IN ('none', 'banner', 'fullpage'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_opacity SMALLINT NOT NULL DEFAULT 30 CHECK (cover_opacity BETWEEN 10 AND 100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_position_y INTEGER NOT NULL DEFAULT 50 CHECK (cover_position_y BETWEEN 0 AND 100);
