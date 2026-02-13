-- Migration 016: Feedback triage system + Scoring foundation
-- Run: docker exec imprynt-db psql -U imprynt -d imprynt -f /docker-entrypoint-initdb.d/016_feedback_and_scores.sql

-- ── Feedback ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS feedback (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
    email               VARCHAR(255),
    message             TEXT NOT NULL,
    page_url            VARCHAR(500),
    reported_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    feedback_type       VARCHAR(20) NOT NULL DEFAULT 'feedback' CHECK (feedback_type IN ('feedback', 'report')),
    status              VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'bug', 'improvement', 'report', 'closed')),
    admin_notes         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_reported ON feedback(reported_profile_id);

CREATE TRIGGER feedback_updated_at BEFORE UPDATE ON feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Score Events ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS score_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    source_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type      VARCHAR(30) NOT NULL CHECK (event_type IN (
        'page_view', 'vcard_download', 'impression_unlock', 'share', 'link_click'
    )),
    points          INTEGER NOT NULL,
    ip_hash         VARCHAR(64),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_score_events_profile ON score_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_score_events_created ON score_events(created_at);

-- ── User Scores (aggregated) ───────────────────────────

CREATE TABLE IF NOT EXISTS user_scores (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    score_total     INTEGER NOT NULL DEFAULT 0,
    score_30d       INTEGER NOT NULL DEFAULT 0,
    last_computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_scores_total ON user_scores(score_total DESC);
CREATE INDEX IF NOT EXISTS idx_user_scores_30d ON user_scores(score_30d DESC);

CREATE TRIGGER user_scores_updated_at BEFORE UPDATE ON user_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Leaderboard columns on users ───────────────────────

ALTER TABLE users ADD COLUMN IF NOT EXISTS leaderboard_opt_in BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS leaderboard_name VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS leaderboard_color VARCHAR(7) DEFAULT '#e8a849';
