import type { LogoVariantContent, LogoVariantProps } from '../logoTypes';

/** A — Pause Point: semicolon as the smallest unit of meaning in immersion. */
function Mark({ size = 'md' }: LogoVariantProps) {
  const px = size === 'sm' ? 20 : size === 'lg' ? 40 : size === 'xl' ? 56 : 28;
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
    >
      <rect width="48" height="48" rx="12" fill="#2f5233" />
      <circle cx="24" cy="14" r="3.5" fill="#e4ede6" />
      <path
        d="M24 22c-4 0-6 2.5-6 6 0 3.5 2.5 6 6 6"
        stroke="#e4ede6"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "'Syne', var(--font-display)",
        fontWeight: 800,
        letterSpacing: '-0.04em',
      }}
    >
      SEMIA
    </span>
  );
}

function Lockup({ size = 'md', showWordmark = true }: LogoVariantProps) {
  const wordClass =
    size === 'xl'
      ? 'text-3xl'
      : size === 'lg'
        ? 'text-xl'
        : size === 'sm'
          ? 'text-sm'
          : 'text-base';
  const gap = size === 'xl' ? 14 : size === 'lg' ? 10 : size === 'sm' ? 6 : 8;
  return (
    <div className="flex items-center" style={{ gap }}>
      <Mark size={size} />
      {showWordmark ? (
        <Wordmark className={`text-text ${wordClass}`} />
      ) : null}
    </div>
  );
}

export const variantA: LogoVariantContent = {
  name: 'Pause Point',
  tagline:
    'A semicolon mark — the breath between immersion and understanding. Syne wordmark, forest green tile. Best for: product that feels precise and literary.',
  Mark,
  Wordmark,
  Lockup,
};
