-- Migrate contact_fields.company → profiles.company, then remove redundant rows
--
-- Context: Company is now edited exclusively via profiles.company in the UI.
-- Any values previously stored in contact_fields.company take precedence
-- (vCard builder used contactFields.company || profile.company), so we
-- migrate differing values to profiles before deleting the contact_fields rows.

-- Step 1: Migrate any contact_fields company values to profiles.company
-- where they differ (preserves user intent, e.g. a contact_fields override)
UPDATE profiles p
SET company = cf.field_value,
    updated_at = NOW()
FROM contact_fields cf
WHERE cf.user_id = p.user_id
  AND cf.field_type = 'company'
  AND cf.field_value IS NOT NULL
  AND cf.field_value <> ''
  AND (p.company IS DISTINCT FROM cf.field_value);

-- Step 2: Remove all company rows from contact_fields
-- Company is now canonical in profiles.company only
DELETE FROM contact_fields WHERE field_type = 'company';
