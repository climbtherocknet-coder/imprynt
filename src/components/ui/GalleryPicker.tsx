'use client';

import { useState, useEffect, useMemo, useRef } from 'react';

interface GalleryImage {
  id: string;
  category: string;
  url: string;
  thumbnail_url?: string;
  label?: string;
  tags?: string;
}

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

interface GalleryPickerProps {
  category: 'cover' | 'background' | 'profile';
  currentUrl?: string;
  onSelect: (url: string) => void;
  onClose: () => void;
  showMyMedia?: boolean;
}

const tabBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: '0.375rem 0.75rem',
  borderRadius: '9999px',
  border: `1px solid ${active ? 'var(--accent, #e8a849)' : 'var(--border-light, #283042)'}`,
  background: active ? 'var(--accent, #e8a849)' : 'transparent',
  color: active ? 'var(--bg, #0c1017)' : 'var(--text-muted, #5d6370)',
  fontSize: '0.75rem',
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
});

export default function GalleryPicker({ category, currentUrl, onSelect, onClose, showMyMedia }: GalleryPickerProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('');
  const [activeTab, setActiveTab] = useState<'gallery' | 'my-media'>('gallery');
  const [myMedia, setMyMedia] = useState<MediaItem[]>([]);
  const [myMediaLoading, setMyMediaLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/gallery?category=${category}`)
      .then(r => r.json())
      .then(data => { setImages(data.images || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category]);

  // Fetch my media when tab is activated
  useEffect(() => {
    if (activeTab === 'my-media' && myMedia.length === 0 && !myMediaLoading) {
      setMyMediaLoading(true);
      fetch('/api/media')
        .then(r => r.json())
        .then(data => {
          // Filter to only image types (not audio)
          const imageMedia = (data.media || []).filter((m: MediaItem) =>
            m.mime_type?.startsWith('image/')
          );
          setMyMedia(imageMedia);
        })
        .catch(() => {})
        .finally(() => setMyMediaLoading(false));
    }
  }, [activeTab, myMedia.length, myMediaLoading]);

  async function handleUploadInPicker(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('File must be under 10MB'); return; }
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/media', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Upload failed'); return; }
      const item = data.media as MediaItem;
      if (item.mime_type?.startsWith('image/')) {
        setMyMedia(prev => [item, ...prev]);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // Extract unique tags from images
  const tags = useMemo(() => {
    const tagSet = new Set<string>();
    images.forEach(img => {
      if (img.tags) {
        img.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => tagSet.add(t));
      }
    });
    return Array.from(tagSet).sort();
  }, [images]);

  // Filter images by active tag
  const filtered = useMemo(() => {
    if (!activeTag) return images;
    return images.filter(img =>
      img.tags?.split(',').map(t => t.trim()).includes(activeTag)
    );
  }, [images, activeTag]);

  const gridMin = category === 'cover' ? '180px' : '120px';
  const aspectRatio = category === 'cover' ? '16/9' : '3/4';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--surface, #161c28)',
          borderRadius: '1rem',
          border: '1px solid var(--border, #1e2535)',
          padding: '1.5rem',
          maxWidth: 720,
          width: '92vw',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexShrink: 0 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text, #eceef2)', margin: 0 }}>
            {category === 'cover' ? 'Cover Photos' : category === 'profile' ? 'Profile Photos' : 'Backgrounds'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted, #5d6370)',
              cursor: 'pointer',
              fontSize: '1.25rem',
              padding: '0.25rem',
              fontFamily: 'inherit',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs (Gallery / My Media) */}
        {showMyMedia && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexShrink: 0 }}>
            <button onClick={() => setActiveTab('gallery')} style={tabBtnStyle(activeTab === 'gallery')}>
              Gallery
            </button>
            <button onClick={() => setActiveTab('my-media')} style={tabBtnStyle(activeTab === 'my-media')}>
              My Media
            </button>
          </div>
        )}

        {/* Gallery tab */}
        {activeTab === 'gallery' && (
          <>
            {/* Tag filters */}
            {tags.length > 1 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.75rem', flexShrink: 0 }}>
                <button
                  onClick={() => setActiveTag('')}
                  style={{
                    padding: '0.25rem 0.625rem',
                    borderRadius: '9999px',
                    border: `1px solid ${!activeTag ? 'var(--accent, #e8a849)' : 'var(--border-light, #283042)'}`,
                    background: !activeTag ? 'var(--accent, #e8a849)' : 'transparent',
                    color: !activeTag ? 'var(--bg, #0c1017)' : 'var(--text-muted, #5d6370)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textTransform: 'capitalize',
                  }}
                >
                  All
                </button>
                {tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
                    style={{
                      padding: '0.25rem 0.625rem',
                      borderRadius: '9999px',
                      border: `1px solid ${activeTag === tag ? 'var(--accent, #e8a849)' : 'var(--border-light, #283042)'}`,
                      background: activeTag === tag ? 'var(--accent, #e8a849)' : 'transparent',
                      color: activeTag === tag ? 'var(--bg, #0c1017)' : 'var(--text-muted, #5d6370)',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      textTransform: 'capitalize',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Gallery image grid */}
            <div style={{ overflow: 'auto', flex: 1 }}>
              {loading ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</p>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <p style={{ color: 'var(--text-muted, #5d6370)', fontSize: '0.875rem' }}>
                    {images.length === 0 ? 'Gallery coming soon. Upload your own for now!' : 'No images match this filter.'}
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(auto-fill, minmax(${gridMin}, 1fr))`,
                  gap: '0.5rem',
                }}>
                  {filtered.map(img => {
                    const isSelected = currentUrl === img.url;
                    return (
                      <button
                        key={img.id}
                        onClick={() => onSelect(img.url)}
                        style={{
                          position: 'relative',
                          background: 'none',
                          border: `2px solid ${isSelected ? 'var(--accent, #e8a849)' : 'transparent'}`,
                          borderRadius: '0.5rem',
                          padding: 0,
                          cursor: 'pointer',
                          overflow: 'hidden',
                          aspectRatio,
                          transition: 'transform 0.15s, border-color 0.15s',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)';
                          if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light, #283042)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                          if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                        }}
                      >
                        <img
                          src={img.thumbnail_url || img.url}
                          alt={img.label || ''}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        {img.label && (
                          <span style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '0.75rem 0.5rem 0.375rem',
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                            color: '#fff',
                            fontSize: '0.6875rem',
                            fontWeight: 500,
                            textAlign: 'left',
                          }}>
                            {img.label}
                          </span>
                        )}
                        {isSelected && (
                          <span style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: 'var(--accent, #e8a849)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            color: 'var(--bg, #0c1017)',
                            fontWeight: 700,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                          }}>
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* My Media tab */}
        {activeTab === 'my-media' && (
          <div style={{ overflow: 'auto', flex: 1 }}>
            {/* Upload button */}
            <div style={{ marginBottom: '0.75rem' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--accent, #e8a849)',
                  background: 'var(--accent, #e8a849)',
                  color: 'var(--bg, #0c1017)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: uploading ? 'wait' : 'pointer',
                  opacity: uploading ? 0.6 : 1,
                  fontFamily: 'inherit',
                }}
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
              <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                JPEG, PNG, WebP. Max 10MB.
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleUploadInPicker}
                style={{ display: 'none' }}
              />
            </div>

            {myMediaLoading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</p>
            ) : myMedia.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <p style={{ color: 'var(--text-muted, #5d6370)', fontSize: '0.875rem' }}>
                  No uploaded images yet. Use the button above to upload.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fill, minmax(${gridMin}, 1fr))`,
                gap: '0.5rem',
              }}>
                {myMedia.map(item => {
                  const isSelected = currentUrl === item.url;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelect(item.url)}
                      style={{
                        position: 'relative',
                        background: 'none',
                        border: `2px solid ${isSelected ? 'var(--accent, #e8a849)' : 'transparent'}`,
                        borderRadius: '0.5rem',
                        padding: 0,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        aspectRatio,
                        transition: 'transform 0.15s, border-color 0.15s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)';
                        if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light, #283042)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                        if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.thumbnail_url || item.url}
                        alt={item.original_filename || item.filename}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      {isSelected && (
                        <span style={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: 'var(--accent, #e8a849)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          color: 'var(--bg, #0c1017)',
                          fontWeight: 700,
                          boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                        }}>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
