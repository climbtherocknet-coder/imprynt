-- Add impression icon customization columns to protected_pages
-- These control the appearance of the circle-dot icon on the public profile
ALTER TABLE protected_pages ADD COLUMN IF NOT EXISTS icon_color VARCHAR(20) DEFAULT NULL;
ALTER TABLE protected_pages ADD COLUMN IF NOT EXISTS icon_opacity NUMERIC(3,2) DEFAULT 0.35;
ALTER TABLE protected_pages ADD COLUMN IF NOT EXISTS icon_corner VARCHAR(20) DEFAULT 'bottom-right';
