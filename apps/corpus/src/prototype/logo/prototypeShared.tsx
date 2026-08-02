import type { ReactNode } from 'react';
import type { LogoVariantContent } from './logoTypes';

const SIZES = {
  sm: { mark: 20, gap: 6, word: 'text-sm' },
  md: { mark: 28, gap: 8, word: 'text-base' },
  lg: { mark: 40, gap: 10, word: 'text-xl' },
  xl: { mark: 56, gap: 12, word: 'text-3xl' },
} as const;

export function LogoLockup({
  variant,
  size = 'md',
}: {
  variant: LogoVariantContent;
  size?: keyof typeof SIZES;
}) {
  return <>{variant.Lockup({ size, showWordmark: true })}</>;
}

export function LogoPresentation({ variant }: { variant: LogoVariantContent }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-canvas">
      <div className="mx-auto max-w-4xl px-6 py-10 pb-28">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-text-muted">
          Logo prototype
        </p>
        <h1 className="mt-2 font-reading text-3xl font-semibold tracking-tight text-text">
          {variant.name}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
          {variant.tagline}
        </p>

        <section className="mt-10 rounded-2xl border border-border bg-surface p-10 shadow-sm">
          <p className="semia-section-label mb-6">Hero</p>
          <div className="flex min-h-[140px] items-center justify-center">
            <LogoLockup variant={variant} size="xl" />
          </div>
        </section>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <ContextCard title="Sidebar header">
            <div className="rounded-lg border border-border bg-shelf px-4 pb-4 pt-5">
              <LogoLockup variant={variant} size="md" />
              <p className="mt-3 text-xs text-text-muted">
                Snippets from your immersion
              </p>
            </div>
          </ContextCard>

          <ContextCard title="Extension toolbar">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
              <LogoLockup variant={variant} size="sm" />
              <span className="text-xs text-text-muted">Capture selection</span>
            </div>
          </ContextCard>

          <ContextCard title="App icon (32px)">
            <div className="flex items-center gap-4">
              <IconTile variant={variant} />
              <IconTile variant={variant} dark />
            </div>
          </ContextCard>

          <ContextCard title="Favicon (16px)">
            <div className="flex items-center gap-6">
              <FaviconTile variant={variant} />
              <FaviconTile variant={variant} dark />
            </div>
          </ContextCard>
        </div>

        <section className="mt-6 rounded-2xl border border-border bg-[#1c1917] p-8">
          <p className="mb-6 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-stone-500">
            On dark
          </p>
          <div className="flex items-center justify-center py-6">
            <div className="[&_*]:!text-stone-100 [&_svg]:brightness-110">
              <LogoLockup variant={variant} size="lg" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ContextCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <p className="semia-section-label mb-4">{title}</p>
      {children}
    </section>
  );
}

function IconTile({
  variant,
  dark = false,
}: {
  variant: LogoVariantContent;
  dark?: boolean;
}) {
  return (
    <div
      className={[
        'flex h-8 w-8 items-center justify-center rounded-lg',
        dark ? 'bg-[#1c1917]' : 'border border-border bg-canvas',
      ].join(' ')}
    >
      {variant.Mark({ size: 'sm' })}
    </div>
  );
}

function FaviconTile({
  variant,
  dark = false,
}: {
  variant: LogoVariantContent;
  dark?: boolean;
}) {
  return (
    <div
      className={[
        'flex h-4 w-4 items-center justify-center rounded-sm',
        dark ? 'bg-[#1c1917]' : 'border border-border bg-canvas',
      ].join(' ')}
      style={{ transform: 'scale(0.85)' }}
    >
      {variant.Mark({ size: 'sm' })}
    </div>
  );
}

export { SIZES };
