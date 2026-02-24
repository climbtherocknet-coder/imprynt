'use client';

import { useState, useEffect, useMemo } from 'react';

interface GalleryImage {
  id: string;
  category: string;
  url: string;
  thumbnail_url?: string;
  label?: string;
  tags?: string;
}

interface GalleryPickerProps {
  category: 'cover' | 'background';
  currentUrl?: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function GalleryPicker({ category, currentUrl, onSelect, onClose }: GalleryPickerProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('');

  useEffect(() => {
    fetch(`/api/gallery?category=${category}`)
      .then(r => r.json())
      .then(data => { setImages(data.images || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category]);

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
            {category === 'cover' ? 'Cover Photos' : 'Backgrounds'}
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

        {/* Image grid */}
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
              gridTemplateColumns: category === 'cover'
                ? 'repeat(auto-fill, minmax(180px, 1fr))'
                : 'repeat(auto-fill, minmax(120px, 1fr))',
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
                      aspectRatio: category === 'cover' ? '16/9' : '3/4',
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
                    {/* Label overlay */}
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
                    {/* Selected checkmark */}
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
      </div>
    </div>
  );
}
