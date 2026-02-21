-- Imprynt Platform Database Schema
-- V1 MVP with forward-compatible V1.5/V2 tables

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- Auth credentials, account info, subscription status
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    email_verified  TIMESTAMPTZ,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    plan            VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium_monthly', 'premium_annual', 'advisory')),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    setup_completed BOOLEAN NOT NULL DEFAULT false,
    invite_code_id  UUID,                        -- FK added after invite_codes table created
    trial_started_at TIMESTAMPTZ,
    trial_ends_at    TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);

-- ============================================================
-- PROFILES
-- Business page content, template, customization
-- One profile per user (V1). Schema supports future expansion.
-- ============================================================
CREATE TABLE profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slug            VARCHAR(20) UNIQUE NOT NULL,
    redirect_id     VARCHAR(20) UNIQUE NOT NULL, -- static ID for NFC redirect URL (/r/{redirect_id})
    title           VARCHAR(100),                -- job title / role
    company         VARCHAR(100),
    tagline         VARCHAR(100),                -- short headline under name
    bio_heading     VARCHAR(100),                -- optional heading above bio (e.g. "About Me")
    bio             VARCHAR(1000),               -- bio text, supports line breaks
    photo_url       VARCHAR(500),
    template        VARCHAR(50) NOT NULL DEFAULT 'clean',
    primary_color   VARCHAR(7) DEFAULT '#000000',   -- hex
    accent_color    VARCHAR(7) DEFAULT NULL,         -- hex; NULL = use template default
    font_pair       VARCHAR(50) DEFAULT 'default',  -- e.g. 'default', 'serif', 'mono'
    link_display    VARCHAR(20) NOT NULL DEFAULT 'default', -- 'default' | 'icons'
    is_published    BOOLEAN NOT NULL DEFAULT false,
    photo_shape     VARCHAR(20) NOT NULL DEFAULT 'circle',
    photo_radius    INTEGER,
    photo_size      VARCHAR(10) NOT NULL DEFAULT 'medium',
    photo_position_x INTEGER NOT NULL DEFAULT 50,
    photo_position_y INTEGER NOT NULL DEFAULT 50,
    photo_animation VARCHAR(20) NOT NULL DEFAULT 'none',
    photo_align     VARCHAR(10) NOT NULL DEFAULT 'left' CHECK (photo_align IN ('left', 'right')),
    custom_theme    JSONB DEFAULT NULL,               -- custom template config (only when template = 'custom')
    status_tags     TEXT[] DEFAULT '{}',              -- e.g. {'open_to_network','hiring'}
    slug_rotated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_profile UNIQUE (user_id) -- one profile per user for V1
);

CREATE INDEX idx_profiles_slug ON profiles(slug);
CREATE INDEX idx_profiles_redirect ON profiles(redirect_id);
CREATE INDEX idx_profiles_user ON profiles(user_id);

-- ============================================================
-- PROTECTED PAGES
-- PIN-gated content pages (impression or visible protected link)
-- V1 exposes one per user, but schema supports multiple for V1.5
-- ============================================================
CREATE TABLE protected_pages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    page_title      VARCHAR(100) NOT NULL,
    visibility_mode VARCHAR(10) NOT NULL CHECK (visibility_mode IN ('hidden', 'visible')),
    pin_hash        VARCHAR(255) NOT NULL,
    bio_text        VARCHAR(500),
    button_label    VARCHAR(50),      -- label shown on profile for 'visible' mode
    resume_url      VARCHAR(500),     -- optional resume/CV link for showcase pages
    icon_color      VARCHAR(20),      -- impression icon color (default: accent color)
    icon_opacity    NUMERIC(3,2) DEFAULT 0.35,  -- impression icon opacity (0.0 - 1.0)
    icon_corner     VARCHAR(20) DEFAULT 'bottom-right', -- impression icon corner placement
    photo_url       VARCHAR(500),     -- personal photo for impression pages
    allow_remember  BOOLEAN NOT NULL DEFAULT true,
    pin_version     INTEGER NOT NULL DEFAULT 1,
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_protected_pages_profile ON protected_pages(profile_id);
CREATE INDEX idx_protected_pages_user ON protected_pages(user_id);

