-- Migration 004: Dual vCard toggles + new contact field types
-- Changes visibility from single enum to independent show_business/show_personal booleans
-- Adds: phone_personal, email_work, email_personal, company field types

-- Step 1: Add new columns
ALTER TABLE contact_fields ADD COLUMN IF NOT EXISTS show_business BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE contact_fields ADD COLUMN IF NOT EXISTS show_personal BOOLEAN NOT NULL DEFAULT true;

-- Step 2: Migrate existing visibility data
UPDATE contact_fields SET show_business = true, show_personal = false WHERE visibility = 'public';
UPDATE contact_fields SET show_business = false, show_personal = true WHERE visibility = 'personal';

-- Step 3: Drop old visibility column
ALTER TABLE contact_fields DROP COLUMN IF EXISTS visibility;

-- Step 4: Drop old CHECK constraint and add new one with expanded field types
ALTER TABLE contact_fields DROP CONSTRAINT IF EXISTS contact_fields_field_type_check;
ALTER TABLE contact_fields ADD CONSTRAINT contact_fields_field_type_check CHECK (field_type IN (
    'phone_cell', 'phone_work', 'phone_personal',
    'email_work', 'email_personal',
    'address_work', 'address_home',
    'birthday', 'pronouns', 'name_suffix', 'company'
));
