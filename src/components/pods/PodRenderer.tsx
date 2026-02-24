import { renderMarkdown } from '@/lib/markdown';

export interface PodData {
  id: string;
  podType: string;
  label: string;
  title: string;
  body: string;
  imageUrl: string;
  stats: { num: string; label: string }[];
  ctaLabel: string;
  ctaUrl: string;
  tags?: string;
  imagePosition?: string;
  listingStatus?: string;
  listingPrice?: string;
  listingDetails?: { beds?: string; baths?: string; sqft?: string };
  sourceDomain?: string;
  autoRemoveAt?: string;
  soldAt?: string;
  eventStart?: string;
  eventEnd?: string;
  eventVenue?: string;
  eventAddress?: string;
  eventStatus?: string;
  eventAutoHide?: boolean;
  audioUrl?: string;
  audioDuration?: number;
}

function getEventState(pod: PodData): 'upcoming' | 'live' | 'ended' | 'cancelled' | 'postponed' | 'sold_out' {
  if (pod.eventStatus === 'cancelled') return 'cancelled';
  if (pod.eventStatus === 'postponed') return 'postponed';
  if (pod.eventStatus === 'sold_out') return 'sold_out';
  const now = Date.now();
  if (pod.eventStart && new Date(pod.eventStart).getTime() <= now) {
    if (pod.eventEnd && new Date(pod.eventEnd).getTime() <= now) return 'ended';
    return 'live';
  }
  return 'upcoming';
}

