# Imprynt Platform — Audit Results

**Generated:** 2026-02-26
**Source:** PostgreSQL (imprynt-db) + codebase scan
**Purpose:** Read-only context export for Claude.ai

---

## 1. All Features with Status

| name | category | status | release_phase | priority | shipped |
|------|----------|--------|---------------|----------|---------|
| Mobile App | platform | exploring | v2 | 35 | |
| Custom Domains | platform | exploring | v2 | 36 | |
| Team/Enterprise Plans | platform | exploring | v2 | 37 | |
| API Access | integrations | exploring | v2 | 38 | |
| Editor Polish | ux | in_progress | v1 | 24 | |
| Testimonial Pods | content_blocks | planned | v1.5 | 25 | |
| Video Embed Pods | content_blocks | planned | v1.5 | 26 | |
| AI-Assisted Onboarding | platform | planned | v1.5 | 27 | |
| Dashboard Banners | marketing | planned | v1.5 | 28 | |
| Email Communications | marketing | planned | v1.5 | 29 | |
| Enhanced Analytics | analytics | planned | v1.5 | 30 | |
| Token-Based Links | security | planned | v1.5 | 31 | |
| Free Tier Branding | platform | planned | v1.5 | 32 | |
| Contact Rolodex / CRM | platform | planned | v2 | 33 | |
| LinkedIn Import | integrations | planned | v2 | 34 | |
| Onboarding Wizard v3 | platform | shipped | v1 | 0 | 2026-02-25 |
| Schema ERD Tab | admin | shipped | v1 | 0 | 2026-02-25 |
| Hardware Waitlist | platform | shipped | v1 | 0 | 2026-02-25 |
| User Registration & Auth | auth | shipped | v1 | 1 | |
| Profile Pages | platform | shipped | v1 | 2 | |
| Protected Pages | platform | shipped | v1 | 3 | |
| Template System | templates | shipped | v1 | 4 | |
| Content Blocks (Pods) | content_blocks | shipped | v1 | 5 | |
| Listing Pods | content_blocks | shipped | v1 | 6 | |
| Event Pods | content_blocks | shipped | v1 | 7 | |
| Music Pods | content_blocks | shipped | v1 | 8 | |
| Dashboard | ux | shipped | v1 | 9 | |
| Page Editor | ux | shipped | v1 | 10 | |
| Analytics | analytics | shipped | v1 | 11 | |
| Stripe Payments | payments | shipped | v1 | 12 | |
| NFC Redirect System | platform | shipped | v1 | 13 | |
| Photo System | ux | shipped | v1 | 14 | |
| Custom Themes | templates | shipped | v1 | 15 | |
| Gallery Backgrounds | templates | shipped | v1 | 16 | |
| Link Customization | ux | shipped | v1 | 17 | |
| Demo Profiles | marketing | shipped | v1 | 18 | |
| Invite System | platform | shipped | v1 | 19 | |
| Command Center | platform | shipped | v1 | 20 | |
| Feedback System | platform | shipped | v1 | 21 | |
| Connections | platform | shipped | v1 | 22 | |
| Free Trial | payments | shipped | v1 | 23 | |

---

## 2. Roadmap Items

| title | phase | category | priority | completed | target_date |
|-------|-------|----------|----------|-----------|-------------|
| Onboarding wizard v3 | done | platform | 0 | 2026-02-25 | |
| Editor floating buttons | done | ux | 1 | 2026-02-25 | |
| Link color inheritance | done | ux | 2 | 2026-02-25 | |
| Music pod production deploy | done | content_blocks | 3 | 2026-02-25 | |
| Cover photo Y-position fix | done | ux | 4 | 2026-02-25 | |
| Listing pods | done | content_blocks | 16 | | |
| Event pods | done | content_blocks | 17 | | |
| Music pods | done | content_blocks | 18 | | |
| Dashboard redesign | done | ux | 19 | | |
| Photo system overhaul | done | ux | 20 | | |
| Custom themes | done | templates | 21 | | |
| Command Center Phase 1 | done | platform | 22 | | |
| Protected pages redesign | done | ux | 23 | | |
| Contact Rolodex | icebox | platform | 24 | | |
| Business card scanner | icebox | platform | 25 | | |
| Free tier branding banner | later | platform | 10 | | |
| Recovery email improvements | later | auth | 11 | | |
| Waitlist modal | later | marketing | 12 | | |
| AI onboarding | later | platform | 13 | | |
| Impryntables LED prototypes | later | hardware | 14 | | |
| Alternative NFC form factors | later | hardware | 15 | | |
| Testimonial pods | next | content_blocks | 5 | | |
| Video embed pods | next | content_blocks | 6 | | |
| Dashboard banners system | next | marketing | 7 | | |
| Animated explainer video | next | marketing | 8 | | |
| Template light/dark variants | next | templates | 9 | | |

