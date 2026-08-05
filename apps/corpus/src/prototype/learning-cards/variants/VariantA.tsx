import type { LanguageCard } from '@semia/shared';
import {
  CardStatusDot,
  LearningCardDetailModal,
  LearningCardsShell,
} from '../prototypeShared';
import type { LearningCardsPrototypeState } from '../useLearningCardsPrototypeState';

function CapsulePill({
  card,
  onSelect,
}: {
  card: LanguageCard;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-start gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-left shadow-sm transition-colors hover:border-border-strong hover:bg-white"
      onClick={onSelect}
    >
      <CardStatusDot card={card} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-reading text-sm font-semibold text-text">
          {card.focus}
        </span>
        <span className="semia-field-zh mt-0.5 block truncate text-xs text-text-secondary">
          {card.meaning}
        </span>
      </span>
    </button>
  );
}

/** A — Capsule pills: full rounding, tight border, moderate gap between chips. */
export function VariantA({ state }: { state: LearningCardsPrototypeState }) {
  return (
    <>
      <LearningCardsShell state={state} variantLabel="A — Capsule pill grid">
        {state.visibleCards.length === 0 ? (
          <p className="text-sm text-text-muted">No cards match your search.</p>
        ) : (
          <ul
            className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3"
            role="list"
          >
            {state.visibleCards.map((card) => (
              <li key={card.id}>
                <CapsulePill
                  card={card}
                  onSelect={() => state.selectCard(card.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </LearningCardsShell>
      <LearningCardDetailModal
        card={state.selectedCard}
        onClose={state.closeCard}
      />
    </>
  );
}
