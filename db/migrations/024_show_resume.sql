-- Add show_resume toggle to protected_pages (defaults to true for backward compat)
ALTER TABLE protected_pages ADD COLUMN IF NOT EXISTS show_resume BOOLEAN NOT NULL DEFAULT true;