---

## 3. Changelog Entries (Last 30)

| title | version | entry_date | tags | is_public |
|-------|---------|------------|------|-----------|
| Onboarding Wizard v3 | 0.9.5 | 2026-02-25 | {wizard,refactor,onboarding,mobile} | t |
| Editor Save Buttons + Link Consistency | 0.9.3 | 2026-02-24 | {shipped,fix,editor} | t |
| Event Pods | 0.9.2 | 2026-02-24 | {content_blocks,events} | t |
| Listing Pods | 0.9.1 | 2026-02-23 | {content_blocks,real_estate} | t |
| Dashboard Redesign | 0.9.0 | 2026-02-23 | {ux,dashboard} | t |
| Photo Alignment Rewrite | 0.8.5 | 2026-02-22 | {ux,photos} | t |
| Protected Pages Redesign | 0.8.4 | 2026-02-22 | {ux,protected_pages} | t |
| Custom Themes + Cover Photos | 0.8.3 | 2026-02-22 | {templates,customization} | t |
| 10 Templates | 0.8.0 | 2026-02-20 | {templates} | t |
| Demo Profiles | 0.7.5 | 2026-02-20 | {marketing,demos} | t |
| Unified Link System | 0.7.0 | 2026-02-14 | {platform,links} | t |
| Hetzner Production Deploy | 0.6.0 | 2026-02-13 | {infrastructure,deployment} | t |
| Auth + Stripe Integration | 0.5.0 | 2026-02-13 | {auth,payments} | t |
| MVP Foundation | 0.1.0 | 2026-02-11 | {platform,foundation} | t |

---

## 4. Schema Summary — All Tables and Column Counts

| table_name | column_count |
|------------|-------------|
| accessories | 20 |
| analytics_events | 8 |
| cc_changelog | 11 |
| cc_comments | 7 |
| cc_docs | 10 |
| cc_features | 11 |
| cc_roadmap | 12 |
| cc_votes | 5 |
| connections | 9 |
| contact_fields | 10 |
| contacts | 14 |
| email_verification_tokens | 5 |
| feedback | 11 |
| hardware_waitlist | 4 |
| image_gallery | 9 |
| invite_codes | 9 |
| links | 14 |
| password_resets | 5 |
| pin_attempts | 5 |
| pods | 33 |
| profiles | 49 |
| protected_pages | 40 |
| score_events | 7 |
| sessions | 4 |
| showcase_items | 12 |
| user_scores | 7 |
| users | 22 |
| vcard_download_tokens | 5 |
| verification_tokens | 3 |
| waitlist | 7 |

**Total: 30 tables**

---

## 5. Profiles Table Columns (49 columns)

