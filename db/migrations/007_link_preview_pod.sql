-- 007: Add link_preview pod type
-- Link preview pods auto-fetch OG metadata from a URL and display
-- a rich card with image, title, description, and domain badge.

-- Update the CHECK constraint to allow the new pod type
ALTER TABLE pods DROP CONSTRAINT IF EXISTS pods_pod_type_check;
ALTER TABLE pods ADD CONSTRAINT pods_pod_type_check
  CHECK (pod_type IN ('text', 'text_image', 'stats', 'cta', 'link_preview'));
