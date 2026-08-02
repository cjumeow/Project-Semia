import type { LogoVariantContent, LogoVariantProps } from '../logoTypes';

/** C — Transcript Arc: spoken immersion, waveform through a listening circle. */
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
      <circle cx="24" cy="24" r="22" stroke="#c4bbb0" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="18" fill="#e4ede6" />
      <path
        d="M10 24c3-8 8-12 14-12s11 4 14 12c-3 8-8 12-14 12s-11-4-14-12Z"
        fill="#2f5233"
        opacity="0.12"
      />
      <path
        d="M12 26c2.5-5 6.5-8 12-8s9.5 3 12 8"
        stroke="#2f5233"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M14 22c2-3.5 5-5.5 10-5.5s8 2 10 5.5"
        stroke="#2f5233"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <circle cx="24" cy="24" r="3" fill="#2f5233" />
    </svg>
  );
}

function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={className}>
      <span
        className="font-reading italic text-accent"
        style={{ fontWeight: 600 }}
      >
        S
      </span>
      <span
        className="font-display font-semibold tracking-tight text-text"
        style={{ marginLeft: '-0.05em' }}
      >
        EMIA
      </span>
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
      {showWordmark ? <Wordmark className={wordClass} /> : null}
    </div>
  );
}

export const variantC: LogoVariantContent = {
  name: 'Transcript Arc',
  tagline:
    'Listening circle + wave — YouTube and spoken immersion. Serif S leads the wordmark. Best for: emphasizing audio / video learning over static text.',
  Mark,
  Wordmark,
  Lockup,
};
