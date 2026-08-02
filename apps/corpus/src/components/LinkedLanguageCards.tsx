import type { LanguageCard } from '@semia/shared';
import { MAX_LANGUAGE_CARDS_PER_FRAGMENT } from '@semia/shared';
import { LanguageCardView } from './LanguageCardView';

type LinkedLanguageCardsProps = {
  cards: LanguageCard[];
  onPreviewCard: (card: LanguageCard) => void;
};

export function LinkedLanguageCards({
  cards,
  onPreviewCard,
}: LinkedLanguageCardsProps) {
  const visible = cards.slice(0, MAX_LANGUAGE_CARDS_PER_FRAGMENT);

  if (visible.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="semia-section-label">Language cards</h3>
        <span className="font-mono text-[10px] tabular-nums text-text-muted">
          {visible.length}/{MAX_LANGUAGE_CARDS_PER_FRAGMENT}
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {visible.map((card) => (
          <li key={card.id}>
            <button
              type="button"
              className="w-full rounded-xl border border-border bg-surface p-4 text-left shadow-[0_1px_2px_rgba(28,25,23,0.04)] transition-colors hover:border-accent/30 hover:bg-accent-soft/20"
              onClick={() => onPreviewCard(card)}
            >
              <p className="font-reading text-sm font-semibold text-text">
                {card.focus}
              </p>
              <p className="semia-field-zh mt-1 line-clamp-2 text-sm text-text-secondary">
                {card.meaning}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function LanguageCardListModal({
  cards,
  onSelectCard,
  onClose,
}: {
  cards: LanguageCard[];
  onSelectCard: (card: LanguageCard) => void;
  onClose: () => void;
}) {
  if (cards.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="max-h-[min(80vh,36rem)] w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="language-card-list-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="border-b border-border px-5 py-4">
          <h2
            id="language-card-list-title"
            className="font-display text-base font-semibold text-text"
          >
            Language cards
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            {cards.length} card{cards.length === 1 ? '' : 's'} for this snippet
          </p>
        </header>
        <ul className="max-h-[min(60vh,28rem)] overflow-y-auto p-3">
          {cards.map((card) => (
            <li key={card.id} className="mb-2 last:mb-0">
              <button
                type="button"
                className="w-full rounded-lg border border-border bg-canvas px-4 py-3 text-left transition-colors hover:border-accent/30 hover:bg-accent-soft/20"
                onClick={() => onSelectCard(card)}
              >
                <p className="text-sm font-medium text-text">{card.focus}</p>
                <p className="semia-field-zh mt-1 line-clamp-2 text-xs text-text-secondary">
                  {card.meaning}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function LanguageCardDetailModal({
  card,
  onClose,
}: {
  card: LanguageCard | null;
  onClose: () => void;
}) {
  if (!card) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="max-h-[min(85vh,40rem)] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-surface p-5 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="language-card-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2
            id="language-card-detail-title"
            className="font-reading text-xl font-semibold text-text"
          >
            {card.focus}
          </h2>
          <button
            type="button"
            className="shrink-0 text-xs text-text-muted hover:text-text"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <LanguageCardView card={card} />
      </div>
    </div>
  );
}
