import { SemiaLogo, SemiaLogoMark } from '../../../components/SemiaLogo';
import type { LogoVariantContent, LogoVariantProps } from '../logoTypes';

function Mark({ size = 'md' }: LogoVariantProps) {
  const semiaSize =
    size === 'sm' ? 'sm' : size === 'lg' || size === 'xl' ? 'lg' : 'md';
  const scale =
    size === 'xl' ? 56 / 32 : size === 'lg' ? 40 / 32 : undefined;

  return (
    <SemiaLogoMark
      size={semiaSize}
      style={
        scale
          ? { width: size === 'xl' ? 56 : 40, height: size === 'xl' ? 56 : 40 }
          : undefined
      }
    />
  );
}

function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`font-mono font-semibold tracking-[0.18em] ${className}`}
      style={{ marginTop: '0.5px' }}
    >
      SEMIA
    </span>
  );
}

function Lockup({ size = 'md', showWordmark = true }: LogoVariantProps) {
  if (size === 'xl') {
    return (
      <div className="flex items-center" style={{ gap: 14 }}>
        <Mark size="xl" />
        {showWordmark ? (
          <Wordmark className="text-2xl tracking-[0.2em] text-text" />
        ) : null}
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className="flex items-center" style={{ gap: 11 }}>
        <Mark size="lg" />
        {showWordmark ? (
          <Wordmark className="text-lg tracking-[0.2em] text-text" />
        ) : null}
      </div>
    );
  }

  return (
    <SemiaLogo
      size={size === 'sm' ? 'sm' : 'md'}
      showWordmark={showWordmark}
    />
  );
}

export const variantB: LogoVariantContent = {
  name: 'Selection',
  tagline:
    'Bracket capture + highlight bar — literally what the extension does. Mono wordmark, archival tooling vibe. Best for: power users who live in the browser.',
  Mark,
  Wordmark,
  Lockup,
};
