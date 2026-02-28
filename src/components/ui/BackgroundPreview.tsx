'use client';

import { useState, useRef, useCallback } from 'react';

interface BackgroundPreviewProps {
  src: string;
  positionX: number;   // 0-100
  positionY: number;   // 0-100
  zoom: number;        // 100-300
  opacity: number;     // 5-100
  onPositionChange: (x: number, y: number) => void;
  onZoomChange: (zoom: number) => void;
  // Optional cover overlay for crossfade preview
  coverUrl?: string;
  coverPositionX?: number;
  coverPositionY?: number;
  coverZoom?: number;
  coverOpacity?: number;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export default function BackgroundPreview({
  src,
  positionX,
  positionY,
  zoom,
  opacity,
  onPositionChange,
  onZoomChange,
  coverUrl,
  coverPositionX = 50,
  coverPositionY = 50,
  coverZoom = 100,
  coverOpacity = 70,
}: BackgroundPreviewProps) {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      {/* Phone-ratio frame */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '9 / 16',
          maxHeight: 400,
          borderRadius: '0.5rem',
          overflow: 'hidden',
          border: '1px solid var(--border, #1e2535)',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
          backgroundColor: 'var(--bg, #0c1017)',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Background image layer */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `${positionX}% ${positionY}%`,
            opacity: opacity / 100,
            transform: zoom > 100 ? `scale(${zoom / 100})` : undefined,
            pointerEvents: 'none',
          }}
        />

        {/* Cover overlay in top portion (crossfade preview) */}
        {coverUrl && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40%',
            backgroundImage: `url('${coverUrl}')`,
            backgroundSize: coverZoom > 100 ? `${coverZoom}%` : 'cover',
            backgroundPosition: `${coverPositionX}% ${coverPositionY}%`,
            backgroundRepeat: 'no-repeat',
            opacity: coverOpacity / 100,
            maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
            pointerEvents: 'none',
          }} />
        )}

        {/* Mini content overlay for context */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem',
          pointerEvents: 'none',
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.2)',
            marginBottom: '0.375rem',
          }} />
          <div style={{
            fontSize: '0.5rem',
            color: 'rgba(255,255,255,0.4)',
            textAlign: 'center',
          }}>
            Content area
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
