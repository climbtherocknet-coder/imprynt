-- Migration 018: Add status_tag_color to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status_tag_color VARCHAR(7);
