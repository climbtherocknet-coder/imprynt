'use client';

import React, { useState, useEffect, useCallback } from 'react';
import '@/styles/profile.css';
import { getTheme, getCustomTheme, getThemeCSSVars, getTemplateDataAttrs, getAccentOverrideVars, isDarkTemplate, LINK_ICONS, type CustomThemeData } from '@/lib/themes';
import PodRenderer, { PodData } from '@/components/pods/PodRenderer';
import SaveContactButton from '@/components/templates/SaveContactButton';

interface ProtectedPagePreviewProps {
  mode: 'personal' | 'portfolio';
  firstName: string;
  lastName: string;
  photoUrl: string;
  template: string;
  accentColor: string;
  bioText: string;
  links: { id?: string; linkType: string; label: string; url: string; buttonColor?: string | null }[];
  pods: PodData[];
  resumeUrl?: string;
  showResume?: boolean;
  photoShape?: string;
  photoRadius?: number;
  photoSize?: string;
  photoPositionX?: number;
  photoPositionY?: number;
  photoAnimation?: string;
  photoAlign?: string;
  profileId?: string;
  customTheme?: CustomThemeData | null;
  coverUrl?: string;
  coverOpacity?: number;
  coverPositionY?: number;
  bgImageUrl?: string;
  bgImageOpacity?: number;
  bgImagePositionY?: number;
  photoZoom?: number;
  coverPositionX?: number;
  coverZoom?: number;
  bgImagePositionX?: number;
  bgImageZoom?: number;
  linkSize?: string;
  linkShape?: string;
  linkButtonColor?: string | null;
  linkDisplay?: string;
}

function getPhotoStyles(shape: string, radius: number, size: string, posX: number, posY: number): React.CSSProperties {
  const sizeMap: Record<string, number> = { small: 56, medium: 72, large: 96 };
  const dim = sizeMap[size] || 72;

  let borderRadius: string;
  let clipPath: string | undefined;

  if (shape === 'hexagon') {
    borderRadius = '0';
    clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
  } else if (shape === 'diamond') {
    borderRadius = '0';
    clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
  } else {
    borderRadius = `${radius}%`;
    clipPath = undefined;
  }

  return {
    width: dim,
    height: dim,
    borderRadius,
    clipPath,
    objectFit: 'cover' as const,
    objectPosition: `${posX}% ${posY}%`,
    display: 'block',
  };
}

