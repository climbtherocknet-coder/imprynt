-- 009: Extend pods to support protected pages (Impression + Showcase)
-- Adds dual-parent pattern (same as links table), project pod type, show_on_profile, tags

-- Make profile_id nullable (pods can now belong to protected pages instead)
ALTER TABLE pods ALTER COLUMN profile_id DROP NOT NULL;

-- Add protected_page_id column
ALTER TABLE pods ADD COLUMN IF NOT EXISTS protected_page_id UUID REFERENCES protected_pages(id) ON DELETE CASCADE;

-- Add show_on_profile flag (showcase pods promoted to main profile)
ALTER TABLE pods ADD COLUMN IF NOT EXISTS show_on_profile BOOLEAN NOT NULL DEFAULT false;

-- Add tags column (for project pod type)
ALTER TABLE pods ADD COLUMN IF NOT EXISTS tags VARCHAR(500);

-- Mutual exclusivity constraint (same pattern as links table)
ALTER TABLE pods ADD CONSTRAINT pod_belongs_to_one CHECK (
    (profile_id IS NOT NULL AND protected_page_id IS NULL) OR
    (profile_id IS NULL AND protected_page_id IS NOT NULL)
);

-- Update pod_type CHECK to include 'project'
ALTER TABLE pods DROP CONSTRAINT IF EXISTS pods_pod_type_check;
ALTER TABLE pods ADD CONSTRAINT pods_pod_type_check
    CHECK (pod_type IN ('text', 'text_image', 'stats', 'cta', 'link_preview', 'project'));

-- Index for protected page lookups
CREATE INDEX IF NOT EXISTS idx_pods_protected_page ON pods(protected_page_id);
