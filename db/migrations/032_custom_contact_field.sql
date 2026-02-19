-- Add custom_label column for user-defined contact field labels
ALTER TABLE contact_fields ADD COLUMN IF NOT EXISTS custom_label VARCHAR(100);

-- Expand field_type check constraint to include 'custom'
ALTER TABLE contact_fields DROP CONSTRAINT IF EXISTS contact_fields_field_type_check;
ALTER TABLE contact_fields ADD CONSTRAINT contact_fields_field_type_check
  CHECK (field_type = ANY (ARRAY[
    'phone_cell', 'phone_work', 'phone_personal',
    'email_work', 'email_personal',
    'address_work', 'address_home',
    'birthday', 'pronouns', 'name_suffix', 'company', 'custom'
  ]));

-- Drop the unique constraint that prevents multiple rows of the same type
ALTER TABLE contact_fields DROP CONSTRAINT IF EXISTS unique_user_field;

-- Create partial unique index for standard (non-custom) field types only
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_standard_field
  ON contact_fields (user_id, field_type)
  WHERE field_type != 'custom';
