-- Migration 035: Add photo_align column to profiles
-- Allows users to position their photo on the left or right of the hero section.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS photo_align VARCHAR(10) NOT NULL DEFAULT 'left'
    CHECK (photo_align IN ('left', 'right'));
