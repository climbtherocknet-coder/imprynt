-- 048: Music pod type
-- Add 'music' to pod_type CHECK constraint, add audio columns

-- Drop and recreate the CHECK constraint to include 'music'
ALTER TABLE pods DROP CONSTRAINT IF EXISTS pods_pod_type_check;
ALTER TABLE pods ADD CONSTRAINT pods_pod_type_check
  CHECK (pod_type IN ('text', 'text_image', 'stats', 'cta', 'link_preview', 'project', 'listing', 'event', 'music'));

-- Add audio-specific columns
ALTER TABLE pods
  ADD COLUMN IF NOT EXISTS audio_url      VARCHAR(500),
  ADD COLUMN IF NOT EXISTS audio_duration  INTEGER;  -- duration in seconds
