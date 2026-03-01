-- Migration 058: Cover Logo Mode
-- Adds cover_mode ('photo'|'logo') and cover_logo_position ('above'|'beside') columns
-- to profiles and protected_pages tables for cover logo rendering

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_mode VARCHAR(10) DEFAULT 'photo';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_logo_position VARCHAR(20) DEFAULT 'above';

ALTER TABLE protected_pages ADD COLUMN IF NOT EXISTS cover_mode VARCHAR(10) DEFAULT 'photo';
ALTER TABLE protected_pages ADD COLUMN IF NOT EXISTS cover_logo_position VARCHAR(20) DEFAULT 'above';