| column_name | data_type | column_default |
|-------------|-----------|---------------|
| id | uuid | gen_random_uuid() |
| user_id | uuid | |
| slug | character varying | |
| redirect_id | character varying | |
| title | character varying | |
| company | character varying | |
| tagline | character varying | |
| bio_heading | character varying | |
| bio | character varying | |
| photo_url | character varying | |
| template | character varying | 'clean' |
| primary_color | character varying | '#000000' |
| accent_color | character varying | NULL |
| font_pair | character varying | 'default' |
| is_published | boolean | false |
| status_tags | ARRAY | '{}' |
| slug_rotated_at | timestamp with time zone | now() |
| created_at | timestamp with time zone | now() |
| updated_at | timestamp with time zone | now() |
| allow_sharing | boolean | true |
| allow_feedback | boolean | true |
| status_tag_color | character varying | |
| photo_shape | character varying | 'circle' |
| photo_radius | integer | |
| photo_size | character varying | 'medium' |
| photo_position_x | integer | 50 |
| photo_position_y | integer | 50 |
| photo_animation | character varying | 'none' |
| vcard_pin_hash | text | |
| link_display | character varying | 'default' |
| show_qr_button | boolean | false |
| custom_theme | jsonb | |
| cover_url | character varying | |
| cover_style | character varying | 'none' |
| cover_opacity | smallint | 30 |
| cover_position_y | integer | 50 |
| bg_image_url | character varying | |
| bg_image_opacity | smallint | 20 |
| bg_image_position_y | integer | 50 |
| photo_position | smallint | |
| photo_align | character varying | 'left' |
| photo_zoom | smallint | 100 |
| cover_position_x | integer | 50 |
| cover_zoom | smallint | 100 |
| bg_image_position_x | integer | 50 |
| bg_image_zoom | smallint | 100 |
| link_size | character varying | 'medium' |
| link_shape | character varying | 'pill' |
| link_button_color | character varying | |

---

## 6. Users Table Columns (22 columns)

| column_name | data_type | column_default |
|-------------|-----------|---------------|
| id | uuid | gen_random_uuid() |
| email | character varying | |
| email_verified | timestamp with time zone | |
| password_hash | character varying | |
| first_name | character varying | |
| last_name | character varying | |
| plan | character varying | 'free' |
| stripe_customer_id | character varying | |
| stripe_subscription_id | character varying | |
| setup_completed | boolean | false |
| invite_code_id | uuid | |
| created_at | timestamp with time zone | now() |
| updated_at | timestamp with time zone | now() |
| account_status | character varying | 'active' |
| password_changed_at | timestamp with time zone | |
| leaderboard_opt_in | boolean | false |
| leaderboard_name | character varying | |
| leaderboard_color | character varying | '#e8a849' |
| trial_started_at | timestamp with time zone | |
| trial_ends_at | timestamp with time zone | |
| is_demo | boolean | false |
| setup_step | smallint | 1 |

---

## 7. Pods Table Columns (33 columns)

| column_name | data_type | column_default |
|-------------|-----------|---------------|
| id | uuid | gen_random_uuid() |
| profile_id | uuid | |
| protected_page_id | uuid | |
| pod_type | character varying | |
| display_order | integer | 0 |
| label | character varying | |
| title | character varying | |
| body | text | |
| image_url | character varying | |
| stats | jsonb | |
| cta_label | character varying | |
| cta_url | character varying | |
| tags | character varying | |
| image_position | character varying | 'left' |
| show_on_profile | boolean | false |
| is_active | boolean | true |
| created_at | timestamp with time zone | now() |
| updated_at | timestamp with time zone | now() |
| listing_status | character varying | 'active' |
| listing_price | character varying | |
| listing_details | jsonb | |
| source_domain | character varying | |
| auto_remove_at | timestamp with time zone | |
| sold_at | timestamp with time zone | |
| event_start | timestamp with time zone | |
| event_end | timestamp with time zone | |
| event_venue | character varying | |
| event_address | character varying | |
| event_status | character varying | 'upcoming' |
| event_auto_hide | boolean | true |
| audio_url | character varying | |
| audio_duration | integer | |
| event_timezone | character varying | |

---

## 8. Protected Pages Table Columns (40 columns)

