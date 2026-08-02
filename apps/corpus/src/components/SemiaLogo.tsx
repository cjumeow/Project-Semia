import type { CSSProperties } from 'react';

export type SemiaLogoSize = 'sm' | 'md' | 'lg';

const MARK_PX: Record<SemiaLogoSize, number> = {
  sm: 20,
  md: 26,
  lg: 32,
};

const WORD_CLASS: Record<SemiaLogoSize, string> = {
  sm: 'text-[11px] tracking-[0.16em]',
  md: 'text-[1.0625rem] tracking-[0.18em]',
  lg: 'text-xl tracking-[0.2em]',
};

const GAP_PX: Record<SemiaLogoSize, number> = {
  sm: 7,
  md: 9,
  lg: 11,
};

type SemiaLogoProps = {
  size?: SemiaLogoSize;
  showWordmark?: boolean;
  className?: string;
};

/**
 * SEMIA lockup — Selection (B): bracket capture mark + mono wordmark.
 * Mark uses filled geometry for crisp rendering down to 16px.
 */
export function SemiaLogo({
  size = 'md',
  showWordmark = true,
  className = '',
}: SemiaLogoProps) {
  const gap = GAP_PX[size];

  return (
    <div
      className={['inline-flex items-center', className].filter(Boolean).join(' ')}
      style={{ gap }}
      aria-label={showWordmark ? undefined : 'SEMIA'}
    >
      <SemiaLogoMark size={size} />
      {showWordmark ? (
        <span
          className={[
            'font-mono font-semibold leading-none text-text',
            WORD_CLASS[size],
          ].join(' ')}
          style={{ marginTop: '0.5px' }}
        >
          SEMIA
        </span>
      ) : null}
    </div>
  );
}

export function SemiaLogoMark({
  size = 'md',
  className = '',
  style,
}: {
  size?: SemiaLogoSize;
  className?: string;
  style?: CSSProperties;
}) {
  const px = MARK_PX[size];

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={['shrink-0', className].filter(Boolean).join(' ')}
      style={style}
      aria-hidden
    >
      <rect
        x="1"
        y="1"
        width="46"
        height="46"
        rx="8"
        className="fill-surface stroke-accent"
        strokeWidth="1.75"
      />
      <g className="fill-accent">
        {/* Left bracket — filled rects overlap at joints to avoid hairline gaps */}
        <rect x="12.5" y="12.5" width="2.5" height="23" rx="1.25" />
        <rect x="12.5" y="12.5" width="7.25" height="2.5" rx="1.25" />
        <rect x="12.5" y="33" width="7.25" height="2.5" rx="1.25" />
        {/* Right bracket */}
        <rect x="33" y="12.5" width="2.5" height="23" rx="1.25" />
        <rect x="28.25" y="12.5" width="7.25" height="2.5" rx="1.25" />
        <rect x="28.25" y="33" width="7.25" height="2.5" rx="1.25" />
        {/* Selection highlight — centered in the bracket gap */}
        <rect x="20.5" y="21" width="7" height="4" rx="2" />
      </g>
    </svg>
  );
}
