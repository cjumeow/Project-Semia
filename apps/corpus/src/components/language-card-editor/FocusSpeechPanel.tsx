import { useRef } from 'react';
import type { FocusKeywordCandidate } from '@semia/shared';
import { speechPreview } from '@semia/shared';
import { ChevronToggleIcon } from '../shared/ChevronToggleIcon';
import type { FocusKeywordCursorClasses } from './focusKeywordCursorStyle';
import {
  useFocusTextSelection,
  type FocusSelectionAnchor,
} from './useFocusTextSelection';

type FocusSpeechPanelProps = {
  originalSpeech: string;
  panelOpen: boolean;
  disabled?: boolean;
  candidates: FocusKeywordCandidate[];
  cursorClasses: FocusKeywordCursorClasses;
  onPanelOpenChange: (open: boolean) => void;
  onPickFocus: (text: string) => void;
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
  disabled,
  cursorClasses,
  onSetFocus,
}: {
  text: string;
  chips: FocusKeywordCandidate[];
  disabled?: boolean;
  cursorClasses: FocusKeywordCursorClasses;
  onSetFocus: (text: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { anchor, clearAnchor, handleDoubleClick, handleMouseUp } =
    useFocusTextSelection(containerRef);

  const chipTexts = chips.map((chip) => chip.text);
  const pattern =
    chipTexts.length > 0
      ? new RegExp(
          `(${chipTexts.map((chip) => chip.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
          'gi',
        )
      : null;
  const parts = pattern ? text.split(pattern) : [text];

  return (
    <>
      <div
        ref={containerRef}
        role="textbox"
        tabIndex={disabled ? -1 : 0}
        className="whitespace-pre-wrap font-reading text-sm leading-relaxed text-text selection:bg-accent/20"
        onDoubleClick={disabled ? undefined : handleDoubleClick}
        onMouseUp={disabled ? undefined : handleMouseUp}
      >
        {parts.map((part, index) => {
          const isChip =
            pattern &&
            chipTexts.some((chip) => chip.toLowerCase() === part.toLowerCase());
          if (!isChip) {
            return <span key={`${part}-${index}`}>{part}</span>;
          }
          return (
            <button
              key={`${part}-${index}`}
              type="button"
              disabled={disabled}
              className="rounded-sm bg-amber-400/20 px-0.5 font-medium text-text underline decoration-amber-500/50 decoration-dotted underline-offset-2 hover:bg-amber-400/30 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => onSetFocus(part)}
            >
              {part}
            </button>
          );
        })}
      </div>
      {anchor && !disabled ? (
        <FocusSetPopover
          anchor={anchor}
          actionClass={cursorClasses.action}
          onSetFocus={() => onSetFocus(anchor.text)}
          onDismiss={clearAnchor}
        />
      ) : null}
    </>
  );
}

export function FocusSpeechPanel({
  originalSpeech,
  panelOpen,
  disabled = false,
  candidates,
  cursorClasses,
  onPanelOpenChange,
  onPickFocus,
}: FocusSpeechPanelProps) {
  const preview = speechPreview(originalSpeech);
  const speech = originalSpeech.trim();

  if (!speech) {
    return null;
  }

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        className="inline-flex h-7 w-fit max-w-full min-w-0 items-center gap-1.5 rounded-full border border-border bg-canvas/90 px-2.5 text-left transition-colors hover:border-accent/30 disabled:cursor-not-allowed disabled:opacity-50"
        aria-expanded={panelOpen}
        onClick={() => onPanelOpenChange(!panelOpen)}
      >
        <ChevronToggleIcon expanded={panelOpen} className="h-2.5 w-2.5" />
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="shrink-0 text-[10px] font-medium text-text-muted">
            Context
          </span>
          <span className="shrink-0 text-[10px] text-text-muted/40" aria-hidden>
            |
          </span>
          <span className="min-w-0 truncate text-xs text-text-secondary">
            {preview}
          </span>
        </span>
      </button>

      {panelOpen ? (
        <div className="mt-2 rounded-lg border border-border bg-canvas/30 p-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-text-muted">
            Original speech
          </p>
          <HighlightedSpeech
            text={speech}
            chips={candidates}
            disabled={disabled}
            cursorClasses={cursorClasses}
            onSetFocus={onPickFocus}
          />
          <p className="mt-2 text-[11px] text-text-muted">
            Double-click a word or select a phrase → Set as Focus
          </p>
        </div>
      ) : null}
    </div>
  );
}
