'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface ImageCropperProps {
  src: string;
  frameShape: 'circle' | 'square' | 'banner' | 'portrait';
  positionX: number;   // 0-100
  positionY: number;   // 0-100
  zoom: number;        // 100-300
  onPositionChange: (x: number, y: number) => void;
  onZoomChange: (zoom: number) => void;
  photoShape?: string;
  photoRadius?: number;
  disabled?: boolean;
  showZoom?: boolean;
}

const FRAME_SIZES: Record<string, { w: number; h: number; mobileW?: number; mobileH?: number }> = {
  circle:   { w: 180, h: 180, mobileW: 140, mobileH: 140 },
  square:   { w: 180, h: 180, mobileW: 140, mobileH: 140 },
  banner:   { w: 320, h: 120 },
  portrait: { w: 140, h: 240 },
};

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export default function ImageCropper({
  src,
  frameShape,
  positionX,
  positionY,
  zoom,
  onPositionChange,
  onZoomChange,
  photoShape,
  photoRadius,
  disabled = false,
  showZoom = true,
}: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile for responsive frame sizes
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 480px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Frame dimensions
  const frame = FRAME_SIZES[frameShape];
  const fw = (isMobile && frame.mobileW) ? frame.mobileW : frame.w;
  const fh = (isMobile && frame.mobileH) ? frame.mobileH : frame.h;

  // Border radius for the frame
  let borderRadius: string;
  let clipPath: string | undefined;
  if (frameShape === 'circle') {
    if (photoShape === 'hexagon') {
      borderRadius = '0';
      clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
    } else if (photoShape === 'diamond') {
      borderRadius = '0';
      clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    } else if (photoShape === 'square') {
      borderRadius = `${photoRadius ?? 12}%`;
    } else {
      borderRadius = `${photoRadius ?? 50}%`;
    }
  } else if (frameShape === 'banner' || frameShape === 'portrait') {
    borderRadius = '0.5rem';
  } else {
    borderRadius = '0.5rem';
  }

  // Sensitivity: higher zoom = less position change per pixel drag
  const sensitivity = useCallback(() => {
    const zoomFactor = zoom / 100;
    const baseDim = Math.min(fw, fh);
    return 100 / (baseDim * zoomFactor);
  }, [zoom, fw, fh]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: positionX,
      startPosY: positionY,
    };
    setIsDragging(true);
  }, [disabled, positionX, positionY]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const s = sensitivity();
    // Invert: drag right → decrease positionX (image moves right → we see more of the left)
    const newX = clamp(dragRef.current.startPosX - dx * s, 0, 100);
    const newY = clamp(dragRef.current.startPosY - dy * s, 0, 100);
    onPositionChange(Math.round(newX), Math.round(newY));
  }, [sensitivity, onPositionChange]);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
    setIsDragging(false);
  }, []);

  const containerStyle: React.CSSProperties = {
    width: frameShape === 'banner' ? '100%' : fw,
    height: fh,
    overflow: 'hidden',
    position: 'relative',
    borderRadius,
    clipPath,
    cursor: disabled ? 'default' : isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
    userSelect: 'none',
    margin: '0 auto',
    backgroundColor: 'var(--surface-hover, #1a2030)',
  };

  const imgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: `${positionX}% ${positionY}%`,
    transform: zoom > 100 ? `scale(${zoom / 100})` : undefined,
    transformOrigin: `${positionX}% ${positionY}%`,
    pointerEvents: 'none',
    display: 'block',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      {/* Frame */}
      <div
        ref={containerRef}
        style={containerStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <img src={src} alt="Crop preview" style={imgStyle} draggable={false} />

        {/* Hint overlay */}
        {!isDragging && !disabled && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            textAlign: 'center',
            padding: '0.25rem',
            fontSize: '0.6875rem',
            color: '#fff',
            background: 'rgba(0,0,0,0.45)',
            pointerEvents: 'none',
          }}>
            Drag to reposition
          </div>
        )}
      </div>

      {/* Zoom slider */}
      {showZoom && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          width: frameShape === 'banner' ? '100%' : fw,
          maxWidth: '100%',
        }}>
          {/* Zoom out icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted, #5d6370)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          <input
            type="range"
            min={100}
            max={300}
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            disabled={disabled}
            style={{ flex: 1, accentColor: 'var(--accent, #6c63ff)' }}
          />
          {/* Zoom in icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted, #5d6370)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
      )}
    </div>
  );
}
