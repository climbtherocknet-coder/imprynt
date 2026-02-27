-- Imprynt Platform — Database Schema
-- Generated from live database: February 26, 2026
-- This file is used for fresh Docker environment setup.
-- For incremental changes, use numbered migration files in db/migrations/
--
-- 28 tables (sessions and verification_tokens dropped in migration 052)

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accessories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accessories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    product_type character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    size character varying(10),
    color character varying(30),
    programmed_url character varying(500),
    shipping_name character varying(200),
    shipping_address_line1 character varying(255),
    shipping_address_line2 character varying(255),
    shipping_city character varying(100),
    shipping_state character varying(50),
    shipping_zip character varying(20),
    shipping_country character varying(2) DEFAULT 'US'::character varying,
    tracking_number character varying(100),
    stripe_payment_intent_id character varying(255),
    shipped_at timestamp with time zone,
    delivered_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT accessories_product_type_check CHECK (((product_type)::text = ANY (ARRAY[('ring'::character varying)::text, ('band'::character varying)::text, ('tip'::character varying)::text]))),
    CONSTRAINT accessories_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('programmed'::character varying)::text, ('shipped'::character varying)::text, ('delivered'::character varying)::text, ('returned'::character varying)::text])))
);


--
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    event_type character varying(30) NOT NULL,
    referral_source character varying(30),
    link_id uuid,
    ip_hash character varying(64),
    user_agent character varying(500),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT analytics_events_event_type_check CHECK (((event_type)::text = ANY (ARRAY[('page_view'::character varying)::text, ('link_click'::character varying)::text, ('vcard_download'::character varying)::text, ('pin_attempt'::character varying)::text, ('pin_success'::character varying)::text, ('nfc_tap'::character varying)::text])))
);


--
-- Name: cc_changelog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cc_changelog (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(200) NOT NULL,
    body text,
    version character varying(20),
    entry_date date DEFAULT CURRENT_DATE NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    is_public boolean DEFAULT false NOT NULL,
    feature_ids uuid[] DEFAULT '{}'::uuid[],
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cc_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cc_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_type character varying(20) NOT NULL,
    parent_id uuid NOT NULL,
    body text NOT NULL,
    author_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cc_comments_parent_type_check CHECK (((parent_type)::text = ANY ((ARRAY['feature'::character varying, 'roadmap'::character varying, 'changelog'::character varying, 'doc'::character varying])::text[])))
);


--
-- Name: cc_docs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cc_docs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(200) NOT NULL,
    body text,
    doc_type character varying(30) DEFAULT 'note'::character varying NOT NULL,
    visibility character varying(20) DEFAULT 'admin'::character varying NOT NULL,
    is_pinned boolean DEFAULT false NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cc_docs_doc_type_check CHECK (((doc_type)::text = ANY ((ARRAY['design_spec'::character varying, 'marketing'::character varying, 'decision'::character varying, 'note'::character varying, 'meeting'::character varying, 'strategy'::character varying])::text[]))),
    CONSTRAINT cc_docs_visibility_check CHECK (((visibility)::text = ANY ((ARRAY['admin'::character varying, 'advisory'::character varying, 'all'::character varying])::text[])))
);


--
-- Name: cc_features; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cc_features (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    category character varying(50) DEFAULT 'platform'::character varying NOT NULL,
    status character varying(20) DEFAULT 'planned'::character varying NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    release_phase character varying(20),
    shipped_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cc_features_release_phase_check CHECK (((release_phase)::text = ANY ((ARRAY['v1'::character varying, 'v1.5'::character varying, 'v2'::character varying, 'future'::character varying])::text[]))),
    CONSTRAINT cc_features_status_check CHECK (((status)::text = ANY ((ARRAY['shipped'::character varying, 'in_progress'::character varying, 'planned'::character varying, 'exploring'::character varying, 'cut'::character varying])::text[])))
);


--
-- Name: cc_roadmap; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cc_roadmap (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    phase character varying(20) DEFAULT 'later'::character varying NOT NULL,
    category character varying(50),
    priority integer DEFAULT 0 NOT NULL,
    feature_id uuid,
    target_date date,
    completed_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cc_roadmap_phase_check CHECK (((phase)::text = ANY ((ARRAY['now'::character varying, 'next'::character varying, 'later'::character varying, 'done'::character varying, 'icebox'::character varying])::text[])))
);


