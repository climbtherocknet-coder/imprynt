-- Add is_demo flag to users for identifying seeded demo profiles
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;

-- Partial index for fast demo user lookups (only indexes the small demo subset)
CREATE INDEX IF NOT EXISTS idx_users_is_demo ON users(is_demo) WHERE is_demo = true;
