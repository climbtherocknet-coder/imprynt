-- 053: Change event datetime columns from TIMESTAMPTZ to TEXT
-- Stores raw datetime-local strings (e.g. "2026-03-14T20:00") without timezone conversion.
-- The event_timezone column remains for future display use (e.g. showing "MST" label).

ALTER TABLE pods ALTER COLUMN event_start TYPE TEXT USING event_start::TEXT;
ALTER TABLE pods ALTER COLUMN event_end TYPE TEXT USING event_end::TEXT;

DROP INDEX IF EXISTS idx_pods_event_start;
CREATE INDEX IF NOT EXISTS idx_pods_event_start ON pods(event_start) WHERE pod_type = 'event';
