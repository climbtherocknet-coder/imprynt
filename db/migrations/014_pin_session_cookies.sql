-- Migration 014: PIN session cookies (remember device)
ALTER TABLE protected_pages ADD COLUMN IF NOT EXISTS pin_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE protected_pages ADD COLUMN IF NOT EXISTS allow_remember BOOLEAN NOT NULL DEFAULT true;
