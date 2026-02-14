'use client';

import { useState, useRef } from 'react';

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
  initialColor?: string | null;
}

export default function StatusTagPicker({ initialTags, initialColor }: StatusTagPickerProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [saving, setSaving] = useState(false);
  const [color, setColor] = useState(initialColor || '#22c55e');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

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

  function handleColorChange(val: string) {
    setColor(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section: 'statusTagColor', statusTagColor: val }),
        });
      } catch { /* silent */ }
    }, 400);
  }

  return (
    <div>
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

      {/* Color picker — only show when tags are selected */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
          <label
            style={{
              position: 'relative',
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: '2px solid #283042',
              overflow: 'hidden',
              cursor: 'pointer',
              flexShrink: 0,
              backgroundColor: color,
            }}
          >
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorChange(e.target.value)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '150%',
                height: '150%',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                opacity: 0,
              }}
            />
          </label>
          <span style={{ fontSize: '0.75rem', color: '#5d6370' }}>
            Badge accent color
          </span>
        </div>
      )}
    </div>
  );
}