--
-- Name: cc_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cc_votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_type character varying(20) NOT NULL,
    parent_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cc_votes_parent_type_check CHECK (((parent_type)::text = ANY ((ARRAY['feature'::character varying, 'roadmap'::character varying])::text[])))
);


--
-- Name: connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.connections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    viewer_user_id uuid,
    connection_type character varying(30) NOT NULL,
    ip_hash character varying(64),
    viewer_email character varying(255),
    viewer_name character varying(200),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT connections_connection_type_check CHECK (((connection_type)::text = ANY (ARRAY[('page_view'::character varying)::text, ('pin_success'::character varying)::text, ('vcard_download'::character varying)::text, ('impressed'::character varying)::text, ('shared'::character varying)::text])))
);


--
-- Name: contact_fields; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_fields (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    field_type character varying(30) NOT NULL,
    field_value character varying(500) NOT NULL,
    show_business boolean DEFAULT true NOT NULL,
    show_personal boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    custom_label character varying(100),
    CONSTRAINT contact_fields_field_type_check CHECK (((field_type)::text = ANY (ARRAY['phone_cell'::text, 'phone_work'::text, 'phone_personal'::text, 'email_work'::text, 'email_personal'::text, 'address_work'::text, 'address_home'::text, 'birthday'::text, 'pronouns'::text, 'name_suffix'::text, 'company'::text, 'custom'::text])))
);


--
-- Name: contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_user_id uuid NOT NULL,
    connected_user_id uuid,
    first_name character varying(100),
    last_name character varying(100),
    email character varying(255),
    phone character varying(50),
    company character varying(100),
    title character varying(100),
    notes text,
    source character varying(30),
    met_at character varying(200),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT contacts_source_check CHECK (((source)::text = ANY (ARRAY[('nfc_tap'::character varying)::text, ('manual'::character varying)::text, ('card_scan'::character varying)::text, ('import'::character varying)::text])))
);


--
-- Name: email_verification_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_verification_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token character varying(64) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    email character varying(255),
    message text NOT NULL,
    page_url character varying(500),
    reported_profile_id uuid,
    feedback_type character varying(20) DEFAULT 'feedback'::character varying NOT NULL,
    status character varying(20) DEFAULT 'new'::character varying NOT NULL,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT feedback_feedback_type_check CHECK (((feedback_type)::text = ANY (ARRAY[('feedback'::character varying)::text, ('report'::character varying)::text]))),
    CONSTRAINT feedback_status_check CHECK (((status)::text = ANY (ARRAY[('new'::character varying)::text, ('reviewed'::character varying)::text, ('bug'::character varying)::text, ('improvement'::character varying)::text, ('report'::character varying)::text, ('closed'::character varying)::text])))
);


--
-- Name: hardware_waitlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hardware_waitlist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    product character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: image_gallery; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_gallery (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category character varying(50) NOT NULL,
    url character varying(500) NOT NULL,
    thumbnail_url character varying(500),
    label character varying(100),
    tags character varying(200),
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: invite_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invite_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(20) NOT NULL,
    created_by character varying(255) NOT NULL,
    max_uses integer DEFAULT 1,
    use_count integer DEFAULT 0 NOT NULL,
    expires_at timestamp with time zone,
    note character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    granted_plan character varying(20) DEFAULT 'free'::character varying NOT NULL
);


--
-- Name: links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    link_type character varying(30) NOT NULL,
    label character varying(100),
    url character varying(500) NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    show_business boolean DEFAULT true NOT NULL,
    show_personal boolean DEFAULT false NOT NULL,
    show_showcase boolean DEFAULT false NOT NULL,
    button_color character varying(7),
    CONSTRAINT links_link_type_check CHECK (((link_type)::text = ANY (ARRAY[('linkedin'::character varying)::text, ('website'::character varying)::text, ('email'::character varying)::text, ('phone'::character varying)::text, ('booking'::character varying)::text, ('instagram'::character varying)::text, ('twitter'::character varying)::text, ('facebook'::character varying)::text, ('github'::character varying)::text, ('tiktok'::character varying)::text, ('youtube'::character varying)::text, ('custom'::character varying)::text, ('vcard'::character varying)::text, ('spotify'::character varying)::text])))
);


