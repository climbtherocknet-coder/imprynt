-- 045: Event pod columns + open_house listing status

-- Event-specific columns
ALTER TABLE pods
  ADD COLUMN IF NOT EXISTS event_start     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS event_end       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS event_venue     VARCHAR(200),
  ADD COLUMN IF NOT EXISTS event_address   VARCHAR(300),
  ADD COLUMN IF NOT EXISTS event_status    VARCHAR(20) DEFAULT 'upcoming'
    CHECK (event_status IN ('upcoming', 'cancelled', 'postponed', 'sold_out')),
  ADD COLUMN IF NOT EXISTS event_auto_hide BOOLEAN NOT NULL DEFAULT true;

-- Update pod_type constraint to include 'event'
ALTER TABLE pods DROP CONSTRAINT IF EXISTS pods_pod_type_check;
ALTER TABLE pods ADD CONSTRAINT pods_pod_type_check
  CHECK (pod_type IN ('text', 'text_image', 'stats', 'cta', 'link_preview', 'project', 'listing', 'event'));

-- Update listing_status constraint to include 'open_house'
ALTER TABLE pods DROP CONSTRAINT IF EXISTS pods_listing_status_check;
ALTER TABLE pods ADD CONSTRAINT pods_listing_status_check
  CHECK (listing_status IN ('active', 'pending', 'sold', 'off_market', 'rented', 'leased', 'open_house'));

-- Index for auto-hide filtering on event pods
CREATE INDEX IF NOT EXISTS idx_pods_event_start ON pods(event_start) WHERE pod_type = 'event';
