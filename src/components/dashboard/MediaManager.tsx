'use client';
import { useState, useEffect, useRef } from 'react';

interface MediaItem {
  id: string;
  filename: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  url: string;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
}

interface StorageUsage {
  bytes: number;
  limit: number;
  percent: number;
}

export default function MediaManager() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [usage, setUsage] = useState<StorageUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/media')
      .then(r => r.json())
      .then(data => {
        setMedia(data.media || []);
        setUsage(data.usage || null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File must be under 10MB');
      return;
    }

    setUploading(true);
    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch('/api/media', { method: 'POST', body: form });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Upload failed');
        return;
      }

      setMedia(prev => [data.media, ...prev]);
      setUsage(data.usage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm(`Delete "${item.original_filename || item.filename}"? If this image is used on your profile, it will be removed.`)) return;

    setDeleting(item.id);
    try {
      const res = await fetch(`/api/media/${item.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        setMedia(prev => prev.filter(m => m.id !== item.id));
        setUsage(data.usage);
      }
    } finally {
      setDeleting(null);
    }
  }

  function formatSize(bytes: number): string {
    if (bytes === 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div>
      {/* Storage usage bar */}
      {usage && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <span>{formatSize(usage.bytes)} used</span>
            <span>{formatSize(usage.limit)} limit</span>
          </div>
          <div style={{
            height: 6,
            borderRadius: 3,
            background: 'var(--border, #1e2535)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(usage.percent, 100)}%`,
              borderRadius: 3,
              background: usage.percent > 90 ? '#ef4444' : usage.percent > 70 ? '#f59e0b' : 'var(--accent, #e8a849)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      )}

      {/* Upload button */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || (usage != null && usage.percent >= 100)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--accent)',
            background: 'var(--accent)',
            color: 'var(--bg)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: uploading ? 'wait' : 'pointer',
            opacity: uploading ? 0.6 : 1,
            fontFamily: 'inherit',
          }}
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
          JPEG, PNG, WebP, MP3. Max 10MB per file.
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,audio/mpeg"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* Media grid */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading...</p>
      ) : media.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No media uploaded yet.</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '0.75rem',
        }}>
          {media.map(item => (
            <div key={item.id} style={{
              position: 'relative',
              borderRadius: '0.5rem',
              border: '1px solid var(--border, #1e2535)',
              overflow: 'hidden',
              background: 'var(--surface, #161c28)',
            }}>
              {/* Thumbnail */}
              {item.mime_type?.startsWith('image/') ? (
                <img
                  src={item.thumbnail_url || item.url}
                  alt={item.original_filename || item.filename}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = 'none';
                    const parent = el.parentElement;
                    if (parent) {
                      const placeholder = document.createElement('div');
                      placeholder.style.cssText = 'width:100%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;color:#ef4444;font-size:0.625rem;text-align:center;padding:0.5rem';
                      placeholder.textContent = 'Broken image';
                      parent.insertBefore(placeholder, el);
                    }
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '1.5rem',
                }}>
                  &#9835;
                </div>
              )}

              {/* Info overlay */}
              <div style={{
                padding: '0.375rem',
                fontSize: '0.5625rem',
                color: 'var(--text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '70%',
                }}>
                  {item.original_filename || item.filename}
                </span>
                <span>{formatSize(item.file_size)}</span>
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(item)}
                disabled={deleting === item.id}
                style={{
                  position: 'absolute',
                  top: '0.25rem',
                  right: '0.25rem',
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  fontSize: '0.625rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: deleting === item.id ? 0.4 : 0.7,
                  transition: 'opacity 0.15s',
                  fontFamily: 'inherit',
                }}
                title="Delete"
              >
                &#10005;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
