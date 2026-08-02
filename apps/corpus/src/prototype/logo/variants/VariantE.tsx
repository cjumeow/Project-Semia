import type { LogoVariantContent, LogoVariantProps } from '../logoTypes';

/** E — Snippet Tab: index card from the library shelf. */
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
      <rect x="8" y="6" width="32" height="38" rx="4" fill="#fffcf7" stroke="#c4bbb0" strokeWidth="1.5" />
      <path d="M32 6h4v8h-8V6h4Z" fill="#ebe5db" stroke="#c4bbb0" strokeWidth="1" />
      <rect x="13" y="18" width="18" height="2.5" rx="1" fill="#2f5233" />
      <rect x="13" y="24" width="14" height="2" rx="1" fill="#ddd6cc" />
      <rect x="13" y="29" width="16" height="2" rx="1" fill="#ddd6cc" />
      <rect x="6" y="10" width="3" height="28" rx="1.5" fill="#2f5233" />
    </svg>
  );
}

function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display font-semibold tracking-tight ${className}`}>
      <span className="text-accent">S</span>
      <span className="text-text">EMIA</span>
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

export const variantE: LogoVariantContent = {
  name: 'Snippet Tab',
  tagline:
    'Index card on the shelf — your captured snippets as tangible artifacts. Accent S in DM Sans. Best for: aligning with Library / Review Queue corpus metaphor.',
  Mark,
  Wordmark,
  Lockup,
};
