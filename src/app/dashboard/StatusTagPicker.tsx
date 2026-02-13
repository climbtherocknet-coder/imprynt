'use client';

import { useState } from 'react';

const STATUS_OPTIONS = [
  { slug: 'open_to_network', label: 'Open to Network' },
  { slug: 'open_to_work', label: 'Open to Work' },
  { slug: 'hiring', label: 'Hiring' },
  { slug: 'open_to_collaborate', label: 'Open to Collaborate' },
  { slug: 'consulting', label: 'Available for Consulting' },
  { slug: 'mentoring', label: 'Open to Mentor' },
];

interface StatusTagPickerProps {
  initialTags: string[];
}

export default function StatusTagPicker({ initialTags }: StatusTagPickerProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [saving, setSaving] = useState(false);

  async function toggleTag(slug: string) {
    const next = tags.includes(slug) ? tags.filter(t => t !== slug) : [...tags, slug];
    setTags(next);
    setSaving(true);
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'statusTags', statusTags: next }),
      });
    } catch {
      // Revert on failure
      setTags(tags);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
      {STATUS_OPTIONS.map(opt => {
        const active = tags.includes(opt.slug);
        return (
          <button
            key={opt.slug}
            type="button"
            onClick={() => toggleTag(opt.slug)}
            disabled={saving}
            style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              padding: '0.3rem 0.625rem',
              borderRadius: '9999px',
              border: '1px solid',
              borderColor: active ? '#e8a849' : '#283042',
              backgroundColor: active ? 'rgba(232, 168, 73, 0.12)' : 'transparent',
              color: active ? '#e8a849' : '#5d6370',
              cursor: saving ? 'wait' : 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            {active ? '● ' : ''}{opt.label}
          </button>
        );
      })}
    </div>
  );
}
