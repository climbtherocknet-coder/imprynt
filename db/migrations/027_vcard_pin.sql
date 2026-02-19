-- Add PIN protection for vCard (contact card) downloads
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vcard_pin_hash TEXT;
