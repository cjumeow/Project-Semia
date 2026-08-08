import { useRef } from 'react';
import { ChevronToggleIcon } from '../shared/ChevronToggleIcon';
import { FOCUS_PICK_MOCK_SNIPPET } from './focusPickMockData';
import {
  mockFocusKeywordCandidates,
  type FocusKeywordCandidate,
} from './focusPickMockKeywords';
import {
  focusPickCursorClasses,
  type FocusPickChipTheme,
  type FocusPickCursorClasses,
} from './focusPickCursorStyle';
import {
  speechPreview,
  type FocusKeywordMode,
  type FocusPickLockedState,
} from './focusPickLockedState';
import {
  useFocusTextSelection,
  type FocusSelectionAnchor,
} from './focusPickShared';

type FocusPickLockedPreviewProps = {
  state: FocusPickLockedState;
  chipTheme: FocusPickChipTheme;
  simulateEmpty: boolean;
  onPanelOpenChange: (open: boolean) => void;
  onFocusChange: (text: string, action: string) => void;
};

function FocusSetPopover({
  anchor,
  actionClass,
  onSetFocus,
  onDismiss,
}: {
  anchor: FocusSelectionAnchor;
  actionClass: string;
  onSetFocus: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      className="pointer-events-auto fixed z-50 -translate-x-1/2 -translate-y-full"
      style={{ top: anchor.top - 8, left: anchor.left }}
    >
      <button
        type="button"
        className={actionClass}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          onSetFocus();
          onDismiss();
          window.getSelection()?.removeAllRanges();
        }}
      >
        Set as Focus
      </button>
    </div>
  );
}

