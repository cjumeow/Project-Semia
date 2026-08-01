import { TriageStatusIcon } from '../../../components/TriageStatusIcon';
import {
  isReviewSnippet,
  MockNoteCard,
  PrototypeLayout,
} from '../prototypeShared';
import type { LibraryPromotePrototypeState } from '../useLibraryPromotePrototypeState';

/** C — Compact control floating on the note card's top-right corner. */
export function VariantC({ state }: { state: LibraryPromotePrototypeState }) {
  const { markMastered } = state;

  return (
    <PrototypeLayout
      state={state}
      variantLabel="C — Corner chip on note card"
      renderNoteCard={(snippet) => {
        const showPromote = isReviewSnippet(snippet);

        return (
          <div className="relative">
            {showPromote ? (
              <button
                type="button"
                className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[10px] font-medium text-text-secondary shadow-sm transition-colors hover:border-emerald-600/30 hover:bg-emerald-50 hover:text-emerald-800"
                aria-label="Mark as mastered"
                title="Mark as mastered"
                onClick={() => markMastered(snippet.id)}
              >
                <TriageStatusIcon status="review" size={12} />
                <span aria-hidden>→</span>
                <TriageStatusIcon status="mastered" size={12} />
              </button>
            ) : null}
            <MockNoteCard snippet={snippet} />
          </div>
        );
      }}
    />
  );
}
