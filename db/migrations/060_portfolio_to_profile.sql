-- Migration 060: Migrate portfolio (visible) protected page content to main profile
-- Part of v0.12.0 portfolio simplification

-- 6a: Move active portfolio pods to main profile (append after existing pods)
WITH portfolio_pods AS (
  SELECT p.id AS pod_id, pp.profile_id,
    (SELECT COALESCE(MAX(p2.display_order), 0) FROM pods p2 WHERE p2.profile_id = pp.profile_id AND p2.protected_page_id IS NULL) AS max_order,
    ROW_NUMBER() OVER (PARTITION BY pp.profile_id ORDER BY p.display_order) AS rn
  FROM pods p
  JOIN protected_pages pp ON p.protected_page_id = pp.id
  WHERE pp.visibility_mode = 'visible'
  AND p.is_active = true
)
UPDATE pods
SET profile_id = portfolio_pods.profile_id,
    protected_page_id = NULL,
    show_on_profile = false
FROM portfolio_pods
WHERE pods.id = portfolio_pods.pod_id;

-- 6b: Make portfolio links visible on main profile
UPDATE links
SET show_business = true
WHERE show_showcase = true AND show_business = false AND is_active = true;

-- 6c: Convert portfolio resume URLs to links
INSERT INTO links (id, profile_id, link_type, label, url, display_order, show_business, show_personal, show_showcase, is_active)
SELECT
  gen_random_uuid(),
  pp.profile_id,
  'resume',
  'Resume',
  pp.resume_url,
  (SELECT COALESCE(MAX(l.display_order), 0) + 1 FROM links l WHERE l.profile_id = pp.profile_id),
  true, false, false, true
FROM protected_pages pp
WHERE pp.visibility_mode = 'visible'
AND pp.resume_url IS NOT NULL AND pp.resume_url != ''
AND pp.show_resume = true;

-- 6d: Soft-delete portfolio pages
UPDATE protected_pages SET is_active = false WHERE visibility_mode = 'visible';
