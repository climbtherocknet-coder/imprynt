-- Migration 057: Add photo_mode column to profiles and protected_pages
-- Allows toggling between 'photo' (headshot with shaped frame) and 'logo' (transparent-friendly, no frame)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_mode VARCHAR(10) DEFAULT 'photo';
ALTER TABLE protected_pages ADD COLUMN IF NOT EXISTS photo_mode VARCHAR(10) DEFAULT 'photo';
