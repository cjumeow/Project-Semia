import type { LanguageCard } from '@semia/shared';
import {
  CardStatusDot,
  LearningCardDetailModal,
  LearningCardsShell,
} from '../prototypeShared';
import type { LearningCardsPrototypeState } from '../useLearningCardsPrototypeState';

function LooseChip({
  card,
  onSelect,
}: {
  card: LanguageCard;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full flex-col gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-3 text-left transition-colors hover:border-text-muted/50 hover:shadow-sm"
      onClick={onSelect}
    >
      <div className="flex items-center gap-2">
        <CardStatusDot card={card} />
        <span className="truncate font-reading text-sm font-semibold text-text">
          {card.focus}
        </span>
      </div>
      <span className="semia-field-zh line-clamp-1 border-t border-border pt-1.5 text-xs text-text-secondary">
        {card.meaning}
      </span>
    </button>
  );
}

/** C — Loose chips: large canvas gutters, internal divider between focus and meaning. */
export function VariantC({ state }: { state: LearningCardsPrototypeState }) {
  return (
    <>
      <LearningCardsShell
        state={state}
        variantLabel="C — Loose chip grid (wide gutters)"
      >
        {state.visibleCards.length === 0 ? (
          <p className="text-sm text-text-muted">No cards match your search.</p>
        ) : (
          <div className="rounded-xl border border-dashed border-border-strong/70 bg-shelf/50 p-5">
            <ul
              className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5"
              role="list"
            >
              {state.visibleCards.map((card) => (
                <li key={card.id}>
                  <LooseChip
                    card={card}
                    onSelect={() => state.selectCard(card.id)}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </LearningCardsShell>
      <LearningCardDetailModal
        card={state.selectedCard}
        onClose={state.closeCard}
      />
    </>
  );
}
