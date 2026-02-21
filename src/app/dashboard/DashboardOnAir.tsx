'use client';

import { useState } from 'react';
import OnAirToggle from '@/components/OnAirToggle';
import StatusTagPicker from './StatusTagPicker';

const STATUS_TAG_LABELS: Record<string, string> = {
  open_to_network: 'Open to Network',
  open_to_work: 'Open to Work',
  hiring: 'Hiring',
  open_to_collaborate: 'Open to Collaborate',
  consulting: 'Available for Consulting',
  mentoring: 'Open to Mentor',
};

interface Props {
  initialPublished: boolean;
  slug?: string;
  initialTags: string[];
  initialColor?: string | null;
  isPaid: boolean;
}

export default function DashboardOnAir({ initialPublished, slug, initialTags, initialColor, isPaid }: Props) {
  const [showEditor, setShowEditor] = useState(false);
  const [isPublished, setIsPublished] = useState(initialPublished);

  const tagColor = initialColor || '#22c55e';

  return (
    <div className="dash-card">
      <span className="dash-card-label">ON AIR</span>

      {/* On Air row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%',
            backgroundColor: isPublished ? '#22c55e' : 'var(--text-muted, #5d6370)',
            display: 'inline-block',
            flexShrink: 0,
            boxShadow: isPublished ? '0 0 6px rgba(34, 197, 94, 0.5)' : 'none',
            animation: isPublished ? 'onair-pulse 2s ease-in-out infinite' : 'none',
          }} />
          <span style={{
            fontSize: '1rem', fontWeight: 600,
            color: isPublished ? '#22c55e' : 'var(--text-muted, #5d6370)',
          }}>
            {isPublished ? 'On Air' : 'Off Air'}
          </span>
          <OnAirToggle initialPublished={isPublished} slug={slug} onToggle={setIsPublished} minimal />
        </div>
        {isPublished && slug && (
          <a href={`/${slug}`} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '0.8125rem', color: 'var(--accent, #e8a849)', textDecoration: 'none', fontWeight: 500 }}>
            View Page &rarr;
          </a>
        )}
      </div>

      {/* Status section */}
      {isPublished ? (
        <div>
          {initialTags.length > 0 && !showEditor ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.5rem' }}>
              {initialTags.map(tag => (
                <span key={tag} className="dash-status-pill" style={{ borderColor: tagColor }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: tagColor, flexShrink: 0 }} />
                  {STATUS_TAG_LABELS[tag] || tag}
                </span>
              ))}
            </div>
          ) : !showEditor ? (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>
              No status tags set.
            </p>
          ) : null}
          <button
            onClick={() => setShowEditor(!showEditor)}
            style={{
              fontSize: '0.75rem', color: 'var(--accent, #e8a849)', background: 'none',
              border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontWeight: 500,
            }}
          >
            {showEditor ? 'Done' : 'Edit status \u2192'}
          </button>
          {showEditor && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border, #1e2535)' }}>
              <StatusTagPicker initialTags={initialTags} initialColor={initialColor} isPaid={isPaid} />
            </div>
          )}
        </div>
      ) : (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', margin: 0 }}>
          Your page is not visible. Toggle On Air to go live.
        </p>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes onair-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
