import type { LanguageCard } from '@semia/shared';
import {
  CardStatusDot,
  LearningCardDetailModal,
  LearningCardsShell,
} from '../prototypeShared';
import type { LearningCardsPrototypeState } from '../useLearningCardsPrototypeState';

function BorderedTile({
  card,
  onSelect,
}: {
  card: LanguageCard;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className="flex h-full min-h-[5.5rem] w-full flex-col rounded-xl border-2 border-border-strong bg-surface p-4 text-left transition-colors hover:border-accent/40 hover:bg-white"
      onClick={onSelect}
    >
      <div className="mb-2 flex items-center gap-2">
        <CardStatusDot card={card} />
        <span className="font-reading text-base font-semibold leading-tight text-text">
          {card.focus}
        </span>
      </div>
      <span className="semia-field-zh line-clamp-2 text-sm text-text-secondary">
        {card.meaning}
      </span>
    </button>
  );
}

/** B — Bordered tiles: rectangular cards, stronger border, wider gutters. */
export function VariantB({ state }: { state: LearningCardsPrototypeState }) {
  return (
    <>
      <LearningCardsShell state={state} variantLabel="B — Bordered tile grid">
        {state.visibleCards.length === 0 ? (
          <p className="text-sm text-text-muted">No cards match your search.</p>
        ) : (
          <ul
            className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4"
            role="list"
          >
            {state.visibleCards.map((card) => (
              <li key={card.id} className="min-h-[5.5rem]">
                <BorderedTile
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