| column_name | data_type | column_default |
|-------------|-----------|---------------|
| id | uuid | gen_random_uuid() |
| user_id | uuid | |
| profile_id | uuid | |
| page_title | character varying | |
| visibility_mode | character varying | |
| pin_hash | character varying | |
| bio_text | character varying | |
| button_label | character varying | |
| resume_url | character varying | |
| icon_color | character varying | |
| icon_opacity | numeric | 0.35 |
| icon_corner | character varying | 'bottom-right' |
| display_order | integer | 0 |
| is_active | boolean | true |
| created_at | timestamp with time zone | now() |
| updated_at | timestamp with time zone | now() |
| pin_version | integer | 1 |
| allow_remember | boolean | true |
| show_resume | boolean | true |
| photo_url | character varying | |
| photo_shape | character varying | 'circle' |
| photo_radius | integer | |
| photo_size | character varying | 'medium' |
| photo_position_x | integer | 50 |
| photo_position_y | integer | 50 |
| photo_animation | character varying | 'none' |
| photo_align | character varying | 'center' |
| cover_url | character varying | |
| cover_opacity | smallint | 30 |
| cover_position_y | integer | 50 |
| bg_image_url | character varying | |
| bg_image_opacity | smallint | 20 |
| bg_image_position_y | integer | 50 |
| photo_zoom | smallint | 100 |
| cover_position_x | integer | 50 |
| cover_zoom | smallint | 100 |
| bg_image_position_x | integer | 50 |
| bg_image_zoom | smallint | 100 |
| link_size | character varying | 'medium' |
| link_shape | character varying | 'pill' |

---

## 9. Links Table Columns (14 columns)

| column_name | data_type | column_default |
|-------------|-----------|---------------|
| id | uuid | gen_random_uuid() |
| user_id | uuid | |
| profile_id | uuid | |
| link_type | character varying | |
| label | character varying | |
| url | character varying | |
| display_order | integer | 0 |
| is_active | boolean | true |
| created_at | timestamp with time zone | now() |
| updated_at | timestamp with time zone | now() |
| show_business | boolean | true |
| show_personal | boolean | false |
| show_showcase | boolean | false |
| button_color | character varying | |

---

## 10. Migrations

**`schema_migrations` table does not exist in the database.**

### Migration Files on Disk (51 files)

```
001_showcase_and_profile_fields.sql
002_password_resets.sql
003_contact_fields_and_vcard_tokens.sql
004_contact_fields_dual_toggle.sql
005_impression_icon_settings.sql
006_pods_and_template_mapping.sql
007_link_preview_pod.sql
008_status_tags.sql
009_pods_protected_pages.sql
010_pod_image_position.sql
011_invite_codes_and_waitlist.sql
012_account_status.sql
013_password_changed_at.sql
014_pin_session_cookies.sql
015_connections.sql
016_feedback_and_scores.sql
017_allow_feedback.sql
018_status_tag_color.sql
019_invite_granted_plan.sql
020_unified_link_visibility.sql
021_email_verification_tokens.sql
022_personal_photo.sql
023_photo_shape.sql
024_show_resume.sql
025_photo_settings.sql
026_advisory_plan.sql
027_vcard_pin.sql
028_free_trial.sql
029_link_display_mode.sql
030_accent_color_nullable.sql
031_qr_button.sql
032_custom_contact_field.sql
033_demo_flag.sql
034_migrate_company_contact_fields.sql
035_photo_position_lr.sql
036_custom_theme.sql
037_cover_photo.sql
038_bg_photo_and_center_align.sql
039_photo_position.sql
040_protected_page_appearance.sql
041_image_zoom_and_gallery.sql
042_listing_pod.sql
043_command_center.sql
047_link_button_colors.sql
048_music_pod.sql
049_setup_step.sql
050_hardware_waitlist.sql
051_event_timezone.sql
```

Note: Migrations 044-046 are missing from disk.

---

## 11. Row Counts

| table | count |
|-------|-------|
| users | 19 |
| profiles | 19 |
| pods | 26 |
| links | 95 |
| protected_pages | 12 |
| cc_features | 41 |
| cc_roadmap | 26 |
| cc_changelog | 14 |
| cc_docs | 6 |

---

## API Routes (2 levels deep)

