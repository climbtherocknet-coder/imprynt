import '@/styles/profile.css';
import { getTheme, getCustomTheme, getThemeCSSVars, getTemplateDataAttrs, getGoogleFontsUrl, getAccentOverrideVars, LINK_ICONS, type CustomThemeData } from '@/lib/themes';
import PodRenderer, { PodData } from '@/components/pods/PodRenderer';
import SaveContactButton from '@/components/templates/SaveContactButton';
import ExpandablePhoto from '@/components/templates/ExpandablePhoto';

const STATUS_TAG_LABELS: Record<string, string> = {
  open_to_network: 'Open to Network',
  open_to_work: 'Open to Work',
  hiring: 'Hiring',
  open_to_collaborate: 'Open to Collaborate',
  consulting: 'Available for Consulting',
  mentoring: 'Open to Mentor',
};

export interface ProfileTemplateProps {
  profileId: string;
  template: string;
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  tagline: string;
  photoUrl: string;
  links: { id: string; link_type: string; label: string; url: string; buttonColor?: string | null }[];
  pods: PodData[];
  isPaid: boolean;
  statusTags?: string[];
  statusTagColor?: string;
  photoShape?: string;
  photoRadius?: number | null;
  photoSize?: string;
  photoPositionX?: number;
  photoPositionY?: number;
  photoAnimation?: string;
  vcardPinEnabled?: boolean;
  accentColor?: string;
  linkDisplay?: string;
  photoAlign?: string;
  customTheme?: CustomThemeData | Record<string, string>;
  // Cover photo (background of hero section, content on top)
  coverUrl?: string;
  coverPositionY?: number;
  coverOpacity?: number; // 10-100, default 70
  // Background photo (full page behind profile)
  bgImageUrl?: string;
  bgImageOpacity?: number;
  bgImagePositionY?: number;
  // Zoom controls (migration 041)
  photoZoom?: number;
  coverPositionX?: number;
  coverZoom?: number;
  bgImagePositionX?: number;
  bgImageZoom?: number;
  // Link button settings (migration 046+047)
  linkSize?: string;
  linkShape?: string;
  linkButtonColor?: string | null;
  // Editor preview containment (prevent position:fixed from escaping preview)
  contained?: boolean;
}

function getLinkHref(link: { link_type: string; url: string }) {
  if (link.link_type === 'email') return `mailto:${link.url}`;
  if (link.link_type === 'phone') return `tel:${link.url}`;
  return link.url;
}

function getLinkTarget(linkType: string) {
  return ['email', 'phone'].includes(linkType) ? undefined : '_blank';
}

