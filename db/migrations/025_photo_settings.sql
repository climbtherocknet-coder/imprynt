-- Photo size, position, and animation settings
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_size VARCHAR(10) NOT NULL DEFAULT 'medium';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_position_x INTEGER NOT NULL DEFAULT 50;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_position_y INTEGER NOT NULL DEFAULT 50;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_animation VARCHAR(20) NOT NULL DEFAULT 'none';
