-- 042: Listing pod type — smart cards with status lifecycle
-- Adds 'listing' to pod_type constraint + listing-specific columns

-- Drop and recreate the pod_type CHECK constraint to include 'listing'
ALTER TABLE pods DROP CONSTRAINT IF EXISTS pods_pod_type_check;
ALTER TABLE pods ADD CONSTRAINT pods_pod_type_check
  CHECK (pod_type IN ('text', 'text_image', 'stats', 'cta', 'link_preview', 'project', 'listing'));

-- Listing-specific columns
ALTER TABLE pods
  ADD COLUMN IF NOT EXISTS listing_status   VARCHAR(20) DEFAULT 'active'
    CHECK (listing_status IN ('active', 'pending', 'sold', 'off_market', 'rented', 'leased')),
  ADD COLUMN IF NOT EXISTS listing_price    VARCHAR(50),
  ADD COLUMN IF NOT EXISTS listing_details  JSONB,
  ADD COLUMN IF NOT EXISTS source_domain    VARCHAR(100),
  ADD COLUMN IF NOT EXISTS auto_remove_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sold_at          TIMESTAMPTZ;

-- Index for auto-remove scheduling
CREATE INDEX IF NOT EXISTS idx_pods_auto_remove ON pods(auto_remove_at) WHERE auto_remove_at IS NOT NULL;
