import { useRef, useState, type ReactNode } from 'react';
import { FOCUS_PICK_MOCK_SNIPPET } from './focusPickMockData';
import {
  extractKeywordChips,
  useFocusTextSelection,
  type FocusPickState,
  type FocusSelectionAnchor,
} from './focusPickShared';

type VariantProps = {
  state: FocusPickState;
  onFocusChange: (text: string, action: string) => void;
};

function FocusSetPopover({
  anchor,
  onSetFocus,
  onDismiss,
  compact = false,
}: {
  anchor: FocusSelectionAnchor;
  onSetFocus: () => void;
  onDismiss: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className="pointer-events-auto fixed z-50 -translate-x-1/2 -translate-y-full"
      style={{ top: anchor.top - 8, left: anchor.left }}
    >
      <button
        type="button"
        className={[
          'rounded-full border border-accent/40 bg-surface font-medium text-accent shadow-md transition-colors hover:bg-accent/10',
          compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]',
        ].join(' ')}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          onSetFocus();
          onDismiss();
          window.getSelection()?.removeAllRanges();
        }}
      >
        🎯 設為 Focus
      </button>
    </div>
  );
}

function SmartKeywordChips({
  chips,
  focusText,
  onPick,
  layout = 'row',
}: {
  chips: string[];
  focusText: string;
  onPick: (chip: string) => void;
  layout?: 'row' | 'wrap';
}) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div
      className={[
        'mt-2 flex gap-1.5',
        layout === 'wrap' ? 'flex-wrap items-center' : 'flex-wrap items-center',
      ].join(' ')}
    >
      <span className="text-[10px] text-text-muted">💡 快速選取 Focus:</span>
      {chips.map((chip) => {
        const active = focusText.toLowerCase() === chip.toLowerCase();
        return (
          <button
            key={chip}
            type="button"
            className={[
              'rounded-full border px-2.5 py-0.5 text-[11px] transition-colors',
              active
                ? 'border-accent/50 bg-accent/10 text-accent'
                : 'border-zinc-300/80 bg-zinc-100/80 text-text-secondary hover:border-zinc-400 hover:bg-zinc-200/60 dark:border-zinc-600 dark:bg-zinc-800/50 dark:hover:border-zinc-500',
            ].join(' ')}
            onClick={() => onPick(chip)}
          >
            {chip}
          </button>
        );
      })}
    </div>
  );
}

