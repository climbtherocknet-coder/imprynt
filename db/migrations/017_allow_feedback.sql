-- Migration 017: Add allow_feedback toggle to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS allow_feedback BOOLEAN NOT NULL DEFAULT true;