--
-- Name: password_resets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_resets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pin_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pin_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    ip_hash character varying(64) NOT NULL,
    attempted_at timestamp with time zone DEFAULT now() NOT NULL,
    success boolean DEFAULT false NOT NULL
);


--
-- Name: pods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid,
    protected_page_id uuid,
    pod_type character varying(20) NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    label character varying(50),
    title character varying(200),
    body text,
    image_url character varying(500),
    stats jsonb,
    cta_label character varying(100),
    cta_url character varying(500),
    tags character varying(500),
    image_position character varying(10) DEFAULT 'left'::character varying NOT NULL,
    show_on_profile boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    listing_status character varying(20) DEFAULT 'active'::character varying,
    listing_price character varying(50),
    listing_details jsonb,
    source_domain character varying(100),
    auto_remove_at timestamp with time zone,
    sold_at timestamp with time zone,
    event_start text,
    event_end text,
    event_venue character varying(200),
    event_address character varying(300),
    event_status character varying(20) DEFAULT 'upcoming'::character varying,
    event_auto_hide boolean DEFAULT true NOT NULL,
    audio_url character varying(500),
    audio_duration integer,
    event_timezone character varying(50),
    CONSTRAINT pod_belongs_to_one CHECK ((((profile_id IS NOT NULL) AND (protected_page_id IS NULL)) OR ((profile_id IS NULL) AND (protected_page_id IS NOT NULL)))),
    CONSTRAINT pods_event_status_check CHECK (((event_status)::text = ANY ((ARRAY['upcoming'::character varying, 'cancelled'::character varying, 'postponed'::character varying, 'sold_out'::character varying])::text[]))),
    CONSTRAINT pods_listing_status_check CHECK (((listing_status)::text = ANY ((ARRAY['active'::character varying, 'pending'::character varying, 'sold'::character varying, 'off_market'::character varying, 'rented'::character varying, 'leased'::character varying, 'open_house'::character varying])::text[]))),
    CONSTRAINT pods_pod_type_check CHECK (((pod_type)::text = ANY ((ARRAY['text'::character varying, 'text_image'::character varying, 'stats'::character varying, 'cta'::character varying, 'link_preview'::character varying, 'project'::character varying, 'listing'::character varying, 'event'::character varying, 'music'::character varying])::text[])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    slug character varying(20) NOT NULL,
    redirect_id character varying(20) NOT NULL,
    title character varying(100),
    company character varying(100),
    tagline character varying(100),
    bio_heading character varying(100),
    bio character varying(1000),
    photo_url character varying(500),
    template character varying(50) DEFAULT 'clean'::character varying NOT NULL,
    primary_color character varying(7) DEFAULT '#000000'::character varying,
    accent_color character varying(7) DEFAULT NULL::character varying,
    font_pair character varying(50) DEFAULT 'default'::character varying,
    is_published boolean DEFAULT false NOT NULL,
    status_tags text[] DEFAULT '{}'::text[],
    slug_rotated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    allow_sharing boolean DEFAULT true NOT NULL,
    allow_feedback boolean DEFAULT true NOT NULL,
    status_tag_color character varying(7),
    photo_shape character varying(20) DEFAULT 'circle'::character varying NOT NULL,
    photo_radius integer,
    photo_size character varying(10) DEFAULT 'medium'::character varying NOT NULL,
    photo_position_x integer DEFAULT 50 NOT NULL,
    photo_position_y integer DEFAULT 50 NOT NULL,
    photo_animation character varying(20) DEFAULT 'none'::character varying NOT NULL,
    vcard_pin_hash text,
    link_display character varying(20) DEFAULT 'default'::character varying NOT NULL,
    show_qr_button boolean DEFAULT false NOT NULL,
    custom_theme jsonb,
    cover_url character varying(500),
    cover_style character varying(20) DEFAULT 'none'::character varying NOT NULL,
    cover_opacity smallint DEFAULT 30 NOT NULL,
    cover_position_y integer DEFAULT 50 NOT NULL,
    bg_image_url character varying(500),
    bg_image_opacity smallint DEFAULT 20 NOT NULL,
    bg_image_position_y integer DEFAULT 50 NOT NULL,
    photo_position smallint,
    photo_align character varying(10) DEFAULT 'left'::character varying,
    photo_zoom smallint DEFAULT 100 NOT NULL,
    cover_position_x integer DEFAULT 50 NOT NULL,
    cover_zoom smallint DEFAULT 100 NOT NULL,
    bg_image_position_x integer DEFAULT 50 NOT NULL,
    bg_image_zoom smallint DEFAULT 100 NOT NULL,
    link_size character varying(10) DEFAULT 'medium'::character varying NOT NULL,
    link_shape character varying(10) DEFAULT 'pill'::character varying NOT NULL,
    link_button_color character varying(7),
    save_button_style character varying(20) DEFAULT 'auto'::character varying,
    save_button_color character varying(9),
    CONSTRAINT profiles_bg_image_opacity_check CHECK (((bg_image_opacity >= 5) AND (bg_image_opacity <= 100))),
    CONSTRAINT profiles_bg_image_position_y_check CHECK (((bg_image_position_y >= 0) AND (bg_image_position_y <= 100))),
    CONSTRAINT profiles_cover_opacity_check CHECK (((cover_opacity >= 10) AND (cover_opacity <= 100))),
    CONSTRAINT profiles_cover_position_y_check CHECK (((cover_position_y >= 0) AND (cover_position_y <= 100))),
    CONSTRAINT profiles_cover_style_check CHECK (((cover_style)::text = ANY (ARRAY[('none'::character varying)::text, ('banner'::character varying)::text, ('fullpage'::character varying)::text]))),
    CONSTRAINT profiles_photo_align_check CHECK (((photo_align)::text = ANY (ARRAY[('left'::character varying)::text, ('center'::character varying)::text, ('right'::character varying)::text]))),
    CONSTRAINT profiles_photo_position_check CHECK (((photo_position >= 0) AND (photo_position <= 100)))
);


--
-- Name: protected_pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.protected_pages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    page_title character varying(100) NOT NULL,
    visibility_mode character varying(10) NOT NULL,
    pin_hash character varying(255) NOT NULL,
    bio_text character varying(500),
    button_label character varying(50),
    resume_url character varying(500),
    icon_color character varying(20),
    icon_opacity numeric(3,2) DEFAULT 0.35,
    icon_corner character varying(20) DEFAULT 'bottom-right'::character varying,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    pin_version integer DEFAULT 1 NOT NULL,
    allow_remember boolean DEFAULT true NOT NULL,
    show_resume boolean DEFAULT true NOT NULL,
    photo_url character varying(500),
    photo_shape character varying(20) DEFAULT 'circle'::character varying NOT NULL,
    photo_radius integer,
    photo_size character varying(10) DEFAULT 'medium'::character varying NOT NULL,
    photo_position_x integer DEFAULT 50 NOT NULL,
    photo_position_y integer DEFAULT 50 NOT NULL,
    photo_animation character varying(20) DEFAULT 'none'::character varying NOT NULL,
    photo_align character varying(10) DEFAULT 'center'::character varying NOT NULL,
    cover_url character varying(500),
    cover_opacity smallint DEFAULT 30 NOT NULL,
    cover_position_y integer DEFAULT 50 NOT NULL,
    bg_image_url character varying(500),
    bg_image_opacity smallint DEFAULT 20 NOT NULL,
    bg_image_position_y integer DEFAULT 50 NOT NULL,
    photo_zoom smallint DEFAULT 100 NOT NULL,
    cover_position_x integer DEFAULT 50 NOT NULL,
    cover_zoom smallint DEFAULT 100 NOT NULL,
    bg_image_position_x integer DEFAULT 50 NOT NULL,
    bg_image_zoom smallint DEFAULT 100 NOT NULL,
    link_size character varying(10) DEFAULT 'medium'::character varying NOT NULL,
    link_shape character varying(10) DEFAULT 'pill'::character varying NOT NULL,
    CONSTRAINT protected_pages_visibility_mode_check CHECK (((visibility_mode)::text = ANY (ARRAY[('hidden'::character varying)::text, ('visible'::character varying)::text])))
);


