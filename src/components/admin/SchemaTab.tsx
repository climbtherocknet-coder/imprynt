'use client';
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

const SCHEMA_MERMAID = `
erDiagram
    users {
        uuid id PK
        varchar email UK
        timestamptz email_verified
        varchar password_hash
        varchar first_name
        varchar last_name
        varchar plan
        varchar stripe_customer_id
        varchar stripe_subscription_id
        boolean setup_completed
        smallint setup_step
        uuid invite_code_id FK
        timestamptz trial_started_at
        timestamptz trial_ends_at
        boolean leaderboard_opt_in
        varchar leaderboard_name
        varchar leaderboard_color
        timestamptz created_at
        timestamptz updated_at
    }

    profiles {
        uuid id PK
        uuid user_id FK
        varchar slug UK
        varchar redirect_id UK
        varchar title
        varchar company
        varchar tagline
        varchar bio
        varchar photo_url
        varchar template
        varchar accent_color
        varchar font_pair
        varchar link_display
        boolean is_published
        varchar photo_shape
        varchar photo_align
        jsonb custom_theme
        varchar cover_url
        smallint cover_opacity
        varchar bg_image_url
        smallint bg_image_opacity
        text_arr status_tags
        boolean allow_sharing
        boolean allow_feedback
        boolean show_qr_button
        timestamptz created_at
        timestamptz updated_at
    }

    protected_pages {
        uuid id PK
        uuid user_id FK
        uuid profile_id FK
        varchar page_title
        varchar visibility_mode
        varchar pin_hash
        varchar bio_text
        varchar button_label
        varchar resume_url
        varchar photo_url
        varchar cover_url
        varchar bg_image_url
        boolean is_active
        integer display_order
        timestamptz created_at
        timestamptz updated_at
    }

    links {
        uuid id PK
        uuid user_id FK
        uuid profile_id FK
        varchar link_type
        varchar label
        varchar url
        integer display_order
        boolean is_active
        boolean show_business
        boolean show_personal
        boolean show_showcase
        varchar button_color
        timestamptz created_at
        timestamptz updated_at
    }

    pods {
        uuid id PK
        uuid profile_id FK
        uuid protected_page_id FK
        varchar pod_type
        integer display_order
        varchar label
        varchar title
        text body
        varchar image_url
        jsonb stats
        varchar cta_label
        varchar cta_url
        varchar tags
        varchar listing_status
        varchar listing_price
        jsonb listing_details
        varchar event_status
        timestamptz event_start
        timestamptz event_end
        varchar event_venue
        varchar audio_url
        integer audio_duration
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    contact_fields {
        uuid id PK
        uuid user_id FK
        varchar field_type
        varchar field_value
        boolean show_business
        boolean show_personal
        integer display_order
    }

    analytics_events {
        uuid id PK
        uuid profile_id FK
        varchar event_type
        varchar referral_source
        uuid link_id FK
        varchar ip_hash
        timestamptz created_at
    }

    connections {
        uuid id PK
        uuid profile_id FK
        uuid viewer_user_id FK
        varchar connection_type
        varchar ip_hash
        varchar viewer_email
        jsonb metadata
        timestamptz created_at
    }

    contacts {
        uuid id PK
        uuid owner_user_id FK
        uuid connected_user_id FK
        varchar first_name
        varchar last_name
        varchar email
        varchar phone
        varchar company
        text notes
        varchar source
        timestamptz created_at
    }

    accessories {
        uuid id PK
        uuid user_id FK
        varchar product_type
        varchar status
        varchar size
        varchar programmed_url
        varchar tracking_number
        timestamptz shipped_at
        timestamptz created_at
    }

    showcase_items {
        uuid id PK
        uuid protected_page_id FK
        varchar title
        varchar description
        varchar image_url
        varchar link_url
        integer display_order
        boolean is_active
    }

    feedback {
        uuid id PK
        uuid user_id FK
        uuid reported_profile_id FK
        varchar feedback_type
        varchar status
        text message
        text admin_notes
        timestamptz created_at
    }

    score_events {
        uuid id PK
        uuid profile_id FK
        uuid source_user_id FK
        varchar event_type
        integer points
        timestamptz created_at
    }

    user_scores {
        uuid id PK
        uuid user_id FK
        integer score_total
        integer score_30d
        timestamptz last_computed_at
    }

    invite_codes {
        uuid id PK
        varchar code UK
        integer max_uses
        integer use_count
        timestamptz expires_at
    }

    waitlist {
        uuid id PK
        varchar email UK
        boolean invited
        uuid invite_code_id FK
    }

    image_gallery {
        uuid id PK
        varchar category
        varchar url
        varchar thumbnail_url
        varchar label
        varchar tags
        integer display_order
        boolean is_active
    }

    hardware_waitlist {
        uuid id PK
        uuid user_id FK
        varchar product
        timestamptz created_at
    }

    pin_attempts {
        uuid id PK
        uuid profile_id FK
        varchar ip_hash
        boolean success
        timestamptz attempted_at
    }

    sessions {
        uuid id PK
        varchar session_token UK
        uuid user_id FK
        timestamptz expires
    }

    cc_features {
        uuid id PK
        varchar name
        text description
        varchar category
        varchar status
        varchar release_phase
        integer priority
        uuid created_by FK
    }

    cc_roadmap {
        uuid id PK
        varchar title
        text description
        varchar phase
        varchar category
        uuid feature_id FK
        date target_date
        uuid created_by FK
    }

    cc_changelog {
        uuid id PK
        varchar title
        text body
        varchar version
        date entry_date
        text_arr tags
        boolean is_public
    }

    cc_docs {
        uuid id PK
        varchar title
        text body
        varchar doc_type
        varchar visibility
        boolean is_pinned
        text_arr tags
    }

    cc_comments {
        uuid id PK
        varchar parent_type
        uuid parent_id
        text body
        uuid author_id FK
    }

    cc_votes {
        uuid id PK
        varchar parent_type
        uuid parent_id
        uuid user_id FK
    }

    users ||--|| profiles : "has one"
    users ||--o{ protected_pages : "has many"
    users ||--o{ links : "has many"
    users ||--o{ contact_fields : "has many"
    users ||--o{ accessories : "has many"
    users ||--o{ contacts : "owns"
    users ||--o{ sessions : "has many"
    users ||--o{ hardware_waitlist : "interested in"
    users ||--o| user_scores : "has one"
    users }o--|| invite_codes : "used"

    profiles ||--o{ protected_pages : "has many"
    profiles ||--o{ links : "has many"
    profiles ||--o{ pods : "has many"
    profiles ||--o{ analytics_events : "tracked by"
    profiles ||--o{ connections : "has many"
    profiles ||--o{ pin_attempts : "has many"
    profiles ||--o{ score_events : "has many"

    protected_pages ||--o{ pods : "has many"
    protected_pages ||--o{ showcase_items : "has many"

    links ||--o{ analytics_events : "clicked"

    cc_features ||--o{ cc_roadmap : "linked to"
    users ||--o{ cc_comments : "authored"
    users ||--o{ cc_votes : "voted"
`;

export default function SchemaTab() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (rendered) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#1e2535',
        primaryTextColor: '#eceef2',
        primaryBorderColor: '#283042',
        lineColor: '#5d6370',
        secondaryColor: '#161c28',
        tertiaryColor: '#0c1017',
      },
    });

    if (containerRef.current) {
      mermaid.run({ nodes: [containerRef.current] })
        .then(() => setRendered(true))
        .catch((err) => setError(err?.message || 'Failed to render diagram'));
    }
  }, [rendered]);

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)' }}>
            Database Schema
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            25 tables &middot; Last updated Feb 25, 2026
          </p>
        </div>
      </div>

      {error && (
        <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginBottom: '1rem' }}>{error}</p>
      )}

      <div
        style={{
          background: 'var(--bg, #0c1017)',
          border: '1px solid var(--border, #1e2535)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          overflow: 'auto',
          maxHeight: '75vh',
        }}
      >
        <div ref={containerRef} className="mermaid">
          {SCHEMA_MERMAID}
        </div>
      </div>
    </div>
  );
}
