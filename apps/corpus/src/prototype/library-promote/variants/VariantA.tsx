import { TriageStatusIcon } from '../../../components/TriageStatusIcon';
import {
  isReviewSnippet,
  MockNoteCard,
  PrototypeLayout,
} from '../prototypeShared';
import type { LibraryPromotePrototypeState } from '../useLibraryPromotePrototypeState';

/** A — Footer strip attached to the bottom of the note card. */
export function VariantA({ state }: { state: LibraryPromotePrototypeState }) {
  const { markMastered } = state;

  return (
    <PrototypeLayout
      state={state}
      variantLabel="A — Note card footer"
      renderNoteCard={(snippet) => {
        const showPromote = isReviewSnippet(snippet);

        return (
          <div className="overflow-hidden rounded-xl border border-border shadow-[0_1px_2px_rgba(28,25,23,0.04)]">
            <div className="[&>article]:rounded-none [&>article]:border-0 [&>article]:shadow-none">
              <MockNoteCard snippet={snippet} />
            </div>
            {showPromote ? (
              <div className="flex items-center justify-between gap-3 border-t border-border bg-canvas/60 px-5 py-3">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <TriageStatusIcon status="review" size={14} />
                  <span>Still learning</span>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md border border-emerald-600/25 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-100"
                  onClick={() => markMastered(snippet.id)}
                >
                  <TriageStatusIcon status="mastered" size={14} />
                  Mark as mastered
                </button>
              </div>
            ) : null}
          </div>
        );
      }}
    />
  );
}