export default function ProfileTemplate({
  profileId,
  template,
  firstName,
  lastName,
  title,
  company,
  tagline,
  photoUrl,
  links,
  pods,
  isPaid,
  statusTags = [],
  statusTagColor,
  photoShape,
  photoRadius,
  photoSize,
  photoPositionX,
  photoPositionY,
  photoAnimation,
  vcardPinEnabled = false,
  accentColor,
  linkDisplay = 'default',
  photoAlign = 'left',
  customTheme,
  coverUrl,
  coverPositionY = 50,
  coverOpacity = 70,
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
  contained = false,
}: ProfileTemplateProps) {
  const theme = template === 'custom' ? getCustomTheme(customTheme as CustomThemeData) : getTheme(template);
  const cssVars = getThemeCSSVars(theme);
  const accentOverrides = accentColor ? getAccentOverrideVars(accentColor) : {};
  const dataAttrs = getTemplateDataAttrs(theme);
  // User's photo shape overrides the theme default
  const effectiveShape = photoShape || theme.modifiers.photoShape;
  dataAttrs['data-photo'] = effectiveShape === 'custom' ? 'custom' : effectiveShape;
  dataAttrs['data-photo-size'] = photoSize || 'medium';
  if (photoAnimation && photoAnimation !== 'none') {
    dataAttrs['data-photo-anim'] = photoAnimation;
  }
  // Always set data-photo-align so CSS rules apply consistently
  const effectivePhotoAlign = photoAlign || 'left';
  dataAttrs['data-photo-align'] = effectivePhotoAlign;
  if (linkSize && linkSize !== 'medium') dataAttrs['data-link-size'] = linkSize;
  if (linkShape && linkShape !== 'pill') dataAttrs['data-link-shape'] = linkShape;
  const googleFontsUrl = getGoogleFontsUrl(theme);
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const subtitle = [title, company].filter(Boolean).join(' · ');
  const linkStyle = theme.modifiers.linkStyle;

  return (
    <>
      {/* Google Fonts */}
      {googleFontsUrl && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href={googleFontsUrl} rel="stylesheet" />
        </>
      )}

      <div
        className={`profile-page t-${template}`}
        style={{ ...Object.fromEntries(cssVars.split('; ').map(v => {
          const [key, ...rest] = v.split(': ');
          return [key, rest.join(': ')];
        })), ...accentOverrides, ...(linkButtonColor ? { '--link-btn-color': linkButtonColor } : {}) } as React.CSSProperties}
        {...dataAttrs}
        {...(contained ? { 'data-contained': 'true' } : {})}
        {...(bgImageUrl ? { 'data-has-bg': 'true' } : {})}
      >
        {/* ─── Background Photo (fixed, full page) ─── */}
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

        {/* ─── Profile Top: cover photo + status tags + hero ─── */}
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

        {/* ─── Status Tags ─── */}
        {statusTags.length > 0 && (
          <div className="hero" style={{ paddingBottom: 0 }}>
            <div
              className="status-tags fade-in d1"
              style={statusTagColor ? {
                '--accent': statusTagColor,
                '--accent-soft': `${statusTagColor}0f`,
              } as React.CSSProperties : undefined}
            >
              {statusTags.map(slug => (
                <span key={slug} className="status-tag">
                  <span className="status-tag-dot" />
                  {STATUS_TAG_LABELS[slug] || slug}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ─── Hero ─── */}
        <div className="hero">
          {/* Soft: hero card wrap */}
          {theme.effects?.heroCardWrap ? (
            <div className="hero-card fade-in d1">
              <HeroContent
                photoUrl={photoUrl}
                fullName={fullName}
                firstName={firstName}
                subtitle={subtitle}
                tagline={tagline}
                hasTagline={!!theme.effects?.heroTagline}
                photoShape={effectiveShape}
                photoRadius={photoRadius}
                photoPositionX={photoPositionX}
                photoPositionY={photoPositionY}
                photoZoom={photoZoom}
              />
            </div>
          ) : (
            <HeroContent
              photoUrl={photoUrl}
              fullName={fullName}
              firstName={firstName}
              subtitle={subtitle}
              tagline={tagline}
              hasTagline={!!theme.effects?.heroTagline}
              photoShape={effectiveShape}
              photoRadius={photoRadius}
              photoPositionX={photoPositionX}
              photoPositionY={photoPositionY}
            />
          )}

          {/* Hero rule (Classic, Editorial) */}
          <div className="hero-rule" />

          {/* Links */}
          {links.length > 0 && (
            <>
              {linkDisplay === 'icons' ? (
                <div className="link-icons-row fade-in d3">
                  {links.map(link => {
                    const btnColor = link.buttonColor || linkButtonColor || null;
                    return (
                      <a
                        key={link.id}
                        href={getLinkHref(link)}
                        target={getLinkTarget(link.link_type)}
                        rel="noopener noreferrer"
                        className="link-icon-btn"
                        title={link.label || link.link_type}
                        aria-label={link.label || link.link_type}
                        style={btnColor ? {
                          color: btnColor,
                          borderColor: btnColor,
                          '--link-btn-color': btnColor,
                        } as React.CSSProperties : undefined}
                      >
                        <span className="icon" dangerouslySetInnerHTML={{ __html: LINK_ICONS[link.link_type] || LINK_ICONS.custom }} />
                      </a>
                    );
                  })}
                  <SaveContactButton profileId={profileId} pinProtected={vcardPinEnabled} iconOnly={true} inline={true} />
                </div>
              ) : (
                <>
                  {linkStyle === 'pills' && (
                    <div className="link-row fade-in d3">
                      {links.map(link => (
                        <a key={link.id} href={getLinkHref(link)} target={getLinkTarget(link.link_type)} rel="noopener noreferrer" className="link-pill"
                          style={link.buttonColor ? { '--link-btn-color': link.buttonColor } as React.CSSProperties : undefined}>
                          <span className="icon" dangerouslySetInnerHTML={{ __html: LINK_ICONS[link.link_type] || LINK_ICONS.custom }} />
                          {link.label || link.link_type}
                        </a>
                      ))}
                    </div>
                  )}
                  {linkStyle === 'stacked' && (
                    <div className="link-stacked fade-in d3">
                      {links.map(link => (
                        <a key={link.id} href={getLinkHref(link)} target={getLinkTarget(link.link_type)} rel="noopener noreferrer" className="link-stacked-item"
                          style={link.buttonColor ? { '--link-btn-color': link.buttonColor } as React.CSSProperties : undefined}>
                          <span className="icon" dangerouslySetInnerHTML={{ __html: LINK_ICONS[link.link_type] || LINK_ICONS.custom }} />
                          {link.label || link.link_type}
                        </a>
                      ))}
                    </div>
                  )}
                  {linkStyle === 'full-width-pills' && (
                    <div className="link-full-width fade-in d3">
                      {links.map(link => (
                        <a key={link.id} href={getLinkHref(link)} target={getLinkTarget(link.link_type)} rel="noopener noreferrer" className="link-full-width-item"
                          style={link.buttonColor ? { '--link-btn-color': link.buttonColor } as React.CSSProperties : undefined}>
                          <span className="icon" dangerouslySetInnerHTML={{ __html: LINK_ICONS[link.link_type] || LINK_ICONS.custom }} />
                          {link.label || link.link_type}
                        </a>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Save Contact — icon mode renders it inline above, label modes render it here */}
          {linkDisplay !== 'icons' && (
            <SaveContactButton profileId={profileId} pinProtected={vcardPinEnabled} iconOnly={false} />
          )}
        </div>
        </div>{/* end .profile-top */}

        {/* ─── Pods ─── */}
        {pods.map((pod, i) => (
          <div key={pod.id}>
            <div className="divider"><hr /></div>
            <PodRenderer pod={pod} delay={5 + i} />
          </div>
        ))}

        {/* ─── Ad Slot (free tier, activated later) ─── */}
        {!isPaid && (
          <div className="ad-slot" data-ad-enabled="false">
            {/* Reserved for AdSense or similar. Enable via data-ad-enabled="true" */}
          </div>
        )}

        {/* ─── Footer ─── */}
        <div className="footer fade-in d8">
          {!isPaid && (
            <a href="https://trysygnet.com" target="_blank" rel="noopener noreferrer" className="watermark">
              <span className="watermark-mark" />
              <span className="watermark-text">Powered by <strong>Imprynt</strong></span>
            </a>
          )}
        </div>
      </div>
    </>
  );
}

// ── Hero sub-component (used in both wrapped and unwrapped modes)
function HeroContent({
  photoUrl, fullName, firstName, subtitle, tagline, hasTagline, photoShape, photoRadius, photoPositionX, photoPositionY, photoZoom,
}: {
  photoUrl: string; fullName: string; firstName: string;
  subtitle: string; tagline: string; hasTagline: boolean;
  photoShape?: string; photoRadius?: number | null;
  photoPositionX?: number; photoPositionY?: number;
  photoZoom?: number;
}) {
  const customPhotoStyle: React.CSSProperties | undefined =
    photoShape === 'custom' && photoRadius != null
      ? { borderRadius: `${photoRadius}%` }
      : undefined;

  return (
    <>
      <div className="hero-top fade-in d1">
        <ExpandablePhoto
          photoUrl={photoUrl}
          fullName={fullName}
          customPhotoStyle={customPhotoStyle}
          positionStyle={{
            objectPosition: `${photoPositionX ?? 50}% ${photoPositionY ?? 50}%`,
            transform: (photoZoom ?? 100) > 100 ? `scale(${(photoZoom ?? 100) / 100})` : undefined,
            transformOrigin: `${photoPositionX ?? 50}% ${photoPositionY ?? 50}%`,
          }}
          initials={(firstName?.[0] || '').toUpperCase()}
        />
        <div className="hero-identity">
          <h1 className="hero-name">{fullName}</h1>
          {subtitle && <p className="hero-title">{subtitle}</p>}
          {tagline && hasTagline && <p className="hero-tagline">{tagline}</p>}
        </div>
      </div>
    </>
  );
}
