-- 054: Save Contact button styling options
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS save_button_style VARCHAR(20) DEFAULT 'auto'
    CHECK (save_button_style IN ('auto', 'accent', 'inverted', 'custom')),
  ADD COLUMN IF NOT EXISTS save_button_color VARCHAR(9);
