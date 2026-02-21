'use client';

import { useState } from 'react';

export default function DashboardPreview({ slug }: { slug: string }) {
  const [show, setShow] = useState(false);

  return (
    <>
      <button
        className="dash-mobile-preview-btn"
        onClick={() => setShow(true)}
        aria-label="Preview profile"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
        Preview
      </button>

      {show && (
        <div className="mobile-preview-overlay" onClick={() => setShow(false)}>
          <div className="mobile-preview-container" onClick={e => e.stopPropagation()}>
            <div className="mobile-preview-header">
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>Preview</span>
              <button
                onClick={() => setShow(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer', padding: '0.25rem', lineHeight: 1 }}
              >✕</button>
            </div>
            <div className="mobile-preview-body">
              <iframe
                src={`/${slug}`}
                title="Live profile preview"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                style={{ width: '100%', height: '100%', border: 'none', minHeight: '80vh' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
