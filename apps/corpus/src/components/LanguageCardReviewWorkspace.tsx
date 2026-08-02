import type { LanguageCard } from '@semia/shared';
import { LanguageCardView } from './LanguageCardView';
import { cardReviewScheduleMeta } from '../utils/cardGrouping';

type LanguageCardReviewWorkspaceProps = {
  dueCards: LanguageCard[];
  selectedCard: LanguageCard | undefined;
  actionsEnabled: boolean;
  onSelectCard: (cardId: string) => void;
  onStillLearning: (cardId: string) => void;
  onMastered: (cardId: string) => void;
};

export function LanguageCardReviewWorkspace({
  dueCards,
  selectedCard,
  actionsEnabled,
  onSelectCard,
  onStillLearning,
  onMastered,
}: LanguageCardReviewWorkspaceProps) {
  const now = new Date().toISOString();
  const focusIndex = selectedCard
    ? dueCards.findIndex((card) => card.id === selectedCard.id)
    : -1;

  if (dueCards.length === 0) {
    return (
      <section className="flex min-h-0 min-w-0 flex-1 items-center justify-center bg-canvas px-6">
        <p className="text-center text-sm text-text-muted">
          No language cards due — check back later.
        </p>
      </section>
    );
  }

  if (!selectedCard || focusIndex < 0) {
    return (
      <section className="flex min-h-0 min-w-0 flex-1 items-center justify-center bg-canvas px-6">
        <p className="text-center text-sm text-text-muted">
          Select a due language card from Review Queue.
        </p>
      </section>
    );
  }

  const schedule = cardReviewScheduleMeta(selectedCard, now);

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
      <div className="shrink-0 px-6 pt-6">
        <div className="flex items-center gap-2">
          {dueCards.map((card, index) => (
            <button
              key={card.id}
              type="button"
              className={[
                'h-2 rounded-full transition-all',
                index === focusIndex
                  ? 'w-6 bg-accent'
                  : 'w-2 bg-border hover:bg-text-muted',
              ].join(' ')}
              aria-label={`Go to ${card.focus}`}
              onClick={() => onSelectCard(card.id)}
            />
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 pb-4">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-reading text-center text-3xl font-semibold leading-snug tracking-tight text-text">
            {selectedCard.focus}
          </h2>
          <p className="mt-2 text-center text-xs text-text-muted">
            {selectedCard.focusText}
          </p>
          <div className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(28,25,23,0.04)]">
            <LanguageCardView card={selectedCard} />
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-shelf/80 px-5 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text">
              {selectedCard.focus}
            </p>
            <p className="truncate text-[11px] text-text-muted">
              {focusIndex + 1}/{dueCards.length} · Stage {schedule.stageLabel}
              {schedule.overdueDays
                ? ` · ${schedule.overdueDays}d overdue`
                : ''}
            </p>
          </div>
          <div className="flex w-[min(20rem,48vw)] shrink-0 gap-3">
            <button
              type="button"
              disabled={!actionsEnabled}
              className="min-w-0 flex-1 rounded-xl border border-[#8B7355]/40 bg-[#F5EDE4] px-4 py-3.5 text-sm font-medium text-[#5C4A32] transition-colors hover:bg-[#EBE0D4] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => onStillLearning(selectedCard.id)}
            >
              Still learning
            </button>
            <button
              type="button"
              disabled={!actionsEnabled}
              className="min-w-0 flex-1 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => onMastered(selectedCard.id)}
            >
              Mastered
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