-- ============================================================
-- LINKS
-- Unified link model with visibility toggles per context
-- ============================================================
CREATE TABLE links (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    link_type       VARCHAR(30) NOT NULL CHECK (link_type IN (
        'linkedin', 'website', 'email', 'phone', 'booking',
        'instagram', 'twitter', 'facebook', 'github',
        'tiktok', 'youtube', 'custom', 'vcard', 'spotify'
    )),
    label           VARCHAR(100),
    url             VARCHAR(500) NOT NULL,
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    show_business   BOOLEAN NOT NULL DEFAULT true,
    show_personal   BOOLEAN NOT NULL DEFAULT false,
    show_showcase   BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_links_profile ON links(profile_id);
CREATE INDEX idx_links_user ON links(user_id);

-- ============================================================
-- ANALYTICS
-- Page views and basic engagement tracking
-- ============================================================
CREATE TABLE analytics_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_type      VARCHAR(30) NOT NULL CHECK (event_type IN (
        'page_view', 'link_click', 'vcard_download',
        'pin_attempt', 'pin_success', 'nfc_tap'
    )),
    referral_source VARCHAR(30),  -- 'nfc', 'link', 'qr', 'direct'
    link_id         UUID REFERENCES links(id) ON DELETE SET NULL,
    ip_hash         VARCHAR(64),  -- hashed IP for unique visitor estimates, never raw IP
    user_agent      VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_profile ON analytics_events(profile_id);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);

-- ============================================================
-- PIN ATTEMPT TRACKING
-- Rate limiting for protected page access
-- ============================================================
CREATE TABLE pin_attempts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    ip_hash         VARCHAR(64) NOT NULL,
    attempted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    success         BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_pin_attempts_profile_ip ON pin_attempts(profile_id, ip_hash);
CREATE INDEX idx_pin_attempts_time ON pin_attempts(attempted_at);

-- ============================================================
-- ACCESSORIES
-- Order tracking for rings, bands, tips
-- ============================================================
CREATE TABLE accessories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_type    VARCHAR(20) NOT NULL CHECK (product_type IN ('ring', 'band', 'tip')),
    status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'programmed', 'shipped', 'delivered', 'returned'
    )),
    size            VARCHAR(10),
    color           VARCHAR(30),
    programmed_url  VARCHAR(500),
    shipping_name   VARCHAR(200),
    shipping_address_line1 VARCHAR(255),
    shipping_address_line2 VARCHAR(255),
    shipping_city   VARCHAR(100),
    shipping_state  VARCHAR(50),
    shipping_zip    VARCHAR(20),
    shipping_country VARCHAR(2) DEFAULT 'US',
    tracking_number VARCHAR(100),
    stripe_payment_intent_id VARCHAR(255),
    shipped_at      TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accessories_user ON accessories(user_id);
CREATE INDEX idx_accessories_status ON accessories(status);

-- ============================================================
-- CONTACTS (V2, included in initial schema)
-- Personal rolodex / CRM
-- ============================================================
CREATE TABLE contacts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    connected_user_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- if they're also an Imprynt user
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    email           VARCHAR(255),
    phone           VARCHAR(50),
    company         VARCHAR(100),
    title           VARCHAR(100),
    notes           TEXT,
    source          VARCHAR(30) CHECK (source IN ('nfc_tap', 'manual', 'card_scan', 'import')),
    met_at          VARCHAR(200),  -- "SXSW 2026", "Office visit", etc.
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contacts_owner ON contacts(owner_user_id);
CREATE INDEX idx_contacts_connected ON contacts(connected_user_id);

