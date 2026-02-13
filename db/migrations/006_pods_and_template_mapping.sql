-- 006: Create pods table + map old template IDs to new ones
-- Pods are user-ordered content blocks on the public profile page

-- ============================================================
-- PODS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS pods (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    pod_type        VARCHAR(20) NOT NULL CHECK (pod_type IN ('text', 'text_image', 'stats', 'cta')),
    display_order   INTEGER NOT NULL DEFAULT 0,
    label           VARCHAR(50),        -- section label e.g. "About", "By the Numbers"
    title           VARCHAR(200),       -- pod heading
    body            TEXT,               -- rich text body
    image_url       VARCHAR(500),       -- for text_image pods
    stats           JSONB,              -- for stats pods: [{"num":"42","label":"Projects"}]
    cta_label       VARCHAR(100),       -- for cta pods: button text
    cta_url         VARCHAR(500),       -- for cta pods: button link
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pods_profile ON pods(profile_id);
CREATE INDEX IF NOT EXISTS idx_pods_order ON pods(profile_id, display_order);

-- Trigger for updated_at
CREATE TRIGGER pods_updated_at BEFORE UPDATE ON pods
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TEMPLATE ID MIGRATION
-- Map removed templates to new equivalents
-- ============================================================
UPDATE profiles SET template = 'midnight' WHERE template = 'dark';
UPDATE profiles SET template = 'signal'   WHERE template = 'bold';

-- ============================================================
-- MIGRATE EXISTING BIOS TO TEXT PODS
-- Convert profile bio content into a text pod so existing
-- profiles render correctly in the new pod-based system
-- ============================================================
INSERT INTO pods (profile_id, pod_type, display_order, label, title, body)
SELECT
    p.id,
    'text',
    0,
    COALESCE(p.bio_heading, 'About'),
    p.bio_heading,
    p.bio
FROM profiles p
WHERE p.bio IS NOT NULL AND p.bio != ''
AND NOT EXISTS (SELECT 1 FROM pods WHERE profile_id = p.id);
