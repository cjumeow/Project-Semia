import type { LanguageCard } from '@semia/shared';
import { effectiveCardTriageStatus } from '@semia/shared';
import { useEffect, useMemo, useState } from 'react';
import type { CorpusSnippet } from '../types/corpus';
import { LanguageCardView, intentLabel } from './LanguageCardView';
import { SourceSnipModal } from './SourceSnipModal';
import { TriageStatusIcon } from './TriageStatusIcon';

type MyCardsWorkspaceProps = {
  cards: LanguageCard[];
  snippets: CorpusSnippet[];
  contextWindowEnabled: boolean;
  actionsEnabled: boolean;
  onMarkCardMastered: (cardId: string) => void;
};

export function MyCardsWorkspace({
  cards,
  snippets,
  contextWindowEnabled,
  actionsEnabled,
  onMarkCardMastered,
}: MyCardsWorkspaceProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [sourceSnippet, setSourceSnippet] = useState<CorpusSnippet | undefined>();

  const snippetById = useMemo(() => {
    return new Map(snippets.map((snippet) => [snippet.id, snippet]));
  }, [snippets]);

  useEffect(() => {
    if (cards.length === 0) {
      setSelectedCardId(null);
      return;
    }

    if (!selectedCardId || !cards.some((card) => card.id === selectedCardId)) {
      setSelectedCardId(cards[0]!.id);
    }
  }, [cards, selectedCardId]);

  const selectedCard = cards.find((card) => card.id === selectedCardId);
  const selectedSnippet = selectedCard
    ? snippetById.get(selectedCard.sourceFragmentId)
    : undefined;

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
      <header className="shrink-0 border-b border-border bg-surface/80 px-5 py-4">
        <h2 className="font-display text-base font-semibold text-text">
          My cards
        </h2>
        <p className="mt-1 text-xs text-text-muted">
          {cards.length} language card{cards.length === 1 ? '' : 's'} across
          sources
        </p>
      </header>

      {cards.length === 0 ? (
        <p className="px-5 py-6 text-sm text-text-muted">
          No language cards yet. Create one from a snippet note in Library or
          Inbox.
        </p>
      ) : (
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <aside className="flex w-72 shrink-0 flex-col overflow-y-auto border-r border-border bg-shelf/40">
            <ul className="flex flex-col gap-0.5 p-2">
              {cards.map((card) => {
                const snippet = snippetById.get(card.sourceFragmentId);
                const isActive = card.id === selectedCardId;

                return (
                  <li key={card.id}>
                    <button
                      type="button"
                      className={[
                        'w-full rounded-lg border-l-[3px] px-3 py-2.5 text-left transition-colors',
                        isActive
                          ? 'semia-margin-active border-transparent bg-surface text-text shadow-sm'
                          : 'border-transparent text-text-secondary hover:bg-surface/70 hover:text-text',
                      ].join(' ')}
                      onClick={() => setSelectedCardId(card.id)}
                    >
                      <p className="truncate text-sm font-medium">{card.focus}</p>
                      <p className="mt-0.5 truncate text-[11px] text-text-muted">
                        {snippet?.sourceTitle ?? 'Unknown source'}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {selectedCard ? (
              <article className="mx-auto max-w-2xl">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-reading text-2xl font-semibold text-text">
                      {selectedCard.focus}
                    </h3>
                    <p className="mt-1 truncate text-xs text-text-muted">
                      {selectedSnippet?.sourceTitle ?? 'Unknown source'} ·{' '}
                      {selectedCard.focusText}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {actionsEnabled &&
                    effectiveCardTriageStatus(selectedCard) === 'review' ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[10px] font-medium text-text-secondary shadow-sm transition-colors hover:border-emerald-600/30 hover:bg-emerald-50 hover:text-emerald-800"
                        aria-label="Mark card as mastered"
                        title="Mark as mastered"
                        onClick={() => onMarkCardMastered(selectedCard.id)}
                      >
                        <TriageStatusIcon status="review" size={12} />
                        <span aria-hidden>→</span>
                        <TriageStatusIcon status="mastered" size={12} />
                      </button>
                    ) : null}
                    {selectedSnippet ? (
                      <button
                        type="button"
                        className="text-[11px] font-medium text-accent hover:underline"
                        onClick={() => setSourceSnippet(selectedSnippet)}
                      >
                        View source
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(28,25,23,0.04)]">
                  <LanguageCardView card={selectedCard} />
                </div>
              </article>
            ) : (
              <p className="text-sm text-text-muted">Select a card.</p>
            )}
          </div>
        </div>
      )}

      <SourceSnipModal
        snippet={sourceSnippet}
        contextWindowEnabled={contextWindowEnabled}
        onClose={() => setSourceSnippet(undefined)}
      />
    </section>
  );
}

// Re-export for list badges if needed elsewhere
export { intentLabel };
