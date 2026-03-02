-- Migration 061: Add featured column to links for "Display as content block" toggle
ALTER TABLE links ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
