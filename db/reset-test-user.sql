-- Reset test user (test@imprynt.io)
-- Clears all profile data while keeping the account intact.
-- Usage: docker exec imprynt-db psql -U imprynt -d imprynt -f /docker-entrypoint-initdb.d/reset-test-user.sql
-- Or:    docker exec -i imprynt-db psql -U imprynt -d imprynt < db/reset-test-user.sql

BEGIN;

DO $$
DECLARE
  v_user_id  UUID;
  v_profile_id UUID;
BEGIN
  -- Look up the test user
  SELECT id INTO v_user_id FROM users WHERE email = 'test@imprynt.io';
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Test user test@imprynt.io not found';
  END IF;

  SELECT id INTO v_profile_id FROM profiles WHERE user_id = v_user_id;

  -- Clear all profile-related data
  -- (showcase_items cascade-deletes via protected_pages FK)
  DELETE FROM links WHERE user_id = v_user_id;
  DELETE FROM contact_fields WHERE user_id = v_user_id;
  DELETE FROM protected_pages WHERE user_id = v_user_id;
  DELETE FROM contacts WHERE owner_user_id = v_user_id;

  IF v_profile_id IS NOT NULL THEN
    DELETE FROM pods WHERE profile_id = v_profile_id;
    DELETE FROM analytics_events WHERE profile_id = v_profile_id;
    DELETE FROM pin_attempts WHERE profile_id = v_profile_id;
    DELETE FROM connections WHERE profile_id = v_profile_id;
    DELETE FROM vcard_download_tokens WHERE profile_id = v_profile_id;
  END IF;

  -- Reset profile to defaults (keep slug and redirect_id)
  UPDATE profiles SET
    title = NULL,
    company = NULL,
    tagline = NULL,
    bio_heading = NULL,
    bio = NULL,
    photo_url = NULL,
    template = 'clean',
    primary_color = '#000000',
    accent_color = NULL,
    font_pair = 'default',
    link_display = 'default',
    is_published = false,
    photo_shape = 'circle',
    photo_radius = NULL,
    photo_size = 'medium',
    photo_position_x = 50,
    photo_position_y = 50,
    photo_animation = 'none',
    photo_align = 'left',
    photo_zoom = 100,
    custom_theme = NULL,
    cover_url = NULL,
    cover_style = 'none',
    cover_opacity = 30,
    cover_position_x = 50,
    cover_position_y = 50,
    cover_zoom = 100,
    bg_image_url = NULL,
    bg_image_opacity = 20,
    bg_image_position_x = 50,
    bg_image_position_y = 50,
    bg_image_zoom = 100,
    status_tags = '{}',
    link_size = 'medium',
    link_shape = 'pill',
    link_button_color = NULL,
    updated_at = NOW()
  WHERE user_id = v_user_id;

  -- Reset user setup state (keep name, email, password, plan)
  UPDATE users SET
    first_name = NULL,
    last_name = NULL,
    setup_completed = false,
    setup_step = 1,
    updated_at = NOW()
  WHERE id = v_user_id;

  RAISE NOTICE 'Test user reset complete. User ID: %, Profile ID: %', v_user_id, v_profile_id;
END $$;

COMMIT;
