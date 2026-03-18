'use client';

import { useState, useEffect } from 'react';
import type { PodData } from './PodRenderer';

interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  url: string;
  publishedAt: string;
}

export default function YouTubeChannelPod({ pod }: { pod: PodData }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!pod.ctaUrl) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    fetch('/api/youtube-feed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelUrl: pod.ctaUrl }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setVideos(data.videos || []);
        }
      })
      .catch(() => setError('Could not load videos. Check your channel URL in the editor.'))
      .finally(() => setLoading(false));
  }, [pod.ctaUrl]);

  const count = Math.min(parseInt(pod.title || '3') || 3, videos.length);
  const layout = pod.body === 'list' ? 'list' : 'grid';
  const displayVideos = videos.slice(0, count);

  if (!pod.ctaUrl) {
    return (
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        Add a YouTube channel URL in the editor to display your latest videos.
      </p>
    );
  }

  if (loading) {
    const skeletons = Array.from({ length: 3 });
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {skeletons.map((_, i) => (
          <div key={i} style={{
            aspectRatio: '16/9',
            borderRadius: '0.5rem',
            backgroundColor: 'var(--surface, #161c28)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        {error}
      </p>
    );
  }

  const playOverlay: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const titleClamp: React.CSSProperties = {
    fontSize: '0.8125rem',
    color: 'var(--text)',
    marginTop: '0.375rem',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: 1.3,
  };

  return (
    <div>
      {layout === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {displayVideos.map(v => (
            <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '0.5rem' }}>
                <img src={v.thumbnailUrl} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={playOverlay}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="6,3 20,12 6,21" /></svg>
                </div>
              </div>
              <p style={titleClamp}>{v.title}</p>
            </a>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {displayVideos.map(v => (
            <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
              <img src={v.thumbnailUrl} alt={v.title} style={{ width: 96, height: 54, borderRadius: '0.375rem', objectFit: 'cover', flexShrink: 0 }} />
              <p style={{ ...titleClamp, marginTop: 0, flex: 1 }}>{v.title}</p>
            </a>
          ))}
        </div>
      )}

      <a
        href={pod.ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'inline-block', fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.625rem', textDecoration: 'none' }}
      >
        View Channel →
      </a>
    </div>
  );
}
