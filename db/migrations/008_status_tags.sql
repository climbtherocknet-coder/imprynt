-- 008: Add status tags to profiles
-- Multi-select status badges shown on public profile (e.g. "Open to Network", "Hiring")
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status_tags TEXT[] DEFAULT '{}';
