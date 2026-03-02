-- Migration 062: Add 'resume' to links link_type CHECK constraint
ALTER TABLE links DROP CONSTRAINT IF EXISTS links_link_type_check;
ALTER TABLE links ADD CONSTRAINT links_link_type_check CHECK (link_type IN (
    'linkedin', 'website', 'email', 'phone', 'booking',
    'instagram', 'twitter', 'facebook', 'github',
    'tiktok', 'youtube', 'custom', 'vcard', 'spotify',
    'resume'
));
