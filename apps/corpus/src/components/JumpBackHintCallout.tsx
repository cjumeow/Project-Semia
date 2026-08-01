import type { ReactNode } from 'react';
import type { WebJumpBackHint } from '@semia/shared';

type JumpBackHintCalloutProps = {
  hint: WebJumpBackHint;
  action?: ReactNode;
};

const kindMeta: Record<
  WebJumpBackHint['kind'],
  { title: string; rail: string; surface: string; icon: string }
> = {
  uncertain: {
    title: 'Jump-back uncertain',
    rail: 'border-l-amber-600/70',
    surface: 'bg-amber-50/60',
    icon: 'text-amber-700',
  },
  failed: {
    title: 'Could not restore selection',
    rail: 'border-l-orange-600/70',
    surface: 'bg-orange-50/60',
    icon: 'text-orange-700',
  },
  unavailable: {
    title: 'Jump-back unavailable',
    rail: 'border-l-border-strong',
    surface: 'bg-canvas',
    icon: 'text-text-muted',
  },
};

export function JumpBackHintCallout({ hint, action }: JumpBackHintCalloutProps) {
  const meta = kindMeta[hint.kind];

  return (
    <div
      role="status"
      className={[
        'overflow-hidden rounded-lg border border-border',
        meta.surface,
      ].join(' ')}
    >
      <div
        className={[
          'flex gap-3 border-l-[3px] px-3 py-2.5',
          meta.rail,
        ].join(' ')}
      >
        <span className={['mt-0.5 shrink-0', meta.icon].join(' ')}>
          <HintIcon kind={hint.kind} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="semia-section-label text-[10px] text-text-secondary">
            {meta.title}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">
            {hint.message}
          </p>
        </div>
      </div>
      {action ? (
        <div className="border-t border-border/80 bg-surface/80 px-3 py-2">
          {action}
        </div>
      ) : null}
    </div>
  );
}

function HintIcon({ kind }: { kind: WebJumpBackHint['kind'] }) {
  if (kind === 'unavailable') {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
    );
  }

  if (kind === 'failed') {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
    );
  }

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
