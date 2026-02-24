-- 049: Track setup wizard progress step
ALTER TABLE users ADD COLUMN IF NOT EXISTS setup_step SMALLINT NOT NULL DEFAULT 1;
