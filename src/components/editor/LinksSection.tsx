'use client';

import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import { inputStyle, LINK_TYPES, type LinkItem } from './constants';

// ── Types ──────────────────────────────────────────────

export interface LinksState {
  links: LinkItem[];
  linkDisplay: string;
  linkSize: string;
  linkShape: string;
  linkButtonColor: string | null;
}

export interface LinksSectionProps {
  initial: LinksState;
  isPaid: boolean;
  accentColor: string;
  onChange: (state: LinksState) => void;
  onError: (msg: string) => void;
  showVisibilityToggles?: boolean;
}

export interface LinksSectionRef {
  save: () => Promise<void>;
  getState: () => LinksState;
}

// ── Component ──────────────────────────────────────────

const LinksSection = forwardRef<LinksSectionRef, LinksSectionProps>(
  ({ initial, isPaid, accentColor, onChange, onError, showVisibilityToggles = true }, ref) => {
    const [links, setLinks] = useState<LinkItem[]>(initial.links);
    const [linkDisplay, setLinkDisplay] = useState(initial.linkDisplay || 'default');
    const [linkSize, setLinkSize] = useState(initial.linkSize || 'medium');
    const [linkShape, setLinkShape] = useState(initial.linkShape || 'pill');
    const [linkButtonColor, setLinkButtonColor] = useState<string | null>(initial.linkButtonColor);

    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const getState = useCallback((): LinksState => ({
      links,
      linkDisplay,
      linkSize,
      linkShape,
      linkButtonColor,
    }), [links, linkDisplay, linkSize, linkShape, linkButtonColor]);

    // Notify parent of changes
    useEffect(() => {
      onChange(getState());
    }, [links, linkDisplay, linkSize, linkShape, linkButtonColor]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Link CRUD ────────────────────────────────────────

    async function addLink(linkType: string) {
      const typeDef = LINK_TYPES.find(t => t.type === linkType);
      try {
        const res = await fetch('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            linkType,
            label: typeDef?.label || '',
            url: '',
            showBusiness: true,
            showPersonal: false,
            showShowcase: false,
          }),
        });
        if (!res.ok) throw new Error('Failed to add link');
        const newLink = await res.json();
        setLinks(prev => [...prev, newLink]);
      } catch {
        onError('Failed to add link');
      }
    }

    function updateLink(id: string, field: string, value: string | boolean | null) {
      setLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
    }

    async function saveLinkUpdate(link: LinkItem) {
      if (!link.id) return;
      try {
        await fetch('/api/links', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: link.id,
            linkType: link.linkType,
            label: link.label,
            url: link.url,
            showBusiness: link.showBusiness,
            showPersonal: link.showPersonal,
            showShowcase: link.showShowcase,
            buttonColor: link.buttonColor ?? null,
          }),
        });
      } catch {
        onError('Failed to update link');
      }
    }

    async function deleteLink(id: string) {
      try {
        await fetch(`/api/links?id=${id}`, { method: 'DELETE' });
        setLinks(prev => prev.filter(l => l.id !== id));
      } catch {
        onError('Failed to delete link');
      }
    }

    // ── Drag and Drop ────────────────────────────────────

    function handleDragStart(index: number) {
      dragItem.current = index;
    }

    function handleDragEnter(index: number) {
      dragOverItem.current = index;
    }

    async function handleDragEnd() {
      if (dragItem.current === null || dragOverItem.current === null) return;
      if (dragItem.current === dragOverItem.current) return;
      const reordered = [...links];
      const [removed] = reordered.splice(dragItem.current, 1);
      reordered.splice(dragOverItem.current, 0, removed);
      const updated = reordered.map((l, i) => ({ ...l, displayOrder: i }));
      setLinks(updated);
      dragItem.current = null;
      dragOverItem.current = null;
      try {
        await fetch('/api/links', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reorder: true, links: updated.map(l => ({ id: l.id, displayOrder: l.displayOrder })) }),
        });
      } catch {
        onError('Failed to reorder');
      }
    }

    // ── Expose save + getState ───────────────────────────

    useImperativeHandle(ref, () => ({
      save: async () => {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section: 'profile',
            linkDisplay,
            linkSize,
            linkShape,
            linkButtonColor,
          }),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Failed to save');
        }
      },
      getState,
    }), [linkDisplay, linkSize, linkShape, linkButtonColor, getState]);

    // ── Render ───────────────────────────────────────────

    return (
      <>
        {/* Display mode toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #5d6370)', marginRight: '0.125rem' }}>Display:</span>
          {(['default', 'icons'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setLinkDisplay(mode)}
              style={{
                padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem',
                fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
                border: linkDisplay === mode ? '2px solid var(--accent, #e8a849)' : '1px solid var(--border-light, #283042)',
                backgroundColor: linkDisplay === mode ? 'rgba(232,168,73,0.1)' : 'var(--surface, #161c28)',
                color: linkDisplay === mode ? 'var(--accent, #e8a849)' : 'var(--text-mid, #a8adb8)',
                transition: 'all 0.15s',
              }}
            >
              {mode === 'default' ? 'Labels' : 'Icons only'}
            </button>
          ))}
        </div>

        {/* Size toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #5d6370)', marginRight: '0.125rem' }}>Size:</span>
          {(['small', 'medium', 'large'] as const).map(sz => (
            <button
              key={sz}
              onClick={() => setLinkSize(sz)}
              style={{
                padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem',
                fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
                border: linkSize === sz ? '2px solid var(--accent, #e8a849)' : '1px solid var(--border-light, #283042)',
                backgroundColor: linkSize === sz ? 'rgba(232,168,73,0.1)' : 'var(--surface, #161c28)',
                color: linkSize === sz ? 'var(--accent, #e8a849)' : 'var(--text-mid, #a8adb8)',
                transition: 'all 0.15s',
              }}
            >
              {sz.charAt(0).toUpperCase() + sz.slice(1)}
            </button>
          ))}
        </div>

        {/* Shape toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #5d6370)', marginRight: '0.125rem' }}>Shape:</span>
          {(['pill', 'rounded', 'square'] as const).map(sh => (
            <button
              key={sh}
              onClick={() => setLinkShape(sh)}
              style={{
                padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem',
                fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
                border: linkShape === sh ? '2px solid var(--accent, #e8a849)' : '1px solid var(--border-light, #283042)',
                backgroundColor: linkShape === sh ? 'rgba(232,168,73,0.1)' : 'var(--surface, #161c28)',
                color: linkShape === sh ? 'var(--accent, #e8a849)' : 'var(--text-mid, #a8adb8)',
                transition: 'all 0.15s',
              }}
            >
              {sh.charAt(0).toUpperCase() + sh.slice(1)}
            </button>
          ))}
        </div>

        {/* Global button color */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #5d6370)', marginRight: '0.125rem' }}>Button Color:</span>
          <input
            type="color"
            value={linkButtonColor || accentColor || '#e8a849'}
            onChange={e => setLinkButtonColor(e.target.value)}
            style={{ width: 28, height: 28, border: 'none', borderRadius: '50%', cursor: 'pointer', padding: 0, backgroundColor: 'transparent' }}
          />
          {linkButtonColor && (
            <button
              onClick={() => setLinkButtonColor(null)}
              style={{
                padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.625rem',
                fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
                border: '1px solid var(--border-light, #283042)',
                backgroundColor: 'var(--surface, #161c28)',
                color: 'var(--text-muted, #5d6370)',
              }}
            >
              Reset to accent
            </button>
          )}
        </div>

        {/* Description */}
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', marginBottom: '1rem', marginTop: '0.25rem' }}>
          Your social links, contact info, and web presence. Drag to reorder. Toggle visibility for your Business, Personal, and Portfolio pages.
        </p>

        {/* Link cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {links.map((link, i) => (
            <div
              key={link.id || i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragEnter={() => handleDragEnter(i)}
              onDragEnd={handleDragEnd}
              onDragOver={e => e.preventDefault()}
              style={{
                backgroundColor: 'var(--bg, #0c1017)',
                border: '1px solid var(--border, #1e2535)',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                cursor: 'grab',
              }}
            >
              {/* Row 1: drag handle, type, label, URL, delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--border-light, #283042)', fontSize: '1rem', cursor: 'grab', userSelect: 'none', lineHeight: 1 }}>
                  ⋮⋮
                </span>

                <select
                  value={link.linkType}
                  onChange={e => {
                    const newType = e.target.value;
                    const typeDef = LINK_TYPES.find(t => t.type === newType);
                    updateLink(link.id!, 'linkType', newType);
                    if (typeDef) updateLink(link.id!, 'label', typeDef.label);
                  }}
                  style={{
                    padding: '0.375rem 0.5rem',
                    border: '1px solid var(--border-light, #283042)',
                    borderRadius: '0.375rem',
                    fontSize: '0.8125rem',
                    fontFamily: 'inherit',
                    backgroundColor: 'var(--surface, #161c28)',
                    color: 'var(--text, #eceef2)',
                    width: 110,
                    flexShrink: 0,
                  }}
                >
                  {LINK_TYPES.map(lt => (
                    <option key={lt.type} value={lt.type}>{lt.icon} {lt.label}</option>
                  ))}
                </select>

                <input
                  type="text"
                  value={link.label}
                  onChange={e => updateLink(link.id!, 'label', e.target.value)}
                  onBlur={() => saveLinkUpdate(link)}
                  placeholder="Label"
                  style={{ ...inputStyle, flex: '0 0 90px', padding: '0.375rem 0.5rem', fontSize: '0.8125rem' }}
                />

                <input
                  type="text"
                  value={link.url}
                  onChange={e => updateLink(link.id!, 'url', e.target.value)}
                  onBlur={() => saveLinkUpdate(link)}
                  placeholder={LINK_TYPES.find(t => t.type === link.linkType)?.placeholder || 'https://...'}
                  style={{ ...inputStyle, flex: 1, padding: '0.375rem 0.5rem', fontSize: '0.8125rem' }}
                />

                <button
                  onClick={() => link.id && deleteLink(link.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted, #5d6370)',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    padding: '0.25rem',
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                  title="Remove link"
                >
                  ×
                </button>
              </div>

              {/* Row 2: visibility toggle pills + per-link color */}
              {showVisibilityToggles !== false && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', paddingLeft: '1.5rem' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #5d6370)', marginRight: '0.25rem' }}>Show on:</span>
                  <button
                    onClick={() => {
                      updateLink(link.id!, 'showBusiness', !link.showBusiness);
                      saveLinkUpdate({ ...link, showBusiness: !link.showBusiness });
                    }}
                    style={{
                      fontSize: '0.625rem', fontWeight: 600, padding: '0.2rem 0.5rem',
                      borderRadius: '9999px', border: 'none', textTransform: 'uppercase',
                      letterSpacing: '0.03em', cursor: 'pointer', fontFamily: 'inherit',
                      backgroundColor: link.showBusiness ? 'rgba(59, 130, 246, 0.15)' : 'var(--border, #1e2535)',
                      color: link.showBusiness ? '#60a5fa' : 'var(--text-muted, #5d6370)',
                      opacity: link.showBusiness ? 1 : 0.7,
                      transition: 'all 0.15s',
                    }}
                    title="Show on public business profile"
                  >
                    BIZ
                  </button>
                  <button
                    onClick={() => {
                      updateLink(link.id!, 'showPersonal', !link.showPersonal);
                      saveLinkUpdate({ ...link, showPersonal: !link.showPersonal });
                    }}
                    style={{
                      fontSize: '0.625rem', fontWeight: 600, padding: '0.2rem 0.5rem',
                      borderRadius: '9999px', border: 'none', textTransform: 'uppercase',
                      letterSpacing: '0.03em', cursor: 'pointer', fontFamily: 'inherit',
                      backgroundColor: link.showPersonal ? 'rgba(236, 72, 153, 0.15)' : 'var(--border, #1e2535)',
                      color: link.showPersonal ? '#f472b6' : 'var(--text-muted, #5d6370)',
                      opacity: link.showPersonal ? 1 : 0.7,
                      transition: 'all 0.15s',
                    }}
                    title="Show on personal page"
                  >
                    PERSONAL
                  </button>
                  <button
                    onClick={() => {
                      updateLink(link.id!, 'showShowcase', !link.showShowcase);
                      saveLinkUpdate({ ...link, showShowcase: !link.showShowcase });
                    }}
                    style={{
                      fontSize: '0.625rem', fontWeight: 600, padding: '0.2rem 0.5rem',
                      borderRadius: '9999px', border: 'none', textTransform: 'uppercase',
                      letterSpacing: '0.03em', cursor: 'pointer', fontFamily: 'inherit',
                      backgroundColor: link.showShowcase ? 'rgba(251, 191, 36, 0.15)' : 'var(--border, #1e2535)',
                      color: link.showShowcase ? '#fbbf24' : 'var(--text-muted, #5d6370)',
                      opacity: link.showShowcase ? 1 : 0.7,
                      transition: 'all 0.15s',
                    }}
                    title="Show on portfolio page"
                  >
                    PORTFOLIO
                  </button>
                  {/* Per-link color dot */}
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <input
                      type="color"
                      value={link.buttonColor || linkButtonColor || accentColor || '#e8a849'}
                      onChange={e => {
                        updateLink(link.id!, 'buttonColor', e.target.value);
                        saveLinkUpdate({ ...link, buttonColor: e.target.value });
                      }}
                      style={{ width: 18, height: 18, border: 'none', borderRadius: '50%', cursor: 'pointer', padding: 0, backgroundColor: 'transparent' }}
                      title="Per-link button color"
                    />
                    {link.buttonColor && (
                      <button
                        onClick={() => {
                          updateLink(link.id!, 'buttonColor', null);
                          saveLinkUpdate({ ...link, buttonColor: null });
                        }}
                        style={{ fontSize: '0.6rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted, #5d6370)', padding: 0 }}
                        title="Reset to global color"
                      >×</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add link dropdown */}
        {links.length < 15 && (
          <select
            value=""
            onChange={e => {
              if (e.target.value) addLink(e.target.value);
              e.target.value = '';
            }}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              border: '2px dashed var(--border-light, #283042)',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              backgroundColor: 'transparent',
              color: 'var(--text-muted, #5d6370)',
              cursor: 'pointer',
            }}
          >
            <option value="">+ Add a link...</option>
            {LINK_TYPES.map(lt => (
              <option key={lt.type} value={lt.type}>{lt.icon} {lt.label}</option>
            ))}
          </select>
        )}
      </>
    );
  }
);

LinksSection.displayName = 'LinksSection';
export default LinksSection;
