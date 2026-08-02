import type { LogoVariantContent, LogoVariantProps } from '../logoTypes';

/** D — Layered S: two language layers overlapping in one monogram. */
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
      <rect width="48" height="48" rx="14" fill="#1c1917" />
      <path
        d="M30 12c-6 0-10 3.5-10 9 0 4 2.5 6.5 7 8l-4 11h6l3.5-10c5.5-1.5 9-5.5 9-11 0-4.5-3.5-7-11.5-7Z"
        fill="none"
        stroke="#78716c"
        strokeWidth="3"
        strokeLinejoin="round"
        transform="translate(2, 1)"
      />
      <path
        d="M28 12c-6 0-10 3.5-10 9 0 4 2.5 6.5 7 8l-4 11h6l3.5-10c5.5-1.5 9-5.5 9-11 0-4.5-3.5-7-11.5-7Z"
        fill="none"
        stroke="#e4ede6"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "'Bricolage Grotesque', var(--font-display)",
        fontWeight: 700,
        letterSpacing: '-0.03em',
      }}
    >
      semia
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
        <Wordmark className={`lowercase text-text ${wordClass}`} />
      ) : null}
    </div>
  );
}

export const variantD: LogoVariantContent = {
  name: 'Layered S',
  tagline:
    'Double-stroke monogram on ink — L1 and L2 occupying the same shape. Lowercase Bricolage wordmark. Best for: modern SaaS, bilingual depth, extension icon on dark chrome.',
  Mark,
  Wordmark,
  Lockup,
};