```
src/app/api/
├── account/
│   ├── change-password/
│   ├── contact-fields/
│   ├── delete/
│   └── reset-test/
├── admin/
│   ├── analytics/
│   ├── cc/
│   ├── feedback/
│   ├── invite-codes/
│   ├── stats/
│   ├── users/
│   └── waitlist/
├── analytics/
│   └── link-click/
├── auth/
│   ├── [...nextauth]/
│   ├── resend-verification/
│   ├── reset-password/
│   ├── signout/
│   └── verify-email/
├── feedback/
├── gallery/
├── hardware-interest/
├── health/
├── links/
├── og-preview/
├── p-8k3x/
│   ├── analytics/
│   ├── feedback/
│   ├── invite-codes/
│   ├── stats/
│   ├── users/
│   └── waitlist/
├── pin/
│   ├── check/
│   ├── forget/
│   └── remember/
├── pods/
├── profile/
│   ├── [profileId]/
│   ├── publish/
│   ├── qr/
│   └── rotate-slug/
├── protected-pages/
│   ├── [pageId]/
│   └── pods/
├── register/
├── setup/
│   └── complete/
├── share/
├── showcase-items/
├── stripe/
│   ├── checkout/
│   ├── portal/
│   └── webhook/
├── trial/
├── upload/
│   ├── file/
│   └── photo/
├── vcard/
│   └── [profileId]/
└── waitlist/
```

---

## Dashboard Pages (2 levels deep)

```
src/app/dashboard/
├── page.tsx                    (main dashboard)
├── layout.tsx                  (dashboard layout)
├── CheckoutToast.tsx
├── DashboardOnAir.tsx
├── DashboardPreview.tsx
├── GreetingText.tsx
├── MyUrlsCard.tsx
├── SignOutButton.tsx
├── StatusTagPicker.tsx
├── VerificationBanner.tsx
├── account/
│   ├── AccountClient.tsx
│   └── page.tsx
├── admin/
│   └── page.tsx
├── analytics/
│   ├── AnalyticsClient.tsx
│   └── page.tsx
├── contact/
│   └── page.tsx
├── impression/
│   └── page.tsx
├── page-editor/
│   ├── EditorFloatingButtons.tsx
│   ├── PageEditor.tsx
│   ├── page.tsx
│   └── tabs/
├── profile/
│   └── page.tsx
├── setup/
│   ├── SetupWizard.tsx
│   ├── SetupWizardNew.tsx
│   └── page.tsx
└── showcase/
    └── page.tsx
```

---

## Components (2 levels deep)

```
src/components/
├── AnnouncementBanner.tsx
├── Breadcrumbs.tsx
├── FeedbackButton.tsx
├── HeroPhone.tsx
├── HeroPreviewButton.tsx
├── MobileNav.tsx
├── OnAirToggle.tsx
├── PasswordStrengthMeter.tsx
├── ReportButton.tsx
├── ThemeProvider.tsx
├── ThemeToggle.tsx
├── ToggleSwitch.tsx
├── WaitlistBanner.tsx
├── WaitlistCTA.tsx
├── WaitlistModal.tsx
├── admin/
│   ├── AdminCodesTab.tsx
│   ├── AdminFeedbackTab.tsx
│   ├── AdminTrafficTab.tsx
│   ├── AdminUsersTab.tsx
│   ├── AdminWaitlistTab.tsx
│   ├── CCChangelog.tsx
│   ├── CCDocs.tsx
│   ├── CCFeatures.tsx
│   ├── CCOverview.tsx
│   ├── CCRoadmap.tsx
│   ├── Comments.tsx
│   ├── SchemaTab.tsx
│   └── VoteButton.tsx
├── editor/
│   ├── ContactCardSection.tsx
│   ├── IdentitySection.tsx
│   ├── LinksSection.tsx
│   ├── TemplateSection.tsx
│   ├── VisualsSection.tsx
│   └── constants.ts
├── pods/
│   ├── PodEditor.tsx
│   ├── PodRenderer.tsx
│   └── RichTextEditor.tsx
├── templates/
│   ├── ExpandablePhoto.tsx
│   ├── ProfileTemplate.tsx
│   ├── ProtectedPagePreview.tsx
│   └── SaveContactButton.tsx
└── ui/
    ├── CollapsibleSection.tsx
    ├── GalleryPicker.tsx
    └── ImageCropper.tsx
```

