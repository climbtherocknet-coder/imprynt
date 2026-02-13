import '@/styles/profile.css';
import { getTheme, getThemeCSSVars, getTemplateDataAttrs, getGoogleFontsUrl, LINK_ICONS } from '@/lib/themes';
import PodRenderer, { PodData } from '@/components/pods/PodRenderer';

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
  links: { id: string; link_type: string; label: string; url: string }[];
  pods: PodData[];
  isPaid: boolean;
  statusTags?: string[];
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
}: ProfileTemplateProps) {
  const theme = getTheme(template);
  const cssVars = getThemeCSSVars(theme);
  const dataAttrs = getTemplateDataAttrs(theme);
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
        })) } as React.CSSProperties}
        {...dataAttrs}
      >
        {/* ─── Status Tags ─── */}
        {statusTags.length > 0 && (
          <div className="hero" style={{ paddingBottom: 0 }}>
            <div className="status-tags fade-in d1">
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
            />
          )}

          {/* Hero rule (Classic, Editorial) */}
          <div className="hero-rule" />

          {/* Bio (from profile, not pods) — pods replace this for pod-enabled profiles */}

          {/* Links */}
          {links.length > 0 && (
            <>
              {linkStyle === 'pills' && (
                <div className="link-row fade-in d3">
                  {links.map(link => (
                    <a key={link.id} href={getLinkHref(link)} target={getLinkTarget(link.link_type)} rel="noopener noreferrer" className="link-pill">
                      <span className="icon">{LINK_ICONS[link.link_type] || '>'}</span>
                      {link.label || link.link_type}
                    </a>
                  ))}
                </div>
              )}
              {linkStyle === 'stacked' && (
                <div className="link-stacked fade-in d3">
                  {links.map(link => (
                    <a key={link.id} href={getLinkHref(link)} target={getLinkTarget(link.link_type)} rel="noopener noreferrer" className="link-stacked-item">
                      <span className="icon">{LINK_ICONS[link.link_type] || '>'}</span>
                      {link.label || link.link_type}
                    </a>
                  ))}
                </div>
              )}
              {linkStyle === 'full-width-pills' && (
                <div className="link-full-width fade-in d3">
                  {links.map(link => (
                    <a key={link.id} href={getLinkHref(link)} target={getLinkTarget(link.link_type)} rel="noopener noreferrer" className="link-full-width-item">
                      <span className="icon">{LINK_ICONS[link.link_type] || '>'}</span>
                      {link.label || link.link_type}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Save Contact */}
          <div className="save-row fade-in d4">
            <a href={`/api/vcard/${profileId}`} className="save-btn">
              ↓ Save Contact
            </a>
          </div>
        </div>

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
  photoUrl, fullName, firstName, subtitle, tagline, hasTagline,
}: {
  photoUrl: string; fullName: string; firstName: string;
  subtitle: string; tagline: string; hasTagline: boolean;
}) {
  return (
    <>
      <div className="hero-top fade-in d1">
        <div className="photo">
          {photoUrl ? (
            <img src={photoUrl} alt={fullName} />
          ) : (
            <div className="photo-inner">
              {(firstName?.[0] || '').toUpperCase()}
            </div>
          )}
        </div>
        <div className="hero-identity">
          <h1 className="hero-name">{fullName}</h1>
          {subtitle && <p className="hero-title">{subtitle}</p>}
          {tagline && hasTagline && <p className="hero-tagline">{tagline}</p>}
        </div>
      </div>
    </>
  );
}
