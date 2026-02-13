-- Migration 003: Contact fields, vCard download tokens, resume URL
-- Adds dual vCard support (business/personal) and resume link for showcase pages

-- Add resume_url to protected_pages
ALTER TABLE protected_pages ADD COLUMN IF NOT EXISTS resume_url VARCHAR(500);

-- Contact fields table
CREATE TABLE IF NOT EXISTS contact_fields (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    field_type      VARCHAR(30) NOT NULL CHECK (field_type IN (
        'phone_cell', 'phone_work', 'address_work', 'address_home',
        'birthday', 'pronouns', 'name_suffix'
    )),
    field_value     VARCHAR(500) NOT NULL,
    visibility      VARCHAR(10) NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'personal')),
    display_order   INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_field UNIQUE (user_id, field_type)
);

CREATE INDEX IF NOT EXISTS idx_contact_fields_user ON contact_fields(user_id);

-- vCard download tokens (short-lived, one-time use for personal vCard)
CREATE TABLE IF NOT EXISTS vcard_download_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token_hash      VARCHAR(64) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vcard_tokens_profile ON vcard_download_tokens(profile_id);
CREATE INDEX IF NOT EXISTS idx_vcard_tokens_hash ON vcard_download_tokens(token_hash);

-- Trigger for contact_fields updated_at
CREATE TRIGGER contact_fields_updated_at BEFORE UPDATE ON contact_fields FOR EACH ROW EXECUTE FUNCTION update_updated_at();