---

## Lib Files

```
src/lib/
├── access.ts
├── admin.ts
├── auth.ts
├── color-presets.ts
├── db.ts
├── email-templates.ts
├── email.ts
├── listing-parser.ts
├── markdown.tsx
├── password-validation.ts
├── plan.ts
├── rate-limit.ts
├── scoring.ts
├── stripe.ts
└── themes.ts
```

---

## Styles

```
src/styles/
├── admin.css
├── auth.css
├── cc.css
├── dashboard.css
├── demo.css
├── error.css
├── landing.css
├── legal.css
├── profile.css
├── setup.css
└── theme.css
```

---

## Key Feature Checks

| Feature | Found? | Details |
|---------|--------|---------|
| **Slug rotation UI or API** | YES | API: `src/app/api/profile/rotate-slug/route.ts`. UI: `src/app/dashboard/MyUrlsCard.tsx` (rotateSlug function at line 84). DB column `slug_rotated_at` exists on profiles table. |
| **Link click tracking** | YES | API: `src/app/api/analytics/link-click/route.ts`. Client: `src/app/[slug]/LinkTracker.tsx`. Analytics display: `src/app/dashboard/analytics/AnalyticsClient.tsx`. Also tracked via `src/lib/scoring.ts`. |
| **FAQ page** | NO | No FAQ page found anywhere in `src/app/`. |
| **Icon-only link mode** | YES | `link_display` column on profiles supports `'icons'` mode. Editor UI: `src/components/editor/LinksSection.tsx` (line 177 — toggles between `'default'` and `'icons'` modes). `SaveContactButton` also supports `iconOnly` prop in `src/components/templates/SaveContactButton.tsx`. |
| **Resume/document upload** | YES | `resume_url` column exists on `protected_pages` table. `show_resume` boolean column also present. Upload API: `src/app/api/upload/file/`. Referenced in protected page editor (`PortfolioTab`), setup wizard, and `ProtectedPagePreview.tsx`. |
| **Setup wizard — active file** | `SetupWizard.tsx` | `src/app/dashboard/setup/page.tsx` imports `SetupWizard` (not `SetupWizardNew`). `SetupWizardNew.tsx` exists but is NOT the active import. |
| **On Air toggle** | YES | Component: `src/components/OnAirToggle.tsx`. Dashboard integration: `src/app/dashboard/DashboardOnAir.tsx` and `src/app/dashboard/page.tsx`. Backed by `is_published` boolean on profiles table. |
| **Free tier CTA on profiles** | PARTIAL | `ProfileTemplate.tsx` line 337 shows `"Powered by Imprynt"` watermark. No "Create your" CTA or `free-cta` class found — this is a branding watermark, not a sign-up CTA. |
| **Link preview manual fallback** | YES | `src/app/api/og-preview/route.ts` exists (OG metadata fetcher). `PodEditor.tsx` has `link_preview` pod type (line 57) with OG fetch at line 429. Manual fallback fields exist in the pod editor UI. |
| **Multiple protected pages UI** | NO | No "add another" or multiple page management UI found in `src/app/dashboard/impression/page.tsx`. The impression editor manages a single page per profile. However, the `protected_pages` table has a `display_order` column and the DB shows 12 protected pages across 19 profiles, suggesting the backend supports multiple pages but the UI does not expose this. |

---

## Summary Statistics

- **30 tables** in the public schema
- **51 migration files** on disk (044-046 missing)
- **41 features** tracked in Command Center (27 shipped, 1 in progress, 9 planned, 4 exploring)
- **26 roadmap items** (13 done, 5 next, 6 later, 2 icebox)
- **14 changelog entries** (versions 0.1.0 through 0.9.5)
- **19 users**, **19 profiles**, **26 pods**, **95 links**, **12 protected pages**
- **15 lib files**, **11 CSS files**, **46 components**
