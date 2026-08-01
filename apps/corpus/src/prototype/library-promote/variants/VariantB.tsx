import { TriageStatusIcon } from '../../../components/TriageStatusIcon';
import {
  isReviewSnippet,
  MockNoteCard,
  PrototypeLayout,
} from '../prototypeShared';
import type { LibraryPromotePrototypeState } from '../useLibraryPromotePrototypeState';

/** B — Banner row above the note fields, inside the card chrome. */
export function VariantB({ state }: { state: LibraryPromotePrototypeState }) {
  const { markMastered } = state;

  return (
    <PrototypeLayout
      state={state}
      variantLabel="B — In-card header banner"
      renderNoteCard={(snippet) => {
        const showPromote = isReviewSnippet(snippet);

        return (
          <div className="overflow-hidden rounded-xl border border-border shadow-[0_1px_2px_rgba(28,25,23,0.04)]">
            {showPromote ? (
              <div className="flex items-center justify-between gap-3 border-b border-amber-200/70 bg-amber-50/70 px-5 py-2.5">
                <div className="flex items-center gap-2 text-xs font-medium text-amber-950/80">
                  <TriageStatusIcon status="review" size={14} />
                  Review
                </div>
                <button
                  type="button"
                  className="text-xs font-medium text-emerald-800 underline-offset-2 hover:underline"
                  onClick={() => markMastered(snippet.id)}
                >
                  Mark as mastered →
                </button>
              </div>
            ) : null}
            <div className="[&>article]:rounded-none [&>article]:border-0 [&>article]:shadow-none">
              <MockNoteCard snippet={snippet} />
            </div>
          </div>
        );
      }}
    />
  );
}
