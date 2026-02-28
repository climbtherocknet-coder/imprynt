'use client';

import { useState, useRef, useCallback } from 'react';

interface CoverPreviewProps {
  src: string;
  positionX: number;   // 0-100
  positionY: number;   // 0-100
  zoom: number;        // 100-300
  opacity: number;     // 10-100
  onPositionChange: (x: number, y: number) => void;
  onZoomChange: (zoom: number) => void;
  // Hero overlay data
  photoUrl?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  company?: string;
  statusTags?: string[];
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export default function CoverPreview({
  src,
  positionX,
  positionY,
  zoom,
  opacity,
  onPositionChange,
  onZoomChange,
  photoUrl,
  firstName,
  lastName,
  title,
  company,
  statusTags,
}: CoverPreviewProps) {
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const sensitivity = useCallback(() => {
    const zoomFactor = zoom / 100;
    return 100 / (200 * zoomFactor);
  }, [zoom]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, startPosX: positionX, startPosY: positionY };
    setIsDragging(true);
  }, [positionX, positionY]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const s = sensitivity();
    const newX = clamp(dragRef.current.startPosX - dx * s, 0, 100);
    const newY = clamp(dragRef.current.startPosY - dy * s, 0, 100);
    onPositionChange(Math.round(newX), Math.round(newY));
  }, [sensitivity, onPositionChange]);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
    setIsDragging(false);
  }, []);

  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const subtitle = [title, company].filter(Boolean).join(' · ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      {/* Phone-ratio frame */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '9 / 16',
          maxHeight: 360,
          borderRadius: '0.5rem',
          overflow: 'hidden',
          border: '1px solid var(--border, #1e2535)',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
          backgroundColor: 'var(--surface-hover, #1a2030)',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Cover image layer (CSS background, matching live profile) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('${src}')`,
          backgroundSize: zoom > 100 ? `${zoom}%` : 'cover',
          backgroundPosition: `${positionX}% ${positionY}%`,
          backgroundRepeat: 'no-repeat',
          opacity: opacity / 100,
          pointerEvents: 'none',
        }} />

        {/* Gradient overlay (matches live profile ::after) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 30%, var(--bg, #0c1017) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Mini hero content (non-interactive, visual reference only) */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          height: '100%',
          padding: '1rem',
          pointerEvents: 'none',
        }}>
          {/* Status tags */}
          {statusTags && statusTags.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '0.75rem',
              left: '0.75rem',
              right: '0.75rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.25rem',
            }}>
              {statusTags.slice(0, 4).map((tag, i) => (
                <span key={i} style={{
                  fontSize: '0.5rem',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '9999px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)',
                }}>
                  {'\u2022'} {tag}
                </span>
              ))}
            </div>
          )}

          {/* Mini hero */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt=""
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(255,255,255,0.15)',
                  flexShrink: 0,
                }}
              />
            )}
            <div>
              {fullName && (
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#fff' }}>
                  {fullName}
                </div>
              )}
              {subtitle && (
                <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>
                  {subtitle}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drag hint */}
        {!isDragging && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            textAlign: 'center',
            padding: '0.375rem',
            pointerEvents: 'none',
          }}>
            <span style={{
              fontSize: '0.5625rem',
              color: 'rgba(255,255,255,0.6)',
              background: 'rgba(0,0,0,0.4)',
              padding: '0.125rem 0.5rem',
              borderRadius: '9999px',
            }}>
              Drag to reposition
            </span>
          </div>
        )}
      </div>

      {/* Zoom slider */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        width: '100%',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted, #5d6370)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" />
        </svg>
        <input
          type="range"
          min={100}
          max={300}
          value={zoom}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--accent, #6c63ff)' }}
        />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted, #5d6370)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </div>
    </div>
  );
}