-- ============================================================
-- SHOWCASE ITEMS
-- Portfolio/project items for protected showcase pages
-- ============================================================
CREATE TABLE showcase_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protected_page_id UUID NOT NULL REFERENCES protected_pages(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    description     VARCHAR(1000),
    image_url       VARCHAR(500),
    link_url        VARCHAR(500),
    tags            VARCHAR(200),
    item_date       DATE,
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_showcase_items_page ON showcase_items(protected_page_id);

-- ============================================================
-- CONTACT FIELDS
-- Extended contact info (phone, address, birthday, etc.)
-- Each field independently toggleable for Business and/or Personal vCard
-- ============================================================
CREATE TABLE contact_fields (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    field_type      VARCHAR(30) NOT NULL CHECK (field_type IN (
        'phone_cell', 'phone_work', 'phone_personal',
        'email_work', 'email_personal',
        'address_work', 'address_home',
        'birthday', 'pronouns', 'name_suffix', 'company'
    )),
    field_value     VARCHAR(500) NOT NULL,
    show_business   BOOLEAN NOT NULL DEFAULT true,
    show_personal   BOOLEAN NOT NULL DEFAULT true,
    display_order   INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_field UNIQUE (user_id, field_type)
);

CREATE INDEX idx_contact_fields_user ON contact_fields(user_id);

-- ============================================================
-- VCARD DOWNLOAD TOKENS
-- Short-lived tokens for personal vCard download (after PIN unlock)
-- ============================================================
CREATE TABLE vcard_download_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token_hash      VARCHAR(64) NOT NULL,  -- SHA-256 hash of the token
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vcard_tokens_profile ON vcard_download_tokens(profile_id);
CREATE INDEX idx_vcard_tokens_hash ON vcard_download_tokens(token_hash);

-- ============================================================
-- PODS
-- User-ordered content blocks for profiles and protected pages
-- Types: text, text_image, stats, cta, link_preview, project
-- Each pod belongs to either a profile OR a protected page (same pattern as links)
-- ============================================================
CREATE TABLE pods (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
    protected_page_id UUID REFERENCES protected_pages(id) ON DELETE CASCADE,
    pod_type        VARCHAR(20) NOT NULL CHECK (pod_type IN ('text', 'text_image', 'stats', 'cta', 'link_preview', 'project')),
    display_order   INTEGER NOT NULL DEFAULT 0,
    label           VARCHAR(50),        -- section label e.g. "About", "By the Numbers"
    title           VARCHAR(200),       -- pod heading
    body            TEXT,               -- rich text body
    image_url       VARCHAR(500),       -- for text_image / project pods
    stats           JSONB,              -- for stats pods: [{"num":"42","label":"Projects"}]
    cta_label       VARCHAR(100),       -- for cta / project pods: button text
    cta_url         VARCHAR(500),       -- for cta / project pods: button link
    tags            VARCHAR(500),       -- for project pods: comma-separated tags
    image_position  VARCHAR(10) NOT NULL DEFAULT 'left', -- for text_image pods: 'left' or 'right'
    show_on_profile BOOLEAN NOT NULL DEFAULT false, -- showcase pods promoted to main profile
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Each pod belongs to either a profile OR a protected page, not both
    CONSTRAINT pod_belongs_to_one CHECK (
        (profile_id IS NOT NULL AND protected_page_id IS NULL) OR
        (profile_id IS NULL AND protected_page_id IS NOT NULL)
    )
);

CREATE INDEX idx_pods_profile ON pods(profile_id);
CREATE INDEX idx_pods_protected_page ON pods(protected_page_id);
CREATE INDEX idx_pods_order ON pods(profile_id, display_order);

-- ============================================================
-- INVITE CODES
-- Admin-generated codes for gated registration
-- ============================================================
CREATE TABLE invite_codes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(20) UNIQUE NOT NULL,
    created_by      VARCHAR(255) NOT NULL,       -- admin email who created it
    max_uses        INTEGER DEFAULT 1,           -- NULL = unlimited
    use_count       INTEGER NOT NULL DEFAULT 0,
    expires_at      TIMESTAMPTZ,                 -- NULL = never expires
    note            VARCHAR(255),                -- admin note
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invite_codes_code ON invite_codes(code);

-- ============================================================
-- WAITLIST
-- Email submissions for future invite distribution
-- ============================================================
CREATE TABLE waitlist (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    source          VARCHAR(50) DEFAULT 'waitlist_page',
    invited         BOOLEAN NOT NULL DEFAULT false,
    invited_at      TIMESTAMPTZ,
    invite_code_id  UUID REFERENCES invite_codes(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_invited ON waitlist(invited);

-- Add FK from users.invite_code_id to invite_codes (deferred because users is created first)
ALTER TABLE users ADD CONSTRAINT fk_users_invite_code FOREIGN KEY (invite_code_id) REFERENCES invite_codes(id) ON DELETE SET NULL;

-- ============================================================
-- AUTH.JS REQUIRED TABLES
-- Sessions and verification tokens for NextAuth
-- ============================================================
CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token   VARCHAR(255) UNIQUE NOT NULL,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires         TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_sessions_token ON sessions(session_token);

CREATE TABLE verification_tokens (
    identifier      VARCHAR(255) NOT NULL,
    token           VARCHAR(255) UNIQUE NOT NULL,
    expires         TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- ============================================================
-- PASSWORD RESETS
-- Temporary tokens for password reset flow
-- ============================================================
CREATE TABLE password_resets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_resets_user ON password_resets(user_id);
CREATE INDEX idx_password_resets_token ON password_resets(token_hash);

-- ============================================================
-- EMAIL VERIFICATION TOKENS
-- One-time tokens for email address verification
-- ============================================================
CREATE TABLE email_verification_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(64) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evtoken_token ON email_verification_tokens(token);
CREATE INDEX idx_evtoken_user ON email_verification_tokens(user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- Auto-update the updated_at timestamp on row changes
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER protected_pages_updated_at BEFORE UPDATE ON protected_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER links_updated_at BEFORE UPDATE ON links FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER accessories_updated_at BEFORE UPDATE ON accessories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER showcase_items_updated_at BEFORE UPDATE ON showcase_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER contact_fields_updated_at BEFORE UPDATE ON contact_fields FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER pods_updated_at BEFORE UPDATE ON pods FOR EACH ROW EXECUTE FUNCTION update_updated_at();
