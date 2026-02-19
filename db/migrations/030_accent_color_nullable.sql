-- Change default accent_color to NULL (= use template default)
ALTER TABLE profiles ALTER COLUMN accent_color SET DEFAULT NULL;

-- Clear the hardcoded blue default for users who never explicitly chose it
UPDATE profiles SET accent_color = NULL WHERE accent_color = '#3B82F6';
