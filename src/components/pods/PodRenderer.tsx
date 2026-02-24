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
    return (
      <div className={`pod fade-in ${delayClass}`}>
        {pod.label && <p className="pod-label">{pod.label}</p>}
        <a href={pod.ctaUrl} target="_blank" rel="noopener noreferrer" className="pod-link-preview">
          {pod.imageUrl && (
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

  return null;
}
