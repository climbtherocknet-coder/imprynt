-- 064: Shell System — NFC pre-activation and batch inventory

-- shell_batches: groups of pre-generated shells
CREATE TABLE IF NOT EXISTS shell_batches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    quantity        INTEGER NOT NULL,
    tag             VARCHAR(50),
    created_by      VARCHAR(255) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- shells: individual pre-activated NFC profiles
CREATE TABLE IF NOT EXISTS shells (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id        UUID NOT NULL REFERENCES shell_batches(id) ON DELETE CASCADE,
    nfc_id          VARCHAR(20) UNIQUE NOT NULL,
    invite_code     VARCHAR(20) UNIQUE NOT NULL,
    profile_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
    claimed_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'available',
    claimed_at      TIMESTAMPTZ,
    disabled_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT shells_status_check CHECK (status IN ('available', 'claimed', 'disabled'))
);

CREATE INDEX IF NOT EXISTS idx_shells_nfc_id ON shells(nfc_id);
CREATE INDEX IF NOT EXISTS idx_shells_invite_code ON shells(invite_code);
CREATE INDEX IF NOT EXISTS idx_shells_batch_id ON shells(batch_id);
CREATE INDEX IF NOT EXISTS idx_shells_status ON shells(status);

-- Add use_company_as_display to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS use_company_as_display BOOLEAN NOT NULL DEFAULT false;
