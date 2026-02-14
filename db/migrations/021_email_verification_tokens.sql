-- Migration 021: Email verification tokens
-- Stores one-time tokens for email address verification

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(64) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evtoken_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_evtoken_user ON email_verification_tokens(user_id);
