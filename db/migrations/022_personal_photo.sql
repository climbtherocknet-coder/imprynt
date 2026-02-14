-- Add personal photo_url to protected_pages for impression pages
ALTER TABLE protected_pages ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500);

-- Add allow_remember column if not already present
ALTER TABLE protected_pages ADD COLUMN IF NOT EXISTS allow_remember BOOLEAN NOT NULL DEFAULT true;

-- Add pin_version for cookie invalidation on PIN change
ALTER TABLE protected_pages ADD COLUMN IF NOT EXISTS pin_version INTEGER NOT NULL DEFAULT 1;
