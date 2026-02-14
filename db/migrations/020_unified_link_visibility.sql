-- Migration 020: Unified link visibility model
-- Consolidates profile/impression links into one model with visibility toggles
-- All links now belong to a profile with show_business/show_personal/show_showcase flags

-- ============================================================
-- STEP 1: Add visibility columns with safe defaults
-- ============================================================
ALTER TABLE links ADD COLUMN IF NOT EXISTS show_business BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE links ADD COLUMN IF NOT EXISTS show_personal BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE links ADD COLUMN IF NOT EXISTS show_showcase BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- STEP 2: Migrate existing link visibility
-- ============================================================

-- Profile links: show_business = true (matches default)
UPDATE links
SET show_business = true, show_personal = false, show_showcase = false
WHERE profile_id IS NOT NULL AND protected_page_id IS NULL;

-- Impression links: show_personal = true
UPDATE links
SET show_business = false, show_personal = true, show_showcase = false
WHERE protected_page_id IS NOT NULL AND profile_id IS NULL;

-- ============================================================
-- STEP 3: Drop mutual exclusion constraint BEFORE reassigning
-- (constraint would block setting both profile_id and protected_page_id)
-- ============================================================
ALTER TABLE links DROP CONSTRAINT IF EXISTS link_belongs_to_one;

-- ============================================================
-- STEP 4: Reassign impression links to user's profile
-- protected_pages has profile_id FK we can use
-- ============================================================
UPDATE links l
SET profile_id = pp.profile_id
FROM protected_pages pp
WHERE l.protected_page_id = pp.id
  AND l.profile_id IS NULL;

-- ============================================================
-- STEP 5: Clear protected_page_id (no longer needed for links)
-- ============================================================
UPDATE links SET protected_page_id = NULL WHERE protected_page_id IS NOT NULL;

-- ============================================================
-- STEP 6: Make profile_id NOT NULL (all links belong to profile)
-- ============================================================
ALTER TABLE links ALTER COLUMN profile_id SET NOT NULL;

-- ============================================================
-- STEP 7: Drop protected_page_id column
-- ============================================================
ALTER TABLE links DROP COLUMN IF EXISTS protected_page_id;
DROP INDEX IF EXISTS idx_links_protected_page;
