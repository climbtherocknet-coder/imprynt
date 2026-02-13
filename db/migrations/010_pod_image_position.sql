-- Add image_position column for text_image pods (left or right)
ALTER TABLE pods ADD COLUMN IF NOT EXISTS image_position VARCHAR(10) NOT NULL DEFAULT 'left';
