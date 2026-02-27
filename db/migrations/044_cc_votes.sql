-- 044: Command Center voting on features and roadmap items
CREATE TABLE IF NOT EXISTS cc_votes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_type VARCHAR(20) NOT NULL CHECK (parent_type IN ('feature', 'roadmap')),
    parent_id   UUID NOT NULL,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(parent_type, parent_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_cc_votes_parent ON cc_votes(parent_type, parent_id);
CREATE INDEX IF NOT EXISTS idx_cc_votes_user ON cc_votes(user_id);