function HighlightedSpeech({
  text,
  chips,
  cursorClasses,
  onSetFocus,
}: {
  text: string;
  chips: FocusKeywordCandidate[];
  cursorClasses: FocusPickCursorClasses;
  onSetFocus: (text: string, action: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { anchor, clearAnchor, handleDoubleClick, handleMouseUp } =
    useFocusTextSelection(containerRef);

  const chipTexts = chips.map((chip) => chip.text);
  const pattern = new RegExp(
    `(${chipTexts.map((chip) => chip.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'gi',
  );
  const parts = text.split(pattern);

  return (
    <>
      <div
        ref={containerRef}
        role="textbox"
        tabIndex={0}
        className="whitespace-pre-wrap font-reading text-sm leading-relaxed text-text selection:bg-accent/20"
        onDoubleClick={handleDoubleClick}
        onMouseUp={handleMouseUp}
      >
        {parts.map((part, index) => {
          const isChip = chipTexts.some(
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
              onClick={() => onSetFocus(part, `clicked highlight "${part}"`)}
            >
              {part}
            </button>
          );
        })}
      </div>
      {anchor ? (
        <FocusSetPopover
          anchor={anchor}
          actionClass={cursorClasses.action}
          onSetFocus={() =>
            onSetFocus(anchor.text, `selected "${anchor.text}" from speech`)
          }
          onDismiss={clearAnchor}
        />
      ) : null}
    </>
  );
}

function FocusKeywordChips({
  candidates,
  loading,
  focusText,
  cursorClasses,
  onPick,
}: {
  candidates: FocusKeywordCandidate[];
  loading: boolean;
  focusText: string;
  cursorClasses: FocusPickCursorClasses;
  onPick: (text: string) => void;
}) {
  if (loading) {
    return (
      <p className="mt-2 text-[11px] text-text-muted">Analyzing original speech…</p>
    );
  }

  if (candidates.length === 0) {
    return (
      <p className="mt-2 text-[11px] text-text-muted">
        No suggestions — expand Context to select text, or type manually.
      </p>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] text-text-muted">Quick Focus:</span>
      {candidates.map((candidate) => {
        const active = focusText.toLowerCase() === candidate.text.toLowerCase();
        return (
          <button
            key={candidate.text}
            type="button"
            title={candidate.kind}
            className={
              active ? cursorClasses.chipActive : cursorClasses.chip
            }
            onClick={() => onPick(candidate.text)}
          >
            {candidate.text}
          </button>
        );
      })}
    </div>
  );
}

/**
 * PROTOTYPE — locked production spec (Variant C + collapsible context pill).
 * Original speech only · chips always visible · Daily/Advanced modes.
 */
export function FocusPickLockedPreview({
  state,
  chipTheme,
  simulateEmpty,
  onPanelOpenChange,
  onFocusChange,
}: FocusPickLockedPreviewProps) {
  const snippet = FOCUS_PICK_MOCK_SNIPPET;
  const preview = speechPreview(snippet.originalSpeech);
  const cursorClasses = focusPickCursorClasses(chipTheme);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border bg-canvas px-4 py-2">
        <p className="text-xs text-text-secondary">
          <span className="font-medium text-accent">Draft</span>
          <span className="text-text-muted"> — language card editor</span>
        </p>
      </div>

      <div className="p-4">
        <div className="language-card-editor-shelf">
          <article className="language-card-container space-y-4 p-4">
            <div>
              <button
                type="button"
                className="inline-flex h-7 w-fit max-w-full min-w-0 items-center gap-1.5 rounded-full border border-border bg-canvas/90 px-2.5 text-left transition-colors hover:border-accent/30"
                aria-expanded={state.panelOpen}
                onClick={() => onPanelOpenChange(!state.panelOpen)}
              >
                <ChevronToggleIcon expanded={state.panelOpen} className="h-2.5 w-2.5" />
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="shrink-0 text-[10px] font-medium text-text-muted">
                    Context
                  </span>
                  <span
                    className="shrink-0 text-[10px] text-text-muted/40"
                    aria-hidden
                  >
                    |
                  </span>
                  <span className="min-w-0 truncate text-xs text-text-secondary">
                    {preview}
                  </span>
                </span>
              </button>

              {state.panelOpen ? (
                <div className="mt-2 rounded-lg border border-border bg-canvas/30 p-3">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-text-muted">
                    Original speech
                  </p>
                  <HighlightedSpeech
                    text={snippet.originalSpeech}
                    chips={state.candidates}
                    cursorClasses={cursorClasses}
                    onSetFocus={onFocusChange}
                  />
                  <p className="mt-2 text-[11px] text-text-muted">
                    Double-click a word or select a phrase → Set as Focus
                  </p>
                </div>
              ) : null}
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary">Focus</label>
              <input
                type="text"
                value={state.focusText}
                placeholder="Word or phrase from original speech"
                className="language-card-field-inset language-card-field-input mt-1 w-full rounded-lg border px-3 py-2 text-sm text-text"
                onChange={(event) =>
                  onFocusChange(event.target.value, 'typed in Focus input')
                }
              />
              <FocusKeywordChips
                candidates={state.candidates}
                loading={state.loading}
                focusText={state.focusText}
                cursorClasses={cursorClasses}
                onPick={(text) => onFocusChange(text, `chip "${text}"`)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary">Meaning</label>
              <div className="language-card-field-inset language-card-field-input mt-1 rounded-lg border px-3 py-2 text-sm text-text-muted">
                Explanation in your native language…
              </div>
            </div>
          </article>
        </div>

        <div className="mt-4 rounded-lg border border-dashed border-border bg-canvas/60 px-3 py-2 font-mono text-[10px] text-text-muted">
          <p>
            chipTheme: <span className="text-text">{chipTheme}</span>
            {' · '}
            panelOpen:{' '}
            <span className="text-text">{state.panelOpen ? 'true' : 'false'}</span>
            {' · '}
            keywordMode: <span className="text-text">{state.keywordMode}</span>
            {' · '}
            simulateEmpty:{' '}
            <span className="text-text">{simulateEmpty ? 'true' : 'false'}</span>
          </p>
          <p className="mt-1">
            focusText: <span className="text-text">{state.focusText || '∅'}</span>
          </p>
          <p className="mt-1">
            candidates:{' '}
            <span className="text-text">
              {state.candidates.map((c) => c.text).join(', ') || '∅'}
            </span>
          </p>
          <p className="mt-1">
            lastAction: <span className="text-text">{state.lastAction}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export function buildLockedPreviewState(
  keywordMode: FocusKeywordMode,
  simulateEmpty: boolean,
  loading = false,
): Pick<FocusPickLockedState, 'keywordMode' | 'candidates' | 'loading'> {
  return {
    keywordMode,
    loading,
    candidates: loading
      ? []
      : mockFocusKeywordCandidates(keywordMode, simulateEmpty),
  };
}