function SelectableContextBlock({
  text,
  onSetFocus,
  className = '',
  highlightChips = [] as string[],
}: {
  text: string;
  onSetFocus: (text: string, action: string) => void;
  className?: string;
  highlightChips?: string[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { anchor, clearAnchor, handleDoubleClick, handleMouseUp } =
    useFocusTextSelection(containerRef);

  const renderHighlighted = () => {
    if (highlightChips.length === 0) {
      return text;
    }

    const pattern = new RegExp(
      `(${highlightChips.map((chip) => chip.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
      'gi',
    );

    const parts = text.split(pattern);
    return parts.map((part, index) => {
      const isChip = highlightChips.some(
        (chip) => chip.toLowerCase() === part.toLowerCase(),
      );
      if (!isChip) {
        return <span key={`${part}-${index}`}>{part}</span>;
      }
      return (
        <button
          key={`${part}-${index}`}
          type="button"
          className="rounded-sm bg-amber-400/20 px-0.5 font-medium text-text underline decoration-amber-500/50 decoration-dotted underline-offset-2 hover:bg-amber-400/30"
          onClick={() => onSetFocus(part, `clicked inline keyword "${part}"`)}
        >
          {part}
        </button>
      );
    });
  };

  return (
    <>
      <div
        ref={containerRef}
        role="textbox"
        tabIndex={0}
        className={[
          'relative whitespace-pre-wrap text-sm leading-relaxed text-text selection:bg-accent/20',
          className,
        ].join(' ')}
        onDoubleClick={handleDoubleClick}
        onMouseUp={handleMouseUp}
      >
        {highlightChips.length > 0 ? renderHighlighted() : text}
      </div>
      {anchor ? (
        <FocusSetPopover
          anchor={anchor}
          onSetFocus={() =>
            onSetFocus(anchor.text, `selected "${anchor.text}" from context`)
          }
          onDismiss={clearAnchor}
        />
      ) : null}
    </>
  );
}

function ProtoStateBar({ state }: { state: FocusPickState }) {
  return (
    <div className="mt-4 rounded-lg border border-dashed border-border bg-canvas/60 px-3 py-2 font-mono text-[10px] text-text-muted">
      <p>
        focusText: <span className="text-text">{state.focusText || '∅'}</span>
      </p>
      <p className="mt-1">
        lastAction: <span className="text-text">{state.lastAction || '—'}</span>
      </p>
    </div>
  );
}

function CardEditorShell({
  children,
  headerNote,
}: {
  children: ReactNode;
  headerNote?: string;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="shrink-0 border-b border-border bg-canvas px-4 py-2">
        <p className="text-xs text-text-secondary">
          <span className="font-medium text-accent">Draft</span>
          <span className="text-text-muted"> — building new card</span>
        </p>
        {headerNote ? (
          <p className="mt-1 text-[10px] text-text-muted">{headerNote}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center justify-end border-b border-border px-4 py-2">
        <button
          type="button"
          className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-white"
        >
          Create
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  );
}

/** A — stacked card: Focus → chips → context inset (spec layout). */
export function VariantAFocusPick({ state, onFocusChange }: VariantProps) {
  const snippet = FOCUS_PICK_MOCK_SNIPPET;
  const chips = extractKeywordChips(snippet.originalSpeech);
  const [contextExpanded, setContextExpanded] = useState(true);

  return (
    <CardEditorShell headerNote="No modal · chips + context inset in card">
      <div className="language-card-editor-shelf">
        <article className="language-card-container space-y-4 p-4">
          <div>
            <label className="text-xs font-medium text-text-secondary">Focus</label>
            <input
              type="text"
              value={state.focusText}
              placeholder="Word or phrase from the capture"
              className="language-card-field-inset language-card-field-input mt-1 w-full rounded-lg border px-3 py-2 text-sm text-text"
              onChange={(event) =>
                onFocusChange(event.target.value, 'typed in Focus input')
              }
            />
            <SmartKeywordChips
              chips={chips}
              focusText={state.focusText}
              onPick={(chip) => onFocusChange(chip, `chip "${chip}"`)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary">Meaning</label>
            <div className="language-card-field-inset language-card-field-input mt-1 rounded-lg border px-3 py-2 text-sm text-text-muted">
              Explanation in your native language…
            </div>
          </div>

          <div className="rounded-lg border border-border bg-canvas/40">
            <button
              type="button"
              className="flex w-full items-center justify-between px-3 py-2 text-left"
              onClick={() => setContextExpanded((open) => !open)}
            >
              <span className="text-xs font-medium text-text-secondary">
                Context · double-click or select
              </span>
              <span className="text-[10px] text-text-muted">
                {contextExpanded ? '▼' : '▶'}
              </span>
            </button>
            {contextExpanded ? (
              <div className="border-t border-border px-3 py-3">
                <SelectableContextBlock
                  text={snippet.contextWindow}
                  className="max-h-40 overflow-y-auto rounded-md border border-border bg-surface px-3 py-2"
                  onSetFocus={onFocusChange}
                />
              </div>
            ) : null}
          </div>
        </article>
      </div>
      <ProtoStateBar state={state} />
    </CardEditorShell>
  );
}

/** B — context-first split: large speech panel above compact card. */
export function VariantBFocusPick({ state, onFocusChange }: VariantProps) {
  const snippet = FOCUS_PICK_MOCK_SNIPPET;
  const chips = extractKeywordChips(snippet.originalSpeech);
  const speechRef = useRef<HTMLDivElement>(null);
  const { anchor, clearAnchor, handleDoubleClick, handleMouseUp } =
    useFocusTextSelection(speechRef);
  const [stickySelection, setStickySelection] = useState<string | null>(null);

  const applyFocus = (text: string, action: string) => {
    onFocusChange(text, action);
    setStickySelection(text);
    clearAnchor();
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div className="flex min-h-[560px] flex-col gap-3">
      <div className="flex min-h-0 flex-[1.1] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
          <div>
            <p className="text-xs font-medium text-text">Original speech</p>
            <p className="text-[10px] text-text-muted">
              Primary pick surface · double-click or drag-select
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-1">
            {chips.slice(0, 4).map((chip) => (
              <button
                key={chip}
                type="button"
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-text-secondary hover:bg-zinc-200 dark:bg-zinc-800"
                onClick={() => applyFocus(chip, `header chip "${chip}"`)}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
        {stickySelection ? (
          <div className="shrink-0 border-b border-accent/20 bg-accent/5 px-4 py-1.5 text-[11px] text-accent">
            🎯 Pending: &quot;{stickySelection}&quot; → Focus field below
          </div>
        ) : null}
        <div className="relative min-h-0 flex-1 overflow-y-auto p-4">
          <div
            ref={speechRef}
            role="textbox"
            tabIndex={0}
            className="font-reading text-base leading-relaxed text-text selection:bg-accent/20"
            onDoubleClick={handleDoubleClick}
            onMouseUp={handleMouseUp}
          >
            {snippet.originalSpeech}
          </div>
          {anchor ? (
            <FocusSetPopover
              anchor={anchor}
              onSetFocus={() =>
                applyFocus(anchor.text, `selected "${anchor.text}" from speech`)
              }
              onDismiss={clearAnchor}
            />
          ) : null}
        </div>
      </div>

      <CardEditorShell headerNote="Compact card · chips duplicated under Focus">
        <div className="language-card-editor-shelf">
          <article className="language-card-container p-4">
            <label className="text-xs font-medium text-text-secondary">Focus</label>
            <input
              type="text"
              value={state.focusText}
              className="language-card-field-inset language-card-field-input mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              onChange={(event) =>
                onFocusChange(event.target.value, 'typed in Focus input')
              }
            />
            <SmartKeywordChips
              chips={chips}
              focusText={state.focusText}
              onPick={(chip) => applyFocus(chip, `chip "${chip}"`)}
            />
          </article>
        </div>
        <ProtoStateBar state={state} />
      </CardEditorShell>
    </div>
  );
}

/** C — inline highlights: AI keywords clickable in context; minimal popover. */
export function VariantCFocusPick({ state, onFocusChange }: VariantProps) {
  const snippet = FOCUS_PICK_MOCK_SNIPPET;
  const chips = extractKeywordChips(snippet.originalSpeech);

  return (
    <CardEditorShell headerNote="Keywords highlighted in context · chips as fallback">
      <div className="language-card-editor-shelf">
        <article className="language-card-container space-y-4 p-4">
          <div className="rounded-lg border border-border bg-canvas/30 p-3">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-text-muted">
              Snip · original speech
            </p>
            <SelectableContextBlock
              text={snippet.originalSpeech}
              highlightChips={chips}
              onSetFocus={onFocusChange}
            />
            <p className="mt-2 text-xs text-text-muted">
              Tap highlighted words or select any phrase → 🎯
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary">Focus</label>
            <input
              type="text"
              value={state.focusText}
              className="language-card-field-inset language-card-field-input mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              onChange={(event) =>
                onFocusChange(event.target.value, 'typed in Focus input')
              }
            />
            <SmartKeywordChips
              chips={chips}
              focusText={state.focusText}
              onPick={(chip) => onFocusChange(chip, `chip "${chip}"`)}
              layout="wrap"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary">Meaning</label>
            <div className="language-card-field-inset language-card-field-input mt-1 rounded-lg border px-3 py-2 text-sm text-text-muted">
              …
            </div>
          </div>
        </article>
      </div>
      <ProtoStateBar state={state} />
    </CardEditorShell>
  );
}
