-- Migration 036: Add custom_theme JSONB column to profiles
-- Stores the full custom theme configuration when template = 'custom'.
-- NULL means the user hasn't configured a custom theme yet.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS custom_theme JSONB DEFAULT NULL;