--
-- Name: score_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.score_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    source_user_id uuid,
    event_type character varying(30) NOT NULL,
    points integer NOT NULL,
    ip_hash character varying(64),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT score_events_event_type_check CHECK (((event_type)::text = ANY (ARRAY[('page_view'::character varying)::text, ('vcard_download'::character varying)::text, ('impression_unlock'::character varying)::text, ('share'::character varying)::text, ('link_click'::character varying)::text])))
);


--
-- Name: showcase_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.showcase_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    protected_page_id uuid NOT NULL,
    title character varying(200) NOT NULL,
    description character varying(1000),
    image_url character varying(500),
    link_url character varying(500),
    tags character varying(200),
    item_date date,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_scores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    score_total integer DEFAULT 0 NOT NULL,
    score_30d integer DEFAULT 0 NOT NULL,
    last_computed_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    email_verified timestamp with time zone,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    plan character varying(20) DEFAULT 'free'::character varying NOT NULL,
    stripe_customer_id character varying(255),
    stripe_subscription_id character varying(255),
    setup_completed boolean DEFAULT false NOT NULL,
    invite_code_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    account_status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    password_changed_at timestamp with time zone,
    leaderboard_opt_in boolean DEFAULT false NOT NULL,
    leaderboard_name character varying(20),
    leaderboard_color character varying(7) DEFAULT '#e8a849'::character varying,
    trial_started_at timestamp with time zone,
    trial_ends_at timestamp with time zone,
    is_demo boolean DEFAULT false NOT NULL,
    setup_step smallint DEFAULT 1 NOT NULL,
    CONSTRAINT users_account_status_check CHECK (((account_status)::text = ANY (ARRAY[('active'::character varying)::text, ('suspended'::character varying)::text]))),
    CONSTRAINT users_plan_check CHECK (((plan)::text = ANY (ARRAY[('free'::character varying)::text, ('premium_monthly'::character varying)::text, ('premium_annual'::character varying)::text, ('advisory'::character varying)::text])))
);


