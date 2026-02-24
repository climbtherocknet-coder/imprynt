-- Gallery seed — curated Unsplash images
-- Run: docker exec -i imprynt-db psql -U imprynt -d imprynt < db/seeds/gallery-seed.sql

TRUNCATE image_gallery CASCADE;

-- ── Cover Photos ──

-- Abstract (8)
INSERT INTO image_gallery (category, url, thumbnail_url, label, tags, display_order) VALUES
  ('cover', '/gallery/covers/cover-abstract-01.jpg', '/gallery/covers/thumb/cover-abstract-01.jpg', 'Warm gradient', 'abstract', 1),
  ('cover', '/gallery/covers/cover-abstract-02.jpg', '/gallery/covers/thumb/cover-abstract-02.jpg', 'Purple haze', 'abstract', 2),
  ('cover', '/gallery/covers/cover-abstract-03.jpg', '/gallery/covers/thumb/cover-abstract-03.jpg', 'Liquid color', 'abstract', 3),
  ('cover', '/gallery/covers/cover-abstract-04.jpg', '/gallery/covers/thumb/cover-abstract-04.jpg', 'Cool gradient', 'abstract', 4),
  ('cover', '/gallery/covers/cover-abstract-05.jpg', '/gallery/covers/thumb/cover-abstract-05.jpg', 'Blue waves', 'abstract', 5),
  ('cover', '/gallery/covers/cover-abstract-06.jpg', '/gallery/covers/thumb/cover-abstract-06.jpg', 'Dark geometry', 'abstract', 6),
  ('cover', '/gallery/covers/cover-abstract-07.jpg', '/gallery/covers/thumb/cover-abstract-07.jpg', 'Warm swirl', 'abstract', 7),
  ('cover', '/gallery/covers/cover-abstract-08.jpg', '/gallery/covers/thumb/cover-abstract-08.jpg', 'Color blobs', 'abstract', 8);

-- City (5)
INSERT INTO image_gallery (category, url, thumbnail_url, label, tags, display_order) VALUES
  ('cover', '/gallery/covers/cover-city-01.jpg', '/gallery/covers/thumb/cover-city-01.jpg', 'NYC skyline', 'city', 9),
  ('cover', '/gallery/covers/cover-city-02.jpg', '/gallery/covers/thumb/cover-city-02.jpg', 'City from above', 'city', 10),
  ('cover', '/gallery/covers/cover-city-03.jpg', '/gallery/covers/thumb/cover-city-03.jpg', 'City night', 'city', 11),
  ('cover', '/gallery/covers/cover-city-04.jpg', '/gallery/covers/thumb/cover-city-04.jpg', 'Downtown aerial', 'city', 12),
  ('cover', '/gallery/covers/cover-city-05.jpg', '/gallery/covers/thumb/cover-city-05.jpg', 'Urban architecture', 'city', 13);

-- Nature (5)
INSERT INTO image_gallery (category, url, thumbnail_url, label, tags, display_order) VALUES
  ('cover', '/gallery/covers/cover-nature-01.jpg', '/gallery/covers/thumb/cover-nature-01.jpg', 'Mountain lake', 'nature', 14),
  ('cover', '/gallery/covers/cover-nature-02.jpg', '/gallery/covers/thumb/cover-nature-02.jpg', 'Green valley', 'nature', 15),
  ('cover', '/gallery/covers/cover-nature-03.jpg', '/gallery/covers/thumb/cover-nature-03.jpg', 'Tropical beach', 'nature', 16),
  ('cover', '/gallery/covers/cover-nature-04.jpg', '/gallery/covers/thumb/cover-nature-04.jpg', 'Sunset ocean', 'nature', 17),
  ('cover', '/gallery/covers/cover-nature-05.jpg', '/gallery/covers/thumb/cover-nature-05.jpg', 'Forest trail', 'nature', 18);

-- Workspace (3)
INSERT INTO image_gallery (category, url, thumbnail_url, label, tags, display_order) VALUES
  ('cover', '/gallery/covers/cover-workspace-01.jpg', '/gallery/covers/thumb/cover-workspace-01.jpg', 'Minimal desk', 'workspace', 19),
  ('cover', '/gallery/covers/cover-workspace-02.jpg', '/gallery/covers/thumb/cover-workspace-02.jpg', 'Office space', 'workspace', 20),
  ('cover', '/gallery/covers/cover-workspace-03.jpg', '/gallery/covers/thumb/cover-workspace-03.jpg', 'Laptop setup', 'workspace', 21);

