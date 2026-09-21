import React, { useId } from 'react';
import {
  MARK_VIEWBOX, WORDMARK_VIEWBOX, GRADIENT, CAP_PATH, T_LEFT_PATH, T_RIGHT_PATH, WORDMARK_PATH,
} from './logoPaths.ts';

const [, , MW, MH] = MARK_VIEWBOX.split(' ').map(Number);
const [, , WW, WH] = WORDMARK_VIEWBOX.split(' ').map(Number);
const INK = '#151D2C';

export function LogoMark({ size = 32, className = '', decorative = false }: { size?: number; className?: string; decorative?: boolean }) {
  const gid = 'tw' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      width={(size * MW) / MH}
      height={size}
      className={className}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'Termwise'}
      aria-hidden={decorative || undefined}
      focusable="false"
    >
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={GRADIENT.x1} y1={GRADIENT.y1} x2={GRADIENT.x2} y2={GRADIENT.y2}>
          <stop offset="0" stopColor={GRADIENT.from} />
          <stop offset="1" stopColor={GRADIENT.to} />
        </linearGradient>
      </defs>
      <path fill="#192439" fillRule="evenodd" d={CAP_PATH} />
      <path fill="#18294A" fillRule="evenodd" d={T_LEFT_PATH} />
      <path fill={`url(#${gid})`} fillRule="evenodd" d={T_RIGHT_PATH} />
    </svg>
  );
}

export function Wordmark({ height = 16, className = '', color = INK }: { height?: number; className?: string; color?: string }) {
  return (
    <svg viewBox={WORDMARK_VIEWBOX} width={(height * WW) / WH} height={height} className={className} role="img" aria-label="Termwise" focusable="false">
      <path fill={color} fillRule="evenodd" d={WORDMARK_PATH} />
    </svg>
  );
}

/** mark: icon only. horizontal: mark + wordmark. stacked: mark above wordmark (as supplied). */
export function Logo({ variant = 'horizontal', size = 32, className = '' }: { variant?: 'mark' | 'horizontal' | 'stacked'; size?: number; className?: string }) {
  if (variant === 'mark') return <LogoMark size={size} className={className} />;
  if (variant === 'stacked') {
    return (
      <div className={`inline-flex flex-col items-center ${className}`} style={{ gap: Math.round(size * 0.12) }} role="img" aria-label="Termwise">
        <LogoMark size={size} decorative />
        <Wordmark height={Math.round(size * 0.34)} />
      </div>
    );
  }
  return (
    <div className={`inline-flex items-center ${className}`} style={{ gap: Math.round(size * 0.3) }} role="img" aria-label="Termwise">
      <LogoMark size={size} decorative />
      <span aria-hidden="true" className="inline-flex"><Wordmark height={Math.round(size * 0.5)} /></span>
    </div>
  );
}
