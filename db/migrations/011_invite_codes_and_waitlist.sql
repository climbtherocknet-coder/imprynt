-- 011: Invite codes and waitlist for closed registration

-- invite_codes: admin-generated codes for gated sign-up
CREATE TABLE IF NOT EXISTS invite_codes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(20) UNIQUE NOT NULL,
    created_by      VARCHAR(255) NOT NULL,       -- admin email who created it
    max_uses        INTEGER DEFAULT 1,           -- NULL = unlimited
    use_count       INTEGER NOT NULL DEFAULT 0,
    expires_at      TIMESTAMPTZ,                 -- NULL = never expires
    note            VARCHAR(255),                -- admin note ("for Tim's friend", etc.)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code);

-- waitlist: email submissions for future invite distribution
CREATE TABLE IF NOT EXISTS waitlist (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    source          VARCHAR(50) DEFAULT 'waitlist_page',
    invited         BOOLEAN NOT NULL DEFAULT false,
    invited_at      TIMESTAMPTZ,
    invite_code_id  UUID REFERENCES invite_codes(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_invited ON waitlist(invited);

-- Track which invite code was used by each user
ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_code_id UUID REFERENCES invite_codes(id) ON DELETE SET NULL;
