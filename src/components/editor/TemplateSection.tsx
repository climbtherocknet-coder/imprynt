'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { getTheme, type CustomThemeData } from '@/lib/themes';
import { COLOR_PRESETS as CUSTOM_COLOR_PRESETS, deriveAccentVars } from '@/lib/color-presets';
import { labelStyle, COLOR_PRESETS, TEMPLATE_LIST } from './constants';

// ── Types ──────────────────────────────────────────────

export interface TemplateState {
  template: string;
  accentColor: string;
  fontPair: string;
  customTheme: CustomThemeData;
}

export interface TemplateSectionProps {
  initial: TemplateState;
  isPaid: boolean;
  onChange: (state: TemplateState) => void;
  onError: (msg: string) => void;
  onTemplateChange?: (template: string, accentColor: string) => void;
}

export interface TemplateSectionRef {
  save: () => Promise<void>;
  getState: () => TemplateState;
}

// ── Component ──────────────────────────────────────────

const TemplateSection = forwardRef<TemplateSectionRef, TemplateSectionProps>(
  ({ initial, isPaid, onChange, onError, onTemplateChange }, ref) => {
    const [template, setTemplate] = useState(initial.template);
    const [accentColor, setAccentColor] = useState(initial.accentColor);
    const [fontPair, setFontPair] = useState(initial.fontPair);
    const [customTheme, setCustomTheme] = useState<CustomThemeData>(initial.customTheme || {});

    const getState = (): TemplateState => ({ template, accentColor, fontPair, customTheme });

    // Notify parent of changes
    useEffect(() => {
      onChange(getState());
    }, [template, accentColor, fontPair, customTheme]); // eslint-disable-line react-hooks/exhaustive-deps

    // Expose save + getState
    useImperativeHandle(ref, () => ({
      save: async () => {
        try {
          const themeAccent = getTheme(template).colors.accent;
          const accentToSave = (accentColor && accentColor !== themeAccent) ? accentColor : null;
          const res = await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              section: 'profile',
              template,
              accentColor: accentToSave,
              fontPair,
              customTheme: template === 'custom' ? customTheme : null,
            }),
          });
          if (!res.ok) {
            const d = await res.json();
            throw new Error(d.error || 'Failed to save');
          }
        } catch (err) {
          onError(err instanceof Error ? err.message : 'Failed to save');
          throw err;
        }
      },
      getState,
    }), [template, accentColor, fontPair, customTheme, onError]);

    return (
      <>
        {/* ── Template Grid ── */}
        <label style={labelStyle}>Template</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {TEMPLATE_LIST.map(t => {
            const isSelected = template === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setTemplate(t.id); setAccentColor(''); onTemplateChange?.(t.id, ''); }}
                style={{
                  padding: 0,
                  border: isSelected ? '2px solid var(--accent, #e8a849)' : '2px solid var(--border-light, #283042)',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  background: 'none',
                  transition: 'border-color 0.15s',
                  position: 'relative',
                }}
              >
                <div style={{
                  backgroundColor: t.colors.bg,
                  padding: '0.75rem 0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  minHeight: 60,
                }}>
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: t.modifiers.photoShape === 'circle' ? '50%' : '4px',
                    backgroundColor: t.colors.accent,
                    opacity: 0.3,
                  }} />
                  <div style={{ width: '60%', height: 5, borderRadius: 3, backgroundColor: t.colors.text, opacity: 0.7 }} />
                  <div style={{ width: '70%', height: 14, borderRadius: 4, backgroundColor: t.colors.accent, marginTop: 2 }} />
                </div>
                <div style={{ padding: '0.375rem', backgroundColor: 'var(--surface, #161c28)', borderTop: '1px solid var(--border, #1e2535)' }}>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 600, margin: 0, color: 'var(--text, #eceef2)' }}>{t.name}</p>
                </div>
              </button>
            );
          })}
          {/* Custom template card (premium) */}
          {(() => {
            const isSelected = template === 'custom';
            const previewAccent = customTheme.accent || '#e8a849';
            const previewBg = customTheme.bg || '#0c1017';
            const previewText = customTheme.text || '#eceef2';
            return (
              <button
                key="custom"
                onClick={() => { setTemplate('custom'); setAccentColor(''); onTemplateChange?.('custom', ''); }}
                style={{
                  padding: 0,
                  border: isSelected ? '2px solid var(--accent, #e8a849)' : '2px solid var(--border-light, #283042)',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  background: 'none',
                  transition: 'border-color 0.15s',
                  position: 'relative',
                }}
              >
                <div style={{
                  backgroundColor: previewBg,
                  padding: '0.75rem 0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  minHeight: 60,
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${previewAccent}, #ec4899)`,
                    opacity: 0.85,
                  }} />
                  <div style={{ width: '60%', height: 5, borderRadius: 3, backgroundColor: previewText, opacity: 0.7 }} />
                  <div style={{ width: '70%', height: 14, borderRadius: 4, background: `linear-gradient(90deg, ${previewAccent}, #ec4899)`, marginTop: 2 }} />
                </div>
                <div style={{ padding: '0.375rem', backgroundColor: 'var(--surface, #161c28)', borderTop: '1px solid var(--border, #1e2535)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 600, margin: 0, color: 'var(--text, #eceef2)' }}>Custom</p>
                  <span style={{ fontSize: '0.5rem', fontWeight: 700, padding: '1px 4px', borderRadius: '3px', backgroundColor: 'rgba(232,168,73,0.15)', color: 'var(--accent, #e8a849)', letterSpacing: '0.04em' }}>PRO</span>
                </div>
              </button>
            );
          })()}
        </div>

        {/* Custom theme editor — shown only when template === 'custom' */}
        {template === 'custom' && (
          <div style={{ marginBottom: '1.25rem', padding: '1rem', backgroundColor: 'var(--bg, #0c1017)', borderRadius: '0.75rem', border: '1px solid var(--border, #1e2535)' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted, #5d6370)', margin: '0 0 0.75rem' }}>Color Preset</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
              {CUSTOM_COLOR_PRESETS.map(preset => {
                const isActive = customTheme.accent === preset.colors.accent && customTheme.bg === preset.colors.bg;
                return (
                  <button
                    key={preset.id}
                    title={preset.name}
                    onClick={() => setCustomTheme(preset.colors)}
                    style={{
                      width: 32, height: 32, borderRadius: '50%', padding: 0,
                      border: isActive ? '3px solid var(--accent, #e8a849)' : '2px solid var(--border-light, #283042)',
                      outline: isActive ? '2px solid var(--bg, #0c1017)' : 'none',
                      outlineOffset: -3,
                      cursor: 'pointer',
                      background: `linear-gradient(135deg, ${preset.colors.bg} 50%, ${preset.colors.accent} 50%)`,
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                      transition: 'transform 0.1s',
                    }}
                  />
                );
              })}
            </div>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted, #5d6370)', margin: '0 0 0.625rem' }}>Colors</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {(
                [
                  ['bg', 'Background'],
                  ['text', 'Text'],
                  ['surface', 'Card surface'],
                  ['border', 'Border'],
                  ['accent', 'Accent'],
                  ['textMid', 'Text (mid)'],
                ] as [keyof CustomThemeData, string][]
              ).map(([key, label]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <input
                    type="color"
                    value={(customTheme[key] as string) || '#000000'}
                    onChange={e => {
                      const hex = e.target.value;
                      if (key === 'accent') {
                        const derived = deriveAccentVars(hex);
                        setCustomTheme(prev => ({ ...prev, accent: hex, ...derived }));
                      } else {
                        setCustomTheme(prev => ({ ...prev, [key]: hex }));
                      }
                    }}
                    style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--border-light, #283042)', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-mid, #a8adb8)' }}>{label}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '0.875rem' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted, #5d6370)', margin: '0 0 0.5rem' }}>Link Style</p>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {(['pills', 'stacked', 'full-width-pills'] as const).map(style => {
                  const styleLabel = style === 'full-width-pills' ? 'Full width' : style.charAt(0).toUpperCase() + style.slice(1);
                  return (
                    <button
                      key={style}
                      onClick={() => setCustomTheme(prev => ({ ...prev, linkStyle: style }))}
                      style={{
                        padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem',
                        border: customTheme.linkStyle === style ? '2px solid var(--accent, #e8a849)' : '1px solid var(--border-light, #283042)',
                        backgroundColor: customTheme.linkStyle === style ? 'rgba(232,168,73,0.1)' : 'var(--surface, #161c28)',
                        color: customTheme.linkStyle === style ? 'var(--accent, #e8a849)' : 'var(--text-mid, #a8adb8)',
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >{styleLabel}</button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Accent color override — shown for non-custom templates */}
        {template !== 'custom' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={labelStyle}>Accent color</label>
              <button
                onClick={() => {
                  const next = accentColor ? '' : getTheme(template).colors.accent;
                  setAccentColor(next);
                  onTemplateChange?.(template, next);
                }}
                style={{
                  fontSize: '0.6875rem', fontWeight: 500, fontFamily: 'inherit',
                  padding: '0.25rem 0.625rem', borderRadius: '9999px', border: '1px solid',
                  borderColor: accentColor ? 'var(--accent, #e8a849)' : 'var(--border-light, #283042)',
                  backgroundColor: accentColor ? 'rgba(232,168,73,0.1)' : 'transparent',
                  color: accentColor ? 'var(--accent, #e8a849)' : 'var(--text-muted, #5d6370)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {accentColor ? 'Custom' : 'Theme default'}
              </button>
            </div>
            {accentColor ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', alignItems: 'center' }}>
                {COLOR_PRESETS.map(c => (
                  <button
                    key={c}
                    onClick={() => { setAccentColor(c); onTemplateChange?.(template, c); }}
                    style={{
                      width: 28, height: 28, borderRadius: '50%',
                      backgroundColor: c,
                      border: accentColor === c ? '3px solid var(--accent, #e8a849)' : '2px solid var(--border-light, #283042)',
                      cursor: 'pointer', padding: 0,
                      outline: accentColor === c ? '2px solid var(--bg, #0c1017)' : 'none',
                      outlineOffset: -3,
                      transform: accentColor === c ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.1s',
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={accentColor}
                  onChange={e => { setAccentColor(e.target.value); onTemplateChange?.(template, e.target.value); }}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--border-light, #283042)', cursor: 'pointer', padding: 0 }}
                />
              </div>
            ) : (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #5d6370)', margin: 0 }}>
                Using {getTheme(template).name}&apos;s default accent color.
              </p>
            )}
          </>
        )}
      </>
    );
  }
);

TemplateSection.displayName = 'TemplateSection';
export default TemplateSection;
