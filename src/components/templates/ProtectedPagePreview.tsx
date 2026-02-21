import React from 'react';
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
  links: { id?: string; linkType: string; label: string; url: string }[];
  pods: PodData[];
  resumeUrl?: string;
  showResume?: boolean;
  photoShape?: string;
  photoRadius?: number;
  photoSize?: string;
  photoPositionX?: number;
  photoPositionY?: number;
  photoAnimation?: string;
  profileId?: string;
  customTheme?: CustomThemeData | null;
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
    margin: '0 auto 0.75rem',
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
  profileId,
  customTheme,
}: ProtectedPagePreviewProps) {
  const theme = template === 'custom' ? getCustomTheme(customTheme) : getTheme(template);
  const accent = accentOverride || theme.colors.accent;
  const isDark = isDarkTemplate(template);
  const cssVars = getThemeCSSVars(theme);
  const accentOverrides = accentOverride ? getAccentOverrideVars(accentOverride) : {};
  const dataAttrs = getTemplateDataAttrs(theme);

  const cssVarStyle = {
    ...Object.fromEntries(
      cssVars.split('; ').map(v => {
        const [key, ...rest] = v.split(': ');
        return [key, rest.join(': ')];
      })
    ),
    ...accentOverrides,
  } as React.CSSProperties;

  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const isImpression = mode === 'personal';

  return (
    <div
      className={`profile-page t-${template}`}
      {...dataAttrs}
      style={{
        ...cssVarStyle,
        minHeight: '100%',
        backgroundColor: 'var(--bg)',
        fontFamily: 'var(--font-body)',
        color: 'var(--text)',
      }}
    >
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '2rem 1rem',
        textAlign: 'center',
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

        {/* Photo */}
        {(() => {
          const ps = getPhotoStyles(photoShape, photoRadius, photoSize, photoPositionX, photoPositionY);
          return photoUrl ? (
            <img
              src={photoUrl}
              alt={fullName}
              referrerPolicy="no-referrer"
              style={ps}
            />
          ) : (
            <div style={{
              ...ps,
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

        {/* Bio / personal message */}
        {bioText && (
          <p style={{
            fontSize: '0.925rem', lineHeight: 1.6,
            color: 'var(--text-mid)', margin: '1rem 0',
            whiteSpace: 'pre-line',
          }}>
            {bioText}
          </p>
        )}

        {/* Divider */}
        <div style={{ width: 40, height: 2, backgroundColor: 'var(--border)', margin: '1.5rem auto', borderRadius: 1 }} />

        {/* Links */}
        {links.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {links.map((link, i) => (
              <a
                key={link.id || i}
                href={link.linkType === 'email' ? `mailto:${link.url}` :
                      link.linkType === 'phone' ? `tel:${link.url}` :
                      link.url || '#'}
                target={['email', 'phone'].includes(link.linkType) ? undefined : '_blank'}
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '0.5rem', padding: '0.875rem 1.25rem',
                  borderRadius: 'var(--radius)', textDecoration: 'none',
                  fontWeight: 600, fontSize: '0.9375rem',
                  backgroundColor: accent,
                  color: isDark ? 'var(--bg)' : '#fff',
                  border: '2px solid transparent',
                }}
              >
                <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }} dangerouslySetInnerHTML={{ __html: LINK_ICONS[link.linkType] || LINK_ICONS.custom }} />
                {link.label || link.linkType}
              </a>
            ))}
          </div>
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
  );
}