--
-- Name: vcard_download_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vcard_download_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    token_hash character varying(64) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: waitlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.waitlist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    source character varying(50) DEFAULT 'waitlist_page'::character varying,
    invited boolean DEFAULT false NOT NULL,
    invited_at timestamp with time zone,
    invite_code_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: accessories accessories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessories
    ADD CONSTRAINT accessories_pkey PRIMARY KEY (id);


--
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- Name: cc_changelog cc_changelog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cc_changelog
    ADD CONSTRAINT cc_changelog_pkey PRIMARY KEY (id);


--
-- Name: cc_comments cc_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cc_comments
    ADD CONSTRAINT cc_comments_pkey PRIMARY KEY (id);


--
-- Name: cc_docs cc_docs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cc_docs
    ADD CONSTRAINT cc_docs_pkey PRIMARY KEY (id);


--
-- Name: cc_features cc_features_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cc_features
    ADD CONSTRAINT cc_features_pkey PRIMARY KEY (id);


--
-- Name: cc_roadmap cc_roadmap_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cc_roadmap
    ADD CONSTRAINT cc_roadmap_pkey PRIMARY KEY (id);


--
-- Name: cc_votes cc_votes_parent_type_parent_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cc_votes
    ADD CONSTRAINT cc_votes_parent_type_parent_id_user_id_key UNIQUE (parent_type, parent_id, user_id);


--
-- Name: cc_votes cc_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cc_votes
    ADD CONSTRAINT cc_votes_pkey PRIMARY KEY (id);


--
-- Name: connections connections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connections
    ADD CONSTRAINT connections_pkey PRIMARY KEY (id);


--
-- Name: contact_fields contact_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_fields
    ADD CONSTRAINT contact_fields_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: email_verification_tokens email_verification_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_pkey PRIMARY KEY (id);


--
-- Name: email_verification_tokens email_verification_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_token_key UNIQUE (token);


--
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);


--
-- Name: hardware_waitlist hardware_waitlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hardware_waitlist
    ADD CONSTRAINT hardware_waitlist_pkey PRIMARY KEY (id);


--
-- Name: hardware_waitlist hardware_waitlist_user_id_product_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hardware_waitlist
    ADD CONSTRAINT hardware_waitlist_user_id_product_key UNIQUE (user_id, product);


--
-- Name: image_gallery image_gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_gallery
    ADD CONSTRAINT image_gallery_pkey PRIMARY KEY (id);


--
-- Name: invite_codes invite_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_codes
    ADD CONSTRAINT invite_codes_code_key UNIQUE (code);


--
-- Name: invite_codes invite_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_codes
    ADD CONSTRAINT invite_codes_pkey PRIMARY KEY (id);


--
-- Name: links links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.links
    ADD CONSTRAINT links_pkey PRIMARY KEY (id);


--
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


