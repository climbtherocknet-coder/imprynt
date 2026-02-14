-- Migration 019: Add granted_plan to invite_codes
ALTER TABLE invite_codes ADD COLUMN IF NOT EXISTS granted_plan VARCHAR(20) NOT NULL DEFAULT 'free';