function formatEventCountdown(startStr: string): string {
  const now = Date.now();
  const start = new Date(startStr).getTime();
  const diff = start - now;
  if (diff <= 0) return '';
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  if (months > 0) return `${months}mo ${days % 30}d`;
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${mins % 60}m`;
  return 'Starting soon';
}

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatEventTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function PodRenderer({ pod, delay }: { pod: PodData; delay: number }) {
  const delayClass = `d${Math.min(delay, 8)}`;

  if (pod.podType === 'text') {
    return (
      <div className={`pod fade-in ${delayClass}`}>
        {pod.label && <p className="pod-label">{pod.label}</p>}
        {pod.title && <h2 className="pod-title">{pod.title}</h2>}
        {pod.body && <div className="pod-body pod-body-md">{renderMarkdown(pod.body)}</div>}
      </div>
    );
  }

  if (pod.podType === 'text_image') {
    const isRight = pod.imagePosition === 'right';
    return (
      <div className={`pod fade-in ${delayClass}`}>
        <div className={`pod-split${isRight ? ' pod-split-reverse' : ''}`}>
          {pod.imageUrl ? (
            <img src={pod.imageUrl} alt={pod.title || ''} className="pod-img" referrerPolicy="no-referrer" />
          ) : (
            <div className="pod-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              PHOTO
            </div>
          )}
          <div className="pod-split-body">
            {pod.label && <p className="pod-label">{pod.label}</p>}
            {pod.title && <h3 className="pod-title">{pod.title}</h3>}
            {pod.body && <div className="pod-body pod-body-md">{renderMarkdown(pod.body)}</div>}
          </div>
        </div>
      </div>
    );
  }

  if (pod.podType === 'stats' && pod.stats?.length > 0) {
    return (
      <div className={`pod fade-in ${delayClass}`}>
        {pod.label && <p className="pod-label">{pod.label}</p>}
        <div className="pod-stats">
          {pod.stats.map((stat, i) => (
            <div key={i} className="stat">
              <div className="stat-num">{stat.num}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (pod.podType === 'cta') {
    return (
      <div className={`pod fade-in ${delayClass}`}>
        <div className="pod-cta">
          {pod.title && <h3>{pod.title}</h3>}
          {pod.body && <p>{pod.body}</p>}
          {pod.ctaUrl && (
            <a href={pod.ctaUrl} target="_blank" rel="noopener noreferrer" className="pod-cta-btn">
              {pod.ctaLabel || 'Learn More'} →
            </a>
          )}
        </div>
      </div>
    );
  }

  if (pod.podType === 'link_preview' && pod.ctaUrl) {
    const domain = (() => {
      try { return new URL(pod.ctaUrl).hostname.replace(/^www\./, ''); } catch { return ''; }
    })();
    const hasImage = !!pod.imageUrl;
    return (
      <div className={`pod fade-in ${delayClass}`}>
        {pod.label && <p className="pod-label">{pod.label}</p>}
        <a href={pod.ctaUrl} target="_blank" rel="noopener noreferrer" className={`pod-link-preview${hasImage ? '' : ' pod-link-preview--no-img'}`}>
          {hasImage && (
            <img src={pod.imageUrl} alt={pod.title || ''} className="pod-link-img" referrerPolicy="no-referrer" />
          )}
          <div className="pod-link-body">
            {pod.title && <h3 className="pod-link-title">{pod.title}</h3>}
            {pod.body && <p className="pod-link-desc">{pod.body}</p>}
            {domain && <span className="pod-link-domain">{domain}</span>}
          </div>
        </a>
      </div>
    );
  }

  if (pod.podType === 'project') {
    const tagList = pod.tags ? pod.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    return (
      <div className={`pod fade-in ${delayClass}`}>
        {pod.label && <p className="pod-label">{pod.label}</p>}
        <div className="pod-project">
          {pod.imageUrl && (
            <img src={pod.imageUrl} alt={pod.title || ''} className="pod-project-img" referrerPolicy="no-referrer" />
          )}
          <div className="pod-project-body">
            {pod.title && <h3 className="pod-title">{pod.title}</h3>}
            {pod.body && <p className="pod-project-desc">{pod.body}</p>}
            {tagList.length > 0 && (
              <div className="pod-project-tags">
                {tagList.map((tag, i) => (
                  <span key={i} className="pod-project-tag">{tag}</span>
                ))}
              </div>
            )}
            {pod.ctaUrl && (
              <a href={pod.ctaUrl} target="_blank" rel="noopener noreferrer" className="pod-project-link">
                {pod.ctaLabel || 'View Project'} →
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (pod.podType === 'listing') {
    const details = pod.listingDetails || {};
    // Open house: auto-revert display to "active" if the open house has passed
    const isOpenHousePast = pod.listingStatus === 'open_house' && pod.eventEnd && new Date(pod.eventEnd).getTime() < Date.now();
    const displayStatus = isOpenHousePast ? 'active' : (pod.listingStatus || 'active');
    const statusLabel = displayStatus !== 'active'
      ? displayStatus.replace('_', ' ')
      : '';
    const statusClass = displayStatus ? `pod-listing-status-${displayStatus.replace('_', '-')}` : '';
    const domain = pod.sourceDomain || (() => {
      try { return new URL(pod.ctaUrl).hostname.replace(/^www\./, ''); } catch { return ''; }
    })();
    const detailParts: string[] = [];
    if (details.beds) detailParts.push(`${details.beds} bd`);
    if (details.baths) detailParts.push(`${details.baths} ba`);
    if (details.sqft) detailParts.push(`${details.sqft} sqft`);

    // Format open house date/time for display
    const openHouseInfo = displayStatus === 'open_house' && pod.eventStart
      ? `${formatEventDate(pod.eventStart)} ${formatEventTime(pod.eventStart)}${pod.eventEnd ? ` – ${formatEventTime(pod.eventEnd)}` : ''}`
      : '';

    const card = (
      <div className={`pod fade-in ${delayClass}`}>
        {pod.label && <p className="pod-label">{pod.label}</p>}
        <div className="pod-listing">
          {statusLabel && pod.imageUrl && (
            <span className={`pod-listing-badge ${statusClass}`}>
              {statusLabel}
            </span>
          )}
          {pod.imageUrl && (
            <img src={pod.imageUrl} alt={pod.title || ''} className="pod-listing-img" referrerPolicy="no-referrer" />
          )}
          <div className="pod-listing-body">
            {statusLabel && !pod.imageUrl && (
              <span className={`pod-listing-badge-inline ${statusClass}`}>
                {statusLabel}
              </span>
            )}
            {pod.listingPrice && <p className="pod-listing-price">{pod.listingPrice}</p>}
            {pod.title && <h3 className="pod-listing-title">{pod.title}</h3>}
            {detailParts.length > 0 && (
              <p className="pod-listing-details">{detailParts.join(' \u00B7 ')}</p>
            )}
            {openHouseInfo && (
              <p className="pod-listing-open-house">{openHouseInfo}</p>
            )}
            {pod.body && <p className="pod-listing-desc">{pod.body}</p>}
            {domain && (
              <span className="pod-listing-source">{domain}</span>
            )}
          </div>
        </div>
      </div>
    );

    // Wrap in link if URL exists
    if (pod.ctaUrl) {
      return (
        <a href={pod.ctaUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
          {card}
        </a>
      );
    }
    return card;
  }

  if (pod.podType === 'music') {
    const artist = pod.tags || '';
    return (
      <div className={`pod fade-in ${delayClass}`}>
        {pod.label && <p className="pod-label">{pod.label}</p>}
        <div className="pod-music">
          <div className="pod-music-header">
            {pod.imageUrl ? (
              <img src={pod.imageUrl} alt={pod.title || ''} className="pod-music-art" referrerPolicy="no-referrer" />
            ) : (
              <div className="pod-music-art pod-music-art--placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
            )}
            <div className="pod-music-info">
              {pod.title && <h3 className="pod-music-title">{pod.title}</h3>}
              {artist && <p className="pod-music-artist">{artist}</p>}
            </div>
          </div>
          {pod.audioUrl && (
            <div className="pod-music-player">
              <audio controls src={pod.audioUrl} preload="metadata" style={{ width: '100%', height: 36 }} />
            </div>
          )}
          {pod.body && <p className="pod-music-desc">{pod.body}</p>}
          {pod.ctaUrl && (
            <a href={pod.ctaUrl} target="_blank" rel="noopener noreferrer" className="pod-music-link">
              {pod.ctaLabel || 'Listen'} →
            </a>
          )}
        </div>
      </div>
    );
  }

  if (pod.podType === 'event') {
    const state = getEventState(pod);
    const mapUrl = pod.eventAddress
      ? `https://maps.google.com/?q=${encodeURIComponent(pod.eventAddress)}`
      : '';
    const countdown = state === 'upcoming' && pod.eventStart ? formatEventCountdown(pod.eventStart) : '';
    const badgeLabel: Record<string, string> = {
      live: 'HAPPENING NOW',
      ended: 'ENDED',
      cancelled: 'CANCELLED',
      postponed: 'POSTPONED',
      sold_out: 'SOLD OUT',
    };
    const badgeClass = `pod-event-badge pod-event-badge--${state}`;
    const isInactive = state === 'ended' || state === 'cancelled';

    return (
      <div className={`pod fade-in ${delayClass}${isInactive ? ' pod-event--inactive' : ''}`}>
        {pod.label && <p className="pod-label">{pod.label}</p>}
        <div className="pod-event">
          {pod.imageUrl && (
            <div className="pod-event-img-wrap">
              <img src={pod.imageUrl} alt={pod.title || ''} className="pod-event-img" referrerPolicy="no-referrer" />
              {badgeLabel[state] && (
                <span className={badgeClass}>{badgeLabel[state]}</span>
              )}
            </div>
          )}
          {!pod.imageUrl && badgeLabel[state] && (
            <span className={`${badgeClass} pod-event-badge--inline`}>{badgeLabel[state]}</span>
          )}
          <div className="pod-event-body">
            {pod.title && <h3 className="pod-event-title">{pod.title}</h3>}

            {/* Date/time row */}
            {pod.eventStart && (
              <div className="pod-event-datetime">
                <span className="pod-event-date">{formatEventDate(pod.eventStart)}</span>
                <span className="pod-event-time">
                  {formatEventTime(pod.eventStart)}
                  {pod.eventEnd && ` – ${formatEventTime(pod.eventEnd)}`}
                </span>
              </div>
            )}

            {/* Countdown */}
            {countdown && (
              <p className="pod-event-countdown">{countdown}</p>
            )}

            {/* Venue + address */}
            {(pod.eventVenue || pod.eventAddress) && (
              <div className="pod-event-location">
                {pod.eventVenue && <span className="pod-event-venue">{pod.eventVenue}</span>}
                {pod.eventAddress && (
                  mapUrl ? (
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="pod-event-address">
                      {pod.eventAddress}
                    </a>
                  ) : (
                    <span className="pod-event-address">{pod.eventAddress}</span>
                  )
                )}
              </div>
            )}

            {/* Description */}
            {pod.body && <p className="pod-event-desc">{pod.body}</p>}

            {/* CTA button */}
            {pod.ctaUrl && state !== 'ended' && state !== 'cancelled' && (
              <a href={pod.ctaUrl} target="_blank" rel="noopener noreferrer" className="pod-event-cta">
                {pod.ctaLabel || 'Get Tickets'} →
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