--
-- Name: pin_attempts pin_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pin_attempts
    ADD CONSTRAINT pin_attempts_pkey PRIMARY KEY (id);


--
-- Name: pods pods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pods
    ADD CONSTRAINT pods_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_redirect_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_redirect_id_key UNIQUE (redirect_id);


--
-- Name: profiles profiles_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_slug_key UNIQUE (slug);


--
-- Name: protected_pages protected_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.protected_pages
    ADD CONSTRAINT protected_pages_pkey PRIMARY KEY (id);


--
-- Name: score_events score_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.score_events
    ADD CONSTRAINT score_events_pkey PRIMARY KEY (id);


--
-- Name: showcase_items showcase_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.showcase_items
    ADD CONSTRAINT showcase_items_pkey PRIMARY KEY (id);


--
-- Name: profiles unique_user_profile; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT unique_user_profile UNIQUE (user_id);


--
-- Name: user_scores user_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_scores
    ADD CONSTRAINT user_scores_pkey PRIMARY KEY (id);


--
-- Name: user_scores user_scores_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_scores
    ADD CONSTRAINT user_scores_user_id_key UNIQUE (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vcard_download_tokens vcard_download_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vcard_download_tokens
    ADD CONSTRAINT vcard_download_tokens_pkey PRIMARY KEY (id);


--
-- Name: waitlist waitlist_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_email_key UNIQUE (email);


--
-- Name: waitlist waitlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_pkey PRIMARY KEY (id);


--
-- Name: idx_accessories_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_accessories_status ON public.accessories USING btree (status);


--
-- Name: idx_accessories_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_accessories_user ON public.accessories USING btree (user_id);


--
-- Name: idx_analytics_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_created ON public.analytics_events USING btree (created_at);


--
-- Name: idx_analytics_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_profile ON public.analytics_events USING btree (profile_id);


--
-- Name: idx_analytics_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_type ON public.analytics_events USING btree (event_type);


--
-- Name: idx_cc_changelog_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cc_changelog_date ON public.cc_changelog USING btree (entry_date DESC);


--
-- Name: idx_cc_comments_author; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cc_comments_author ON public.cc_comments USING btree (author_id);


--
-- Name: idx_cc_comments_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cc_comments_parent ON public.cc_comments USING btree (parent_type, parent_id);


--
-- Name: idx_cc_docs_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cc_docs_type ON public.cc_docs USING btree (doc_type);


--
-- Name: idx_cc_docs_visibility; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cc_docs_visibility ON public.cc_docs USING btree (visibility);


--
-- Name: idx_cc_features_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cc_features_category ON public.cc_features USING btree (category);


--
-- Name: idx_cc_features_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cc_features_status ON public.cc_features USING btree (status);


--
-- Name: idx_cc_roadmap_phase; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cc_roadmap_phase ON public.cc_roadmap USING btree (phase);


--
-- Name: idx_cc_votes_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cc_votes_parent ON public.cc_votes USING btree (parent_type, parent_id);


--
-- Name: idx_cc_votes_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cc_votes_user ON public.cc_votes USING btree (user_id);


--
-- Name: idx_connections_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_connections_created ON public.connections USING btree (created_at);


--
-- Name: idx_connections_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_connections_profile ON public.connections USING btree (profile_id);


--
-- Name: idx_connections_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_connections_type ON public.connections USING btree (connection_type);


--
-- Name: idx_connections_viewer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_connections_viewer ON public.connections USING btree (viewer_user_id);


--
-- Name: idx_contact_fields_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_fields_user ON public.contact_fields USING btree (user_id);


--
-- Name: idx_contacts_connected; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contacts_connected ON public.contacts USING btree (connected_user_id);


--
-- Name: idx_contacts_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contacts_owner ON public.contacts USING btree (owner_user_id);


--
-- Name: idx_evtoken_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_evtoken_token ON public.email_verification_tokens USING btree (token);


--
-- Name: idx_evtoken_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_evtoken_user ON public.email_verification_tokens USING btree (user_id);


--
-- Name: idx_feedback_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feedback_created ON public.feedback USING btree (created_at);


--
-- Name: idx_feedback_reported; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feedback_reported ON public.feedback USING btree (reported_profile_id);


--
-- Name: idx_feedback_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feedback_status ON public.feedback USING btree (status);


--
-- Name: idx_feedback_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feedback_type ON public.feedback USING btree (feedback_type);


--
-- Name: idx_feedback_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feedback_user ON public.feedback USING btree (user_id);


--
-- Name: idx_hardware_waitlist_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hardware_waitlist_product ON public.hardware_waitlist USING btree (product);


--
-- Name: idx_image_gallery_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_image_gallery_category ON public.image_gallery USING btree (category);


--
-- Name: idx_invite_codes_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invite_codes_code ON public.invite_codes USING btree (code);


--
-- Name: idx_links_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_links_profile ON public.links USING btree (profile_id);


--
-- Name: idx_links_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_links_user ON public.links USING btree (user_id);


--
-- Name: idx_password_resets_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_password_resets_token ON public.password_resets USING btree (token_hash);


--
-- Name: idx_password_resets_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_password_resets_user ON public.password_resets USING btree (user_id);


--
-- Name: idx_pin_attempts_profile_ip; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pin_attempts_profile_ip ON public.pin_attempts USING btree (profile_id, ip_hash);


--
-- Name: idx_pin_attempts_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pin_attempts_time ON public.pin_attempts USING btree (attempted_at);


--
-- Name: idx_pods_auto_remove; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pods_auto_remove ON public.pods USING btree (auto_remove_at) WHERE (auto_remove_at IS NOT NULL);


--
-- Name: idx_pods_event_start; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pods_event_start ON public.pods USING btree (event_start) WHERE ((pod_type)::text = 'event'::text);


--
-- Name: idx_pods_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pods_order ON public.pods USING btree (profile_id, display_order);


--
-- Name: idx_pods_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pods_profile ON public.pods USING btree (profile_id);


--
-- Name: idx_pods_protected_page; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pods_protected_page ON public.pods USING btree (protected_page_id);


--
-- Name: idx_profiles_redirect; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_redirect ON public.profiles USING btree (redirect_id);


--
-- Name: idx_profiles_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_slug ON public.profiles USING btree (slug);


--
-- Name: idx_profiles_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_user ON public.profiles USING btree (user_id);


--
-- Name: idx_protected_pages_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_protected_pages_profile ON public.protected_pages USING btree (profile_id);


--
-- Name: idx_protected_pages_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_protected_pages_user ON public.protected_pages USING btree (user_id);


--
-- Name: idx_score_events_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_score_events_created ON public.score_events USING btree (created_at);


--
-- Name: idx_score_events_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_score_events_profile ON public.score_events USING btree (profile_id);


--
-- Name: idx_showcase_items_page; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_showcase_items_page ON public.showcase_items USING btree (protected_page_id);


--
-- Name: idx_user_scores_30d; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_scores_30d ON public.user_scores USING btree (score_30d DESC);


--
-- Name: idx_user_scores_total; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_scores_total ON public.user_scores USING btree (score_total DESC);


--
-- Name: idx_users_account_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_account_status ON public.users USING btree (account_status);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_is_demo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_is_demo ON public.users USING btree (is_demo) WHERE (is_demo = true);


--
-- Name: idx_users_stripe_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_stripe_customer ON public.users USING btree (stripe_customer_id);


--
-- Name: idx_vcard_tokens_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vcard_tokens_hash ON public.vcard_download_tokens USING btree (token_hash);


--
-- Name: idx_vcard_tokens_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vcard_tokens_profile ON public.vcard_download_tokens USING btree (profile_id);


--
-- Name: idx_waitlist_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_waitlist_email ON public.waitlist USING btree (email);


--
-- Name: idx_waitlist_invited; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_waitlist_invited ON public.waitlist USING btree (invited);


--
-- Name: unique_user_standard_field; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_user_standard_field ON public.contact_fields USING btree (user_id, field_type) WHERE ((field_type)::text <> 'custom'::text);


--
-- Name: accessories accessories_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER accessories_updated_at BEFORE UPDATE ON public.accessories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: cc_changelog cc_changelog_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER cc_changelog_updated_at BEFORE UPDATE ON public.cc_changelog FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: cc_comments cc_comments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER cc_comments_updated_at BEFORE UPDATE ON public.cc_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: cc_docs cc_docs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER cc_docs_updated_at BEFORE UPDATE ON public.cc_docs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: cc_features cc_features_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER cc_features_updated_at BEFORE UPDATE ON public.cc_features FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: cc_roadmap cc_roadmap_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER cc_roadmap_updated_at BEFORE UPDATE ON public.cc_roadmap FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: contact_fields contact_fields_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER contact_fields_updated_at BEFORE UPDATE ON public.contact_fields FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: contacts contacts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: feedback feedback_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER feedback_updated_at BEFORE UPDATE ON public.feedback FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: links links_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER links_updated_at BEFORE UPDATE ON public.links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: pods pods_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER pods_updated_at BEFORE UPDATE ON public.pods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: profiles profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: protected_pages protected_pages_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER protected_pages_updated_at BEFORE UPDATE ON public.protected_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: showcase_items showcase_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER showcase_items_updated_at BEFORE UPDATE ON public.showcase_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: user_scores user_scores_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER user_scores_updated_at BEFORE UPDATE ON public.user_scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: users users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: accessories accessories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessories
    ADD CONSTRAINT accessories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: analytics_events analytics_events_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_link_id_fkey FOREIGN KEY (link_id) REFERENCES public.links(id) ON DELETE SET NULL;


--
-- Name: analytics_events analytics_events_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: cc_changelog cc_changelog_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cc_changelog
    ADD CONSTRAINT cc_changelog_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: cc_comments cc_comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cc_comments
    ADD CONSTRAINT cc_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cc_docs cc_docs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cc_docs
    ADD CONSTRAINT cc_docs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: cc_features cc_features_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cc_features
    ADD CONSTRAINT cc_features_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: cc_roadmap cc_roadmap_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cc_roadmap
    ADD CONSTRAINT cc_roadmap_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: cc_roadmap cc_roadmap_feature_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cc_roadmap
    ADD CONSTRAINT cc_roadmap_feature_id_fkey FOREIGN KEY (feature_id) REFERENCES public.cc_features(id) ON DELETE SET NULL;


--
-- Name: cc_votes cc_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cc_votes
    ADD CONSTRAINT cc_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: connections connections_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connections
    ADD CONSTRAINT connections_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: connections connections_viewer_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connections
    ADD CONSTRAINT connections_viewer_user_id_fkey FOREIGN KEY (viewer_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: contact_fields contact_fields_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_fields
    ADD CONSTRAINT contact_fields_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: contacts contacts_connected_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_connected_user_id_fkey FOREIGN KEY (connected_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: contacts contacts_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: email_verification_tokens email_verification_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: feedback feedback_reported_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_reported_profile_id_fkey FOREIGN KEY (reported_profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: feedback feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: users fk_users_invite_code; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_invite_code FOREIGN KEY (invite_code_id) REFERENCES public.invite_codes(id) ON DELETE SET NULL;


--
-- Name: hardware_waitlist hardware_waitlist_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hardware_waitlist
    ADD CONSTRAINT hardware_waitlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: links links_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.links
    ADD CONSTRAINT links_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: links links_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.links
    ADD CONSTRAINT links_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: password_resets password_resets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: pin_attempts pin_attempts_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pin_attempts
    ADD CONSTRAINT pin_attempts_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: pods pods_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pods
    ADD CONSTRAINT pods_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: pods pods_protected_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pods
    ADD CONSTRAINT pods_protected_page_id_fkey FOREIGN KEY (protected_page_id) REFERENCES public.protected_pages(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: protected_pages protected_pages_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.protected_pages
    ADD CONSTRAINT protected_pages_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: protected_pages protected_pages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.protected_pages
    ADD CONSTRAINT protected_pages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: score_events score_events_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.score_events
    ADD CONSTRAINT score_events_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: score_events score_events_source_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.score_events
    ADD CONSTRAINT score_events_source_user_id_fkey FOREIGN KEY (source_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: showcase_items showcase_items_protected_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.showcase_items
    ADD CONSTRAINT showcase_items_protected_page_id_fkey FOREIGN KEY (protected_page_id) REFERENCES public.protected_pages(id) ON DELETE CASCADE;


--
-- Name: user_scores user_scores_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_scores
    ADD CONSTRAINT user_scores_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: vcard_download_tokens vcard_download_tokens_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vcard_download_tokens
    ADD CONSTRAINT vcard_download_tokens_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: waitlist waitlist_invite_code_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_invite_code_id_fkey FOREIGN KEY (invite_code_id) REFERENCES public.invite_codes(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

