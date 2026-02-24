'use client';

interface Props {
  isDirty: boolean;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  slug?: string;
}

export default function EditorFloatingButtons({ isDirty, saving, saved, onSave, slug }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      {/* Save button — only when dirty */}
      {isDirty && (
        <button
          onClick={onSave}
          disabled={saving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.625rem 1rem',
            borderRadius: '9999px',
            border: '1px solid var(--accent-border, rgba(232, 168, 73, 0.3))',
            background: 'var(--accent, #e8a849)',
            color: 'var(--bg, #0c1017)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            opacity: saving ? 0.7 : 1,
            transition: 'transform 0.15s, opacity 0.15s',
          }}
        >
          {saving ? (
            <span style={{ fontSize: '0.75rem' }}>Saving...</span>
          ) : saved ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              <span className="editor-float-label">Save</span>
            </>
          )}
        </button>
      )}

      {/* View Page button — always visible */}
      {slug && (
        <a
          href={`/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.625rem 1rem',
            borderRadius: '9999px',
            border: '1px solid var(--border-light, #283042)',
            background: 'var(--surface, #161c28)',
            color: 'var(--text-mid, #a8adb8)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            fontFamily: 'inherit',
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            transition: 'transform 0.15s, border-color 0.15s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="editor-float-label">View</span>
        </a>
      )}
    </div>
  );
}
