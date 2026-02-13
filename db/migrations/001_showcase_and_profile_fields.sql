-- Migration 001: Add richer profile fields and showcase_items table
-- Run this against an existing database. For fresh installs, update init.sql.

-- Add tagline and bio_heading to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tagline VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio_heading VARCHAR(100);
ALTER TABLE profiles ALTER COLUMN bio TYPE VARCHAR(1000);

-- Showcase items for protected pages (project portfolio)
CREATE TABLE IF NOT EXISTS showcase_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protected_page_id UUID NOT NULL REFERENCES protected_pages(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    description     VARCHAR(1000),
    image_url       VARCHAR(500),
    link_url        VARCHAR(500),
    tags            VARCHAR(200),
    item_date       DATE,
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_showcase_items_page ON showcase_items(protected_page_id);

CREATE TRIGGER showcase_items_updated_at BEFORE UPDATE ON showcase_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
