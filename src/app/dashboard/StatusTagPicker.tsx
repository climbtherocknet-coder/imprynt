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

const PRESET_SLUGS = STATUS_OPTIONS.map(o => o.slug);

interface StatusTagPickerProps {
  initialTags: string[];
  initialColor?: string | null;
  isPaid?: boolean;
  disabled?: boolean;
}

export default function StatusTagPicker({ initialTags, initialColor, isPaid, disabled }: StatusTagPickerProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [saving, setSaving] = useState(false);
  const [color, setColor] = useState(initialColor || '#22c55e');
  const [customInput, setCustomInput] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  async function saveTags(next: string[]) {
    setSaving(true);
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'statusTags', statusTags: next }),
      });
    } catch {
      setTags(tags);
    } finally {
      setSaving(false);
    }
  }

  async function toggleTag(slug: string) {
    const next = tags.includes(slug) ? tags.filter(t => t !== slug) : [...tags, slug];
    setTags(next);
    await saveTags(next);
  }

  async function addCustomTag() {
    const val = customInput.trim().slice(0, 30);
    if (!val || tags.includes(val)) return;
    const next = [...tags, val];
    setTags(next);
    setCustomInput('');
    await saveTags(next);
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

  // Separate custom tags from presets
  const customTags = tags.filter(t => !PRESET_SLUGS.includes(t));

  // Active tag style uses the chosen color
  const activeStyle = {
    borderColor: color,
    backgroundColor: `${color}1f`,
    color: color,
  };

  return (
    <div style={disabled ? { opacity: 0.4, pointerEvents: 'none' } : undefined}>
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
                ...(active
                  ? activeStyle
                  : { borderColor: 'var(--border-light, #283042)', backgroundColor: 'transparent', color: 'var(--text-muted, #5d6370)' }),
                cursor: saving ? 'wait' : 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {active ? '● ' : ''}{opt.label}
            </button>
          );
        })}

        {/* Custom tags */}
        {customTags.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            disabled={saving}
            style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              padding: '0.3rem 0.625rem',
              borderRadius: '9999px',
              border: '1px solid',
              ...activeStyle,
              cursor: saving ? 'wait' : 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            ● {tag} ✕
          </button>
        ))}
      </div>

      {/* Custom status input — paid only */}
      {isPaid && (
        <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.625rem' }}>
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
            placeholder="Custom status..."
            maxLength={30}
            style={{
              flex: 1,
              fontSize: '0.75rem',
              padding: '0.3rem 0.625rem',
              borderRadius: '9999px',
              border: '1px solid var(--border-light, #283042)',
              backgroundColor: 'var(--surface, #161c28)',
              color: 'var(--text, #eceef2)',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={addCustomTag}
            disabled={saving || !customInput.trim()}
            style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid var(--border-light, #283042)',
              backgroundColor: customInput.trim() ? `${color}1f` : 'transparent',
              color: customInput.trim() ? color : 'var(--text-muted, #5d6370)',
              cursor: !customInput.trim() || saving ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            + Add
          </button>
        </div>
      )}

      {/* Color picker — only show when tags are selected */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
          <label
            style={{
              position: 'relative',
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: '2px solid var(--border-light, #283042)',
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
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #5d6370)' }}>
            Badge color
          </span>
        </div>
      )}
    </div>
  );
}
