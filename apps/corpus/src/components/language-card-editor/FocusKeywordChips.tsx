import type { FocusKeywordCandidate } from '@semia/shared';
import type { FocusKeywordCursorClasses } from './focusKeywordCursorStyle';

type FocusKeywordChipsProps = {
  candidates: FocusKeywordCandidate[];
  loading: boolean;
  enabled: boolean;
  focusText: string;
  cursorClasses: FocusKeywordCursorClasses;
  onPick: (text: string) => void;
};

export function FocusKeywordChips({
  candidates,
  loading,
  enabled,
  focusText,
  cursorClasses,
  onPick,
}: FocusKeywordChipsProps) {
  if (!enabled) {
    return (
      <p className="mt-2 text-[11px] text-text-muted">
        Enable AI suggestions in Settings for Quick Focus chips.
      </p>
    );
  }

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
            className={active ? cursorClasses.chipActive : cursorClasses.chip}
            onClick={() => onPick(candidate.text)}
          >
            {candidate.text}
          </button>
        );
      })}
    </div>
  );
}
