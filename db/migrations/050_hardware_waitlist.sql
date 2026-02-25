-- 050: Hardware waitlist for NFC device interest tracking
CREATE TABLE IF NOT EXISTS hardware_waitlist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product     VARCHAR(50) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product)
);
CREATE INDEX IF NOT EXISTS idx_hardware_waitlist_product ON hardware_waitlist(product);
