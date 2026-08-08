import { useEffect, useRef, useState } from 'react';
import { ChevronToggleIcon } from '../shared/ChevronToggleIcon';
import type { SlimContextSnippet } from './contextBarSlimShared';
import { truncateForSwitchLine } from './contextBarSlimShared';
import type { ContextBarSlimVariantKey } from './contextBarSlimVariants';

type SlimContextBarProps = {
  variant: ContextBarSlimVariantKey;
  snippets: SlimContextSnippet[];
  activeSnippetId: string;
  onSelectSnippet: (id: string) => void;
};

function ContextPicker({
  snippets,
  activeSnippetId,
  onSelect,
  fullWidth = false,
}: {
  snippets: SlimContextSnippet[];
  activeSnippetId: string;
  onSelect: (id: string) => void;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={[
        'proto-slim-picker absolute left-0 top-full z-30 mt-1 rounded-lg border border-border bg-surface p-2 shadow-lg',
        fullWidth ? 'w-full min-w-[14rem]' : 'w-64',
      ].join(' ')}
      role="listbox"
      aria-label="Switch context"
    >
      <ul className="max-h-40 overflow-y-auto">
        {snippets.map((snippet) => {
          const active = snippet.id === activeSnippetId;
          return (
            <li key={snippet.id}>
              <button
                type="button"
                role="option"
                aria-selected={active}
                className={[
                  'w-full rounded-md px-2 py-1.5 text-left text-xs font-reading transition-colors',
                  active
                    ? 'bg-accent-soft text-text'
                    : 'text-text-secondary hover:bg-canvas hover:text-text',
                ].join(' ')}
                onClick={() => onSelect(snippet.id)}
              >
                {snippet.selectedText}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function useContextPicker(
  snippets: SlimContextSnippet[],
  activeSnippetId: string,
  onSelectSnippet: (id: string) => void,
  options?: { fullWidthPicker?: boolean },
) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active =
    snippets.find((snippet) => snippet.id === activeSnippetId) ?? snippets[0];

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  const picker = open ? (
    <ContextPicker
      snippets={snippets}
      activeSnippetId={activeSnippetId}
      fullWidth={options?.fullWidthPicker}
      onSelect={(id) => {
        onSelectSnippet(id);
        setOpen(false);
      }}
    />
  ) : null;

  return { open, setOpen, rootRef, active, picker };
}

/** A — Gemini: ~28px gray pill, 12px muted, ▼ */
export function VariantAContextBar({
  snippets,
  activeSnippetId,
  onSelectSnippet,
}: Omit<SlimContextBarProps, 'variant'>) {
  const { open, setOpen, rootRef, active, picker } = useContextPicker(
    snippets,
    activeSnippetId,
    onSelectSnippet,
  );

  return (
    <div className="sticky top-0 z-10 -mx-4 mb-2 bg-surface/95 px-4 py-1.5 backdrop-blur-sm">
      <div ref={rootRef} className="relative">
        <button
          type="button"
          className="proto-slim-badge-a flex h-7 w-full max-w-full items-center gap-1.5 rounded-full bg-canvas px-2.5 text-left transition-colors hover:bg-canvas/80"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="min-w-0 flex-1 truncate text-xs text-text-muted">
            {active?.selectedText}
          </span>
          <span className="shrink-0 text-[10px] leading-none text-text-muted/80" aria-hidden>
            ▼
          </span>
        </button>
        {picker}
      </div>
    </div>
  );
}

/** B — chevron + Context | snippet; w-fit pill, flush sticky top */
export function VariantBContextBar({
  snippets,
  activeSnippetId,
  onSelectSnippet,
}: Omit<SlimContextBarProps, 'variant'>) {
  const { open, setOpen, rootRef, active, picker } = useContextPicker(
    snippets,
    activeSnippetId,
    onSelectSnippet,
    { fullWidthPicker: true },
  );

  return (
    <div className="sticky top-0 z-10 bg-surface/80 px-3 py-1.5 backdrop-blur-sm">
      <div
        ref={rootRef}
        className="relative inline-flex w-fit max-w-[85%] min-w-0 items-center"
      >
        <button
          type="button"
          className="proto-slim-badge-b inline-flex h-7 w-fit max-w-full min-w-0 items-center gap-1.5 rounded-full border border-border bg-canvas/90 px-2.5 text-left transition-colors hover:border-accent/30"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <ChevronToggleIcon expanded={open} className="h-2.5 w-2.5" />
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="shrink-0 text-[10px] font-medium text-text-muted">
              Context
            </span>
            <span className="shrink-0 text-[10px] text-text-muted/40" aria-hidden>
              |
            </span>
            <span className="min-w-0 truncate text-xs text-text-secondary">
              {active?.selectedText}
            </span>
          </span>
        </button>
        {picker}
      </div>
    </div>
  );
}

/** C — 24px ghost strip, no label */
export function VariantCContextBar({
  snippets,
  activeSnippetId,
  onSelectSnippet,
}: Omit<SlimContextBarProps, 'variant'>) {
  const { open, setOpen, rootRef, active, picker } = useContextPicker(
    snippets,
    activeSnippetId,
    onSelectSnippet,
    { fullWidthPicker: true },
  );

  return (
    <div className="sticky top-0 z-10 -mx-4 mb-1.5 bg-surface/90 px-4 py-1 backdrop-blur-sm">
      <div ref={rootRef} className="relative">
        <button
          type="button"
          className="proto-slim-badge-c flex h-6 w-full items-center gap-2 rounded-md bg-canvas/70 px-2 text-left transition-colors hover:bg-canvas"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="min-w-0 flex-1 truncate text-xs text-text-muted">
            {active?.selectedText}
          </span>
          <ChevronToggleIcon expanded={open} className="h-3 w-3" />
        </button>
        {picker}
      </div>
    </div>
  );
}

export function VariantAContextSwitchLine({ text }: { text: string }) {
  const short = truncateForSwitchLine(text);
  return (
    <li className="py-1 text-center text-xs text-text-muted" role="status">
      ─── 切換上下文至 &quot;{short}&quot; ───
    </li>
  );
}

export function VariantBContextSwitchLine({ text }: { text: string }) {
  const short = truncateForSwitchLine(text, 24);
  return (
    <li className="flex items-center gap-2 py-1.5" role="status">
      <span className="h-px flex-1 bg-border" aria-hidden />
      <span className="shrink-0 text-xs text-text-muted">
        切換至 &quot;{short}&quot;
      </span>
      <span className="h-px flex-1 bg-border" aria-hidden />
    </li>
  );
}

export function VariantCContextSwitchLine({ text }: { text: string }) {
  const short = truncateForSwitchLine(text, 32);
  return (
    <li className="py-0.5 text-[11px] text-text-muted" role="status">
      <span className="text-text-muted/50" aria-hidden>
        ·{' '}
      </span>
      Context →{' '}
      <span className="font-reading text-text-secondary">&quot;{short}&quot;</span>
    </li>
  );
}

export function SlimContextBar({
  variant,
  snippets,
  activeSnippetId,
  onSelectSnippet,
}: SlimContextBarProps) {
  if (variant === 'A') {
    return (
      <VariantAContextBar
        snippets={snippets}
        activeSnippetId={activeSnippetId}
        onSelectSnippet={onSelectSnippet}
      />
    );
  }
  if (variant === 'B') {
    return (
      <VariantBContextBar
        snippets={snippets}
        activeSnippetId={activeSnippetId}
        onSelectSnippet={onSelectSnippet}
      />
    );
  }
  return (
    <VariantCContextBar
      snippets={snippets}
      activeSnippetId={activeSnippetId}
      onSelectSnippet={onSelectSnippet}
    />
  );
}

export function SlimContextSwitchLine({
  variant,
  text,
}: {
  variant: ContextBarSlimVariantKey;
  text: string;
}) {
  if (variant === 'A') return <VariantAContextSwitchLine text={text} />;
  if (variant === 'B') return <VariantBContextSwitchLine text={text} />;
  return <VariantCContextSwitchLine text={text} />;
}
