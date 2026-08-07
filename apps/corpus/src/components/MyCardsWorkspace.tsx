import type { LanguageCard } from '@semia/shared';
import { effectiveCardTriageStatus } from '@semia/shared';
import { useMemo, useState } from 'react';
import type { CorpusSnippet } from '../types/corpus';
import { browseLearningCards } from '../utils/learningCardBrowse';
import { LanguageCardDetailModal } from './LinkedLanguageCards';
import { SourceSnipModal } from './SourceSnipModal';
import { TriageStatusIcon } from './TriageStatusIcon';

type MyCardsWorkspaceProps = {
  cards: LanguageCard[];
  snippets: CorpusSnippet[];
  contextWindowEnabled: boolean;
};

function LearningCardTile({
  card,
  onSelect,
}: {
  card: LanguageCard;
  onSelect: () => void;
}) {
  const status = effectiveCardTriageStatus(card);

  return (
    <button
      type="button"
      className="relative flex h-full w-full min-w-0 flex-col overflow-x-hidden rounded-xl border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:border-border-strong hover:bg-canvas"
      onClick={onSelect}
    >
      <span className="absolute right-2 top-2">
        <TriageStatusIcon status={status} size={11} />
      </span>
      <span className="block min-w-0 overflow-x-hidden text-ellipsis whitespace-nowrap pr-4 font-reading text-sm font-normal leading-normal text-text">
        {card.focus}
      </span>
      <span className="semia-field-zh mt-0.5 block min-w-0 overflow-x-hidden text-ellipsis whitespace-nowrap text-[11px] leading-normal text-text-secondary">
        {card.meaning}
      </span>
    </button>
  );
}

export function MyCardsWorkspace({
  cards,
  snippets,
  contextWindowEnabled,
}: MyCardsWorkspaceProps) {
  const [search, setSearch] = useState('');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [sourceSnippet, setSourceSnippet] = useState<CorpusSnippet | undefined>();

  const snippetById = useMemo(() => {
    return new Map(snippets.map((snippet) => [snippet.id, snippet]));
  }, [snippets]);

  const visibleCards = useMemo(
    () => browseLearningCards(cards, search),
    [cards, search],
  );

  const trimmedSearch = search.trim();

  const selectedCard = useMemo(
    () => cards.find((card) => card.id === selectedCardId) ?? null,
    [cards, selectedCardId],
  );

  const selectedSnippet = selectedCard
    ? snippetById.get(selectedCard.sourceFragmentId)
    : undefined;

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-surface/80 px-5 py-4">
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold text-text">
            Learning cards
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            {visibleCards.length} card{visibleCards.length === 1 ? '' : 's'}
            {trimmedSearch
              ? ` matching “${trimmedSearch}”`
              : ' · newest first'}
          </p>
        </div>
        <label className="flex min-w-[12rem] flex-1 items-center gap-2 sm:max-w-xs sm:flex-none">
          <span className="sr-only">Search learning cards</span>
          <input
            type="search"
            value={search}
            placeholder="Search focus or meaning…"
            className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </header>

      {cards.length === 0 ? (
        <p className="px-5 py-6 text-sm text-text-muted">
          No learning cards yet. Create one from a snippet note in Library or
          Inbox.
        </p>
      ) : visibleCards.length === 0 ? (
        <p className="px-5 py-6 text-sm text-text-muted">
          No cards match your search.
        </p>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <ul
            className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4"
            role="list"
          >
            {visibleCards.map((card) => (
              <li key={card.id} className="h-[4.25rem] min-w-0">
                <LearningCardTile
                  card={card}
                  onSelect={() => setSelectedCardId(card.id)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <LanguageCardDetailModal
        card={selectedCard}
        sourceTitle={selectedSnippet?.sourceTitle}
        onViewSource={
          selectedSnippet
            ? () => setSourceSnippet(selectedSnippet)
            : undefined
        }
        onClose={() => setSelectedCardId(null)}
      />

      <SourceSnipModal
        snippet={sourceSnippet}
        contextWindowEnabled={contextWindowEnabled}
        onClose={() => setSourceSnippet(undefined)}
      />
    </section>
  );
}