export default function ProtectedPagePreview({
  mode,
  firstName,
  lastName,
  photoUrl,
  template,
  accentColor: accentOverride,
  bioText,
  links,
  pods,
  resumeUrl,
  showResume,
  photoShape = 'circle',
  photoRadius = 50,
  photoSize = 'medium',
  photoPositionX = 50,
  photoPositionY = 50,
  photoAnimation,
  photoAlign = 'center',
  profileId,
  customTheme,
  coverUrl,
  coverOpacity = 30,
  coverPositionY = 50,
  bgImageUrl,
  bgImageOpacity = 20,
  bgImagePositionY = 50,
  photoZoom = 100,
  coverPositionX = 50,
  coverZoom = 100,
  bgImagePositionX = 50,
  bgImageZoom = 100,
  linkSize = 'medium',
  linkShape = 'pill',
  linkButtonColor,
  linkDisplay = 'default',
}: ProtectedPagePreviewProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const theme = template === 'custom' ? getCustomTheme(customTheme) : getTheme(template);
  const accent = accentOverride || theme.colors.accent;
  const isDark = isDarkTemplate(template);
  const cssVars = getThemeCSSVars(theme);
  const accentOverrides = accentOverride ? getAccentOverrideVars(accentOverride) : {};
  const dataAttrs = getTemplateDataAttrs(theme);
  if (linkSize !== 'medium') dataAttrs['data-link-size'] = linkSize;
  if (linkShape !== 'pill') dataAttrs['data-link-shape'] = linkShape;

  const cssVarStyle = {
    ...Object.fromEntries(
      cssVars.split('; ').map(v => {
        const [key, ...rest] = v.split(': ');
        return [key, rest.join(': ')];
      })
    ),
    ...accentOverrides,
    ...(linkButtonColor ? { '--link-btn-color': linkButtonColor } : {}),
  } as React.CSSProperties;

  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const isImpression = mode === 'personal';

  // Close lightbox on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setLightboxOpen(false);
  }, []);

  useEffect(() => {
    if (lightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [lightboxOpen, handleKeyDown]);

  // Alignment style for photo + name section
  const alignStyle: React.CSSProperties = {
    textAlign: photoAlign === 'left' ? 'left' : photoAlign === 'right' ? 'right' : 'center',
  };

  return (
    <div
      className={`profile-page t-${template}`}
      {...dataAttrs}
      {...(bgImageUrl ? { 'data-has-bg': 'true' } : {})}
      style={{
        ...cssVarStyle,
        minHeight: '100%',
        backgroundColor: 'var(--bg)',
        fontFamily: 'var(--font-body)',
        color: 'var(--text)',
        position: 'relative',
      }}
    >
      {/* Background Photo */}
      {bgImageUrl && (
        <div
          className="profile-bg-image"
          style={{ '--bg-overlay-opacity': `${(100 - bgImageOpacity) / 100}` } as React.CSSProperties}
        >
          <img
            src={bgImageUrl}
            alt=""
            style={{
              objectPosition: `${bgImagePositionX}% ${bgImagePositionY}%`,
              transform: bgImageZoom > 100 ? `scale(${bgImageZoom / 100})` : undefined,
            }}
          />
        </div>
      )}

      {/* Cover + Content */}
      <div
        className="profile-top"
        {...(coverUrl ? { 'data-has-cover': 'true' } : {})}
        style={coverUrl ? {
          '--cover-url': `url('${coverUrl}')`,
          '--cover-opacity': `${coverOpacity / 100}`,
          '--cover-pos': `${coverPositionX}% ${coverPositionY}%`,
          '--cover-zoom': coverZoom > 100 ? `${coverZoom}%` : 'cover',
        } as React.CSSProperties : undefined}
      >
        <div style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '2rem 1rem',
          position: 'relative',
          zIndex: 1,
        }}>
        {/* Badge */}
        {isImpression && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.75rem',
            backgroundColor: accent + '15',
            color: accent,
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
          }}>
            ◆ Personal
          </div>
        )}

        {/* Photo + Name section with alignment */}
        <div style={alignStyle} data-photo-align={photoAlign}>
          {/* Photo */}
          {(() => {
            const ps = getPhotoStyles(photoShape, photoRadius, photoSize, photoPositionX, photoPositionY);
            const marginStyle = photoAlign === 'left' ? { margin: '0 0 0.75rem' } :
                                photoAlign === 'right' ? { margin: '0 0 0.75rem', marginLeft: 'auto' } :
                                { margin: '0 auto 0.75rem' };
            const zoomStyle: React.CSSProperties = photoZoom > 100 ? {
              transform: `scale(${photoZoom / 100})`,
              transformOrigin: `${photoPositionX}% ${photoPositionY}%`,
            } : {};
            return photoUrl ? (
              <div style={{ ...marginStyle, width: ps.width, height: ps.height, overflow: 'hidden', borderRadius: ps.borderRadius, clipPath: ps.clipPath, flexShrink: 0 }}>
                <img
                  src={photoUrl}
                  alt={fullName}
                  referrerPolicy="no-referrer"
                  className="photo-expandable"
                  style={{ ...ps, ...zoomStyle, borderRadius: 0, clipPath: undefined, margin: 0 }}
                  onClick={() => setLightboxOpen(true)}
                />
              </div>
            ) : (
              <div style={{
                ...ps, ...marginStyle,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: accent + '15', color: accent, fontSize: '1.5rem', fontWeight: 700,
              }}>
                {(firstName?.[0] || '').toUpperCase()}
              </div>
            );
          })()}

          {/* Name */}
          <h1 style={{
            fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)',
            color: 'var(--text)',
            margin: '0 0 0.25rem', letterSpacing: '-0.02em',
          }}>
            {fullName}
          </h1>
        </div>

        {/* Bio / personal message */}
        {bioText && (
          <p style={{
            fontSize: '0.925rem', lineHeight: 1.6,
            color: 'var(--text-mid)', margin: '1rem 0',
            whiteSpace: 'pre-line',
            textAlign: photoAlign === 'left' ? 'left' : photoAlign === 'right' ? 'right' : 'center',
          }}>
            {bioText}
          </p>
        )}

        {/* Divider */}
        <div style={{ width: 40, height: 2, backgroundColor: 'var(--border)', margin: '1.5rem auto', borderRadius: 1 }} />

        {/* Links — use profile's link display mode */}
        {links.length > 0 && (
          linkDisplay === 'icons' ? (
            <div className="link-icons-row">
              {links.map((link, i) => {
                const btnColor = link.buttonColor || linkButtonColor || null;
                return (
                  <a
                    key={link.id || i}
                    href={link.linkType === 'email' ? `mailto:${link.url}` :
                          link.linkType === 'phone' ? `tel:${link.url}` :
                          link.url || '#'}
                    target={['email', 'phone'].includes(link.linkType) ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="link-icon-btn"
                    title={link.label || link.linkType}
                    aria-label={link.label || link.linkType}
                    style={btnColor ? {
                      color: btnColor,
                      borderColor: btnColor,
                      '--link-btn-color': btnColor,
                    } as React.CSSProperties : undefined}
                  >
                    <span className="icon" dangerouslySetInnerHTML={{ __html: LINK_ICONS[link.linkType] || LINK_ICONS.custom }} />
                  </a>
                );
              })}
            </div>
          ) : (() => {
            const ls = linkDisplay === 'default' ? theme.modifiers.linkStyle : linkDisplay;
            const href = (l: typeof links[0]) =>
              l.linkType === 'email' ? `mailto:${l.url}` : l.linkType === 'phone' ? `tel:${l.url}` : l.url || '#';
            const target = (l: typeof links[0]) =>
              ['email', 'phone'].includes(l.linkType) ? undefined : '_blank';
            const renderLink = (l: typeof links[0], i: number, cls: string) => {
              const bc = l.buttonColor || linkButtonColor || null;
              return (
                <a key={l.id || i} href={href(l)} target={target(l)} rel="noopener noreferrer" className={cls}
                  style={bc ? { color: bc, borderColor: bc, '--link-btn-color': bc } as React.CSSProperties : undefined}>
                  <span className="icon" dangerouslySetInnerHTML={{ __html: LINK_ICONS[l.linkType] || LINK_ICONS.custom }} />
                  {l.label || l.linkType}
                </a>
              );
            };
            if (ls === 'stacked') return (
              <div className="link-stacked">{links.map((l, i) => renderLink(l, i, 'link-stacked-item'))}</div>
            );
            if (ls === 'full-width-pills') return (
              <div className="link-full-width">{links.map((l, i) => renderLink(l, i, 'link-full-width-item'))}</div>
            );
            return (
              <div className="link-row">{links.map((l, i) => renderLink(l, i, 'link-pill'))}</div>
            );
          })()
        )}

        {/* Save Contact */}
        {profileId && (
          <div style={{ marginTop: links.length > 0 ? '1.5rem' : '0' }}>
            <SaveContactButton profileId={profileId} pinProtected={false} />
          </div>
        )}

        {/* Resume (showcase only) */}
        {!isImpression && resumeUrl && showResume !== false && (
          <div style={{ marginTop: links.length > 0 ? '1rem' : '0' }}>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center',
                gap: '0.375rem', padding: '0.5rem 1rem',
                borderRadius: '9999px', textDecoration: 'none',
                fontWeight: 600, fontSize: '0.8125rem',
                backgroundColor: 'var(--accent-soft)',
                color: accent,
                border: '1px solid var(--accent-border)',
              }}
            >
              View Resume
            </a>
          </div>
        )}

        {/* Empty state */}
        {links.length === 0 && !pods.length && !bioText && !(resumeUrl && showResume !== false) && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>
            No content added yet.
          </p>
        )}

        {/* Pods */}
        {pods.length > 0 && (
          <div style={{ textAlign: 'left' }}>
            {pods.map((pod, i) => (
              <div key={pod.id}>
                <div style={{ width: 40, height: 2, backgroundColor: 'var(--border)', margin: '1.5rem auto', borderRadius: 1 }} />
                <PodRenderer pod={pod} delay={5 + i} />
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Photo Lightbox */}
      {lightboxOpen && photoUrl && (
        <div className="photo-lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <img src={photoUrl} alt={fullName} />
        </div>
      )}
    </div>
  );
}
