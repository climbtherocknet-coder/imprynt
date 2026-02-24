-- 046: Link button size and shape settings
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS link_size  VARCHAR(10) NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS link_shape VARCHAR(10) NOT NULL DEFAULT 'pill';

ALTER TABLE protected_pages
  ADD COLUMN IF NOT EXISTS link_size  VARCHAR(10) NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS link_shape VARCHAR(10) NOT NULL DEFAULT 'pill';
