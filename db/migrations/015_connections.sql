-- Migration 015: Connections table + share toggle
CREATE TABLE IF NOT EXISTS connections (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    viewer_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,
    connection_type VARCHAR(30) NOT NULL CHECK (connection_type IN (
        'page_view', 'pin_success', 'vcard_download', 'impressed', 'shared'
    )),
    ip_hash         VARCHAR(64),
    viewer_email    VARCHAR(255),
    viewer_name     VARCHAR(200),
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_connections_profile ON connections(profile_id);
CREATE INDEX IF NOT EXISTS idx_connections_viewer ON connections(viewer_user_id);
CREATE INDEX IF NOT EXISTS idx_connections_type ON connections(connection_type);
CREATE INDEX IF NOT EXISTS idx_connections_created ON connections(created_at);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS allow_sharing BOOLEAN NOT NULL DEFAULT true;
