-- Migration 055: Newsletter subscribers table
-- Stores email signups from the landing page footer

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  source VARCHAR(50) DEFAULT 'footer',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active) WHERE is_active = true;
