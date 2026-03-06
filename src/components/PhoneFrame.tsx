'use client';

import { ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: { width: 280, height: 600, borderRadius: '2.25rem', padding: 8, notchWidth: 70, notchHeight: 20 },
  md: { width: 340, height: 720, borderRadius: '2.75rem', padding: 10, notchWidth: 85, notchHeight: 24 },
  lg: { width: 375, height: 812, borderRadius: '3rem', padding: 12, notchWidth: 100, notchHeight: 28 },
};

export default function PhoneFrame({ children, size = 'md', className = '' }: PhoneFrameProps) {
  const s = SIZES[size];

  return (
    <div className={`phone-frame-wrap ${className}`} style={{ width: s.width }}>
      <div
        className="phone-frame"
        style={{
          width: s.width,
          height: s.height,
          borderRadius: s.borderRadius,
          padding: s.padding,
        }}
      >
        <div
          className="phone-frame-notch"
          style={{
            width: s.notchWidth,
            height: s.notchHeight,
            borderRadius: s.notchHeight / 2,
          }}
        />
        <div
          className="phone-frame-screen"
          style={{
            borderRadius: `calc(${s.borderRadius} - ${s.padding}px)`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
