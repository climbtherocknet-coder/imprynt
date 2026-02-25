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

const DARK_THEME = {
  theme: 'dark' as const,
  vars: {
    primaryColor: '#1e2535',
    primaryTextColor: '#eceef2',
    primaryBorderColor: '#283042',
    lineColor: '#5d6370',
    secondaryColor: '#161c28',
    tertiaryColor: '#0c1017',
  },
  bg: '#0c1017',
};

const LIGHT_THEME = {
  theme: 'default' as const,
  vars: {
    primaryColor: '#e8ecf1',
    primaryTextColor: '#1a1a2e',
    primaryBorderColor: '#c4cdd6',
    lineColor: '#6b7280',
    secondaryColor: '#f3f4f6',
    tertiaryColor: '#ffffff',
  },
  bg: '#ffffff',
};

function buildIframeHtml(svgHtml: string, bg: string) {
  return `<!DOCTYPE html>
<html><head><style>
  html, body { margin: 0; padding: 0; background: ${bg}; overflow: hidden; height: 100%; }
  #viewport { width: 100%; height: 100%; overflow: hidden; cursor: grab; }
  #viewport.dragging { cursor: grabbing; }
  #content { transform-origin: 0 0; padding: 2rem; display: inline-block; }
  svg { max-width: none; }
</style></head><body>
<div id="viewport"><div id="content">${svgHtml}</div></div>
<script>
(function() {
  var vp = document.getElementById('viewport');
  var ct = document.getElementById('content');
  var zoom = 0.45, panX = 0, panY = 0;
  var dragging = false, startX = 0, startY = 0, startPanX = 0, startPanY = 0;
  function apply() { ct.style.transform = 'translate('+panX+'px,'+panY+'px) scale('+zoom+')'; }
  apply();
  vp.addEventListener('wheel', function(e) {
    e.preventDefault();
    var rect = vp.getBoundingClientRect();
    var mx = e.clientX - rect.left, my = e.clientY - rect.top;
    var oldZoom = zoom;
    var delta = e.deltaY > 0 ? 0.85 : 1.18;
    zoom = Math.min(20, Math.max(0.05, zoom * delta));
    panX = mx - (mx - panX) * (zoom / oldZoom);
    panY = my - (my - panY) * (zoom / oldZoom);
    apply();
  }, { passive: false });
  vp.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return;
    dragging = true; startX = e.clientX; startY = e.clientY;
    startPanX = panX; startPanY = panY;
    vp.classList.add('dragging');
    e.preventDefault();
  });
  window.addEventListener('mousemove', function(e) {
    if (!dragging) return;
    panX = startPanX + (e.clientX - startX);
    panY = startPanY + (e.clientY - startY);
    apply();
  });
  window.addEventListener('mouseup', function() {
    dragging = false; vp.classList.remove('dragging');
  });
})();
</script>
</body></html>`;
}

export default function SchemaTab() {
  const hiddenRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [blobUrl, setBlobUrl] = useState('');
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [rendering, setRendering] = useState(false);
  const blobUrlRef = useRef('');

  useEffect(() => {
    setRendering(true);
    setError('');

    const t = isDark ? DARK_THEME : LIGHT_THEME;
    mermaid.initialize({
      startOnLoad: false,
      theme: t.theme,
      themeVariables: t.vars,
    });

    // Mermaid mutates the DOM node — we need a fresh one each render
    if (hiddenRef.current) {
      hiddenRef.current.removeAttribute('data-processed');
      hiddenRef.current.innerHTML = SCHEMA_MERMAID;

      mermaid.run({ nodes: [hiddenRef.current] })
        .then(() => {
          const svg = hiddenRef.current?.querySelector('svg');
          if (!svg) { setError('SVG not found after render'); setRendering(false); return; }
          const html = buildIframeHtml(svg.outerHTML, t.bg);
          if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
          const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
          blobUrlRef.current = url;
          setBlobUrl(url);
          setRendering(false);
        })
        .catch((err) => { setError(err?.message || 'Failed to render'); setRendering(false); });
    }

    return () => {
      if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = ''; }
    };
  }, [isDark]);

  const btnStyle: React.CSSProperties = {
    background: 'var(--surface, #161c28)',
    border: '1px solid var(--border, #283042)',
    borderRadius: '0.375rem',
    color: 'var(--text, #eceef2)',
    padding: '0.25rem 0.625rem',
    fontSize: '0.75rem',
    cursor: 'pointer',
    lineHeight: 1,
    height: '1.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
  };

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
            25 tables &middot; Last updated Feb 25, 2026 &middot; Scroll to zoom, drag to pan
          </p>
        </div>
        <button style={btnStyle} onClick={() => setIsDark(d => !d)} title="Toggle light/dark theme">
          <span style={{ fontSize: '0.875rem' }}>{isDark ? '\u2600' : '\u263E'}</span>
          {isDark ? 'Light' : 'Dark'}
        </button>
      </div>

      {error && (
        <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginBottom: '1rem' }}>{error}</p>
      )}

      {/* Hidden container for mermaid to render into */}
      <div ref={hiddenRef} className="mermaid" style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }}>
        {SCHEMA_MERMAID}
      </div>

      {/* Iframe displays the rendered SVG with zoom/pan */}
      <iframe
        ref={iframeRef}
        src={blobUrl || undefined}
        title="Database Schema ERD"
        style={{
          width: '100%',
          height: '75vh',
          border: '1px solid var(--border, #1e2535)',
          borderRadius: '0.75rem',
          background: isDark ? '#0c1017' : '#ffffff',
          display: blobUrl && !rendering ? 'block' : 'none',
        }}
      />

      {(rendering || (!blobUrl && !error)) && (
        <div style={{
          height: '75vh',
          border: '1px solid var(--border, #1e2535)',
          borderRadius: '0.75rem',
          background: isDark ? '#0c1017' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem',
        }}>
          Rendering diagram...
        </div>
      )}
    </div>
  );
}
