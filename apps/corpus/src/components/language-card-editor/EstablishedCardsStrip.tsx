import type { LanguageCard } from '@semia/shared';

function NewDraftChip({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors',
        active
          ? 'border-accent bg-accent-soft'
          : 'border-dashed border-accent/60 bg-surface hover:border-accent',
      ].join(' ')}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-accent text-sm text-accent">
        +
      </span>
      <div>
        <p className="text-xs font-medium text-accent">New draft</p>
        <p className="text-[10px] text-text-muted">Build new card</p>
      </div>
    </button>
  );
}

function EstablishedCardChip({
  card,
  active,
  onClick,
}: {
  card: LanguageCard;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'shrink-0 rounded-lg border px-3 py-2 text-left transition-colors',
        active
          ? 'border-accent bg-accent-soft'
          : 'border-border bg-surface hover:border-accent/40',
      ].join(' ')}
    >
      <p className="text-xs font-medium text-text">{card.focusText}</p>
      <p className="mt-0.5 max-w-[8rem] truncate text-[10px] text-text-muted">
        {card.meaning}
      </p>
    </button>
  );
}

type EstablishedCardsStripProps = {
  cards: LanguageCard[];
  isDraftMode: boolean;
  editingCardId: string | null;
  onSelectDraft: () => void;
  onSelectCard: (cardId: string) => void;
};

export function EstablishedCardsStrip({
  cards,
  isDraftMode,
  editingCardId,
  onSelectDraft,
  onSelectCard,
}: EstablishedCardsStripProps) {
  return (
    <footer className="shrink-0 border-t border-border bg-surface px-4 py-3">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-text-muted">
        Cards for this capture
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <NewDraftChip active={isDraftMode} onClick={onSelectDraft} />
        {cards.map((card) => (
          <EstablishedCardChip
            key={card.id}
            card={card}
            active={!isDraftMode && editingCardId === card.id}
            onClick={() => onSelectCard(card.id)}
          />
        ))}
      </div>
    </footer>
  );
}
