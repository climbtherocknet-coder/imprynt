-- Migration 065: Add youtube_channel and spotify_embed to pods_pod_type_check constraint
-- These two new pod types allow paid users to embed YouTube channel feeds and Spotify players.

ALTER TABLE pods DROP CONSTRAINT pods_pod_type_check;

ALTER TABLE pods ADD CONSTRAINT pods_pod_type_check CHECK (
  pod_type IN ('text', 'text_image', 'stats', 'cta', 'link_preview', 'project', 'listing', 'event', 'music', 'youtube_channel', 'spotify_embed')
);
