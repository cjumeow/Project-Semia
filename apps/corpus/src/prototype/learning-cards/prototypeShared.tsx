import type { LanguageCard } from '@semia/shared';
import { effectiveCardTriageStatus } from '@semia/shared';
import type { ReactNode } from 'react';
import { LanguageCardView } from '../../components/LanguageCardView';
import type { LearningCardsPrototypeState } from './useLearningCardsPrototypeState';

export function LearningCardsHeader({
  state,
}: {
  state: LearningCardsPrototypeState;
}) {
  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-surface/80 px-5 py-4">
      <div className="min-w-0">
        <h2 className="font-display text-base font-semibold text-text">
          Learning cards
        </h2>
        <p className="mt-1 text-xs text-text-muted">
          {state.visibleCards.length} card
          {state.visibleCards.length === 1 ? '' : 's'}
          {state.search.trim()
            ? ` matching “${state.search.trim()}”`
            : ' · newest first'}
        </p>
      </div>
      <label className="flex min-w-[12rem] flex-1 items-center gap-2 sm:max-w-xs sm:flex-none">
        <span className="sr-only">Search learning cards</span>
        <input
          type="search"
          value={state.search}
          placeholder="Search focus or meaning…"
          className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          onChange={(event) => state.setSearch(event.target.value)}
        />
      </label>
    </header>
  );
}

export function LearningCardsShell({
  state,
  variantLabel,
  children,
}: {
  state: LearningCardsPrototypeState;
  variantLabel: string;
  children: ReactNode;
}) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
      <LearningCardsHeader state={state} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
      <footer className="pointer-events-none shrink-0 border-t border-border bg-surface/90 px-5 py-2">
        <p className="font-mono text-[10px] leading-relaxed text-text-muted">
          <span className="font-semibold text-text">{variantLabel}</span>
          <span> · {state.stateSummary}</span>
        </p>
      </footer>
    </section>
  );
}

export function CardStatusDot({ card }: { card: LanguageCard }) {
  const status = effectiveCardTriageStatus(card);
  const tone =
    status === 'mastered'
      ? 'bg-emerald-500'
      : 'bg-accent';
  return (
    <span
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${tone}`}
      title={status === 'mastered' ? 'Mastered' : 'In practice'}
      aria-hidden
    />
  );
}

export function LearningCardDetailModal({
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
        aria-labelledby="learning-card-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2
            id="learning-card-detail-title"
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
        <p className="mt-4 text-[10px] text-text-muted">
          Prototype: View source only in production; no mark mastered here.
        </p>
      </div>
    </div>
  );
}
