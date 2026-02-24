'use client';

import { useState, useEffect } from 'react';

interface GalleryImage {
  id: string;
  category: string;
  url: string;
  thumbnail_url?: string;
  label?: string;
}

interface GalleryPickerProps {
  category: 'cover' | 'background';
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function GalleryPicker({ category, onSelect, onClose }: GalleryPickerProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/gallery?category=${category}`)
      .then(r => r.json())
      .then(data => { setImages(data.images || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category]);

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
          maxWidth: 480,
          width: '90vw',
          maxHeight: '70vh',
          overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
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
            }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>
        ) : images.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <p style={{ color: 'var(--text-muted, #5d6370)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Gallery coming soon.
            </p>
            <p style={{ color: 'var(--text-muted, #5d6370)', fontSize: '0.8125rem' }}>
              Upload your own for now!
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '0.5rem',
          }}>
            {images.map(img => (
              <button
                key={img.id}
                onClick={() => onSelect(img.url)}
                style={{
                  background: 'none',
                  border: '2px solid transparent',
                  borderRadius: '0.5rem',
                  padding: 0,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  aspectRatio: category === 'cover' ? '16/9' : '3/4',
                }}
              >
                <img
                  src={img.thumbnail_url || img.url}
                  alt={img.label || ''}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