-- Dark (4)
INSERT INTO image_gallery (category, url, thumbnail_url, label, tags, display_order) VALUES
  ('cover', '/gallery/covers/cover-dark-01.jpg', '/gallery/covers/thumb/cover-dark-01.jpg', 'Dark clouds', 'dark', 22),
  ('cover', '/gallery/covers/cover-dark-02.jpg', '/gallery/covers/thumb/cover-dark-02.jpg', 'Dark abstract', 'dark', 23),
  ('cover', '/gallery/covers/cover-dark-03.jpg', '/gallery/covers/thumb/cover-dark-03.jpg', 'Moody dark', 'dark', 24),
  ('cover', '/gallery/covers/cover-dark-04.jpg', '/gallery/covers/thumb/cover-dark-04.jpg', 'Night sky', 'dark', 25);

-- ── Background Photos ──

-- Texture (5)
INSERT INTO image_gallery (category, url, thumbnail_url, label, tags, display_order) VALUES
  ('background', '/gallery/backgrounds/bg-texture-01.jpg', '/gallery/backgrounds/thumb/bg-texture-01.jpg', 'Paper grain', 'texture', 1),
  ('background', '/gallery/backgrounds/bg-texture-02.jpg', '/gallery/backgrounds/thumb/bg-texture-02.jpg', 'Concrete', 'texture', 2),
  ('background', '/gallery/backgrounds/bg-texture-03.jpg', '/gallery/backgrounds/thumb/bg-texture-03.jpg', 'Wood grain', 'texture', 3),
  ('background', '/gallery/backgrounds/bg-texture-04.jpg', '/gallery/backgrounds/thumb/bg-texture-04.jpg', 'Soft fabric', 'texture', 4),
  ('background', '/gallery/backgrounds/bg-texture-05.jpg', '/gallery/backgrounds/thumb/bg-texture-05.jpg', 'Marble', 'texture', 5);

-- Gradient (4)
INSERT INTO image_gallery (category, url, thumbnail_url, label, tags, display_order) VALUES
  ('background', '/gallery/backgrounds/bg-gradient-01.jpg', '/gallery/backgrounds/thumb/bg-gradient-01.jpg', 'Warm gradient', 'gradient', 6),
  ('background', '/gallery/backgrounds/bg-gradient-02.jpg', '/gallery/backgrounds/thumb/bg-gradient-02.jpg', 'Pink sunset', 'gradient', 7),
  ('background', '/gallery/backgrounds/bg-gradient-03.jpg', '/gallery/backgrounds/thumb/bg-gradient-03.jpg', 'Purple haze', 'gradient', 8),
  ('background', '/gallery/backgrounds/bg-gradient-04.jpg', '/gallery/backgrounds/thumb/bg-gradient-04.jpg', 'Cool blue', 'gradient', 9);

-- Pattern (3)
INSERT INTO image_gallery (category, url, thumbnail_url, label, tags, display_order) VALUES
  ('background', '/gallery/backgrounds/bg-pattern-01.jpg', '/gallery/backgrounds/thumb/bg-pattern-01.jpg', 'Geometric dark', 'pattern', 10),
  ('background', '/gallery/backgrounds/bg-pattern-02.jpg', '/gallery/backgrounds/thumb/bg-pattern-02.jpg', 'Minimal lines', 'pattern', 11),
  ('background', '/gallery/backgrounds/bg-pattern-03.jpg', '/gallery/backgrounds/thumb/bg-pattern-03.jpg', 'Abstract pattern', 'pattern', 12);

-- Atmospheric (3)
INSERT INTO image_gallery (category, url, thumbnail_url, label, tags, display_order) VALUES
  ('background', '/gallery/backgrounds/bg-atmospheric-01.jpg', '/gallery/backgrounds/thumb/bg-atmospheric-01.jpg', 'Bokeh lights', 'atmospheric', 13),
  ('background', '/gallery/backgrounds/bg-atmospheric-02.jpg', '/gallery/backgrounds/thumb/bg-atmospheric-02.jpg', 'Soft clouds', 'atmospheric', 14),
  ('background', '/gallery/backgrounds/bg-atmospheric-03.jpg', '/gallery/backgrounds/thumb/bg-atmospheric-03.jpg', 'Misty sky', 'atmospheric', 15);
