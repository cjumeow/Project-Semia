import { useMemo, useState } from 'react';
import type { LanguageCard } from '@semia/shared';
import { MOCK_LEARNING_CARDS } from '../learning-cards/mockLearningCards';

function CardTile({
  card,
  onSelect,
}: {
  card: LanguageCard;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className="flex h-full w-full min-w-0 flex-col rounded-xl border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:border-border-strong hover:bg-canvas"
      onClick={onSelect}
    >
      <span className="block truncate font-reading text-sm text-text">{card.focus}</span>
      <span className="semia-field-zh mt-0.5 block truncate text-[11px] text-text-secondary">
        {card.meaning}
      </span>
    </button>
  );
}

export function DarkModeCardsPreview() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visibleCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_LEARNING_CARDS.filter((card) => {
      if (!q) return true;
      return (
        card.focus.toLowerCase().includes(q) ||
        card.meaning.toLowerCase().includes(q)
      );
    });
  }, [search]);

  const selected = visibleCards.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col bg-canvas">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-surface/80 px-5 py-4">
        <div>
          <h2 className="font-display text-base font-semibold text-text">
            Learning cards
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            {visibleCards.length} cards · grid preview
          </p>
        </div>
        <input
          type="search"
          value={search}
          placeholder="Search focus or meaning…"
          className="w-full max-w-xs rounded-lg border border-border bg-canvas px-3 py-2 text-sm text-text placeholder:text-text-muted"
          onChange={(event) => setSearch(event.target.value)}
        />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <ul
          className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4"
          role="list"
        >
          {visibleCards.map((card) => (
            <li key={card.id} className="h-[4.25rem] min-w-0">
              <CardTile card={card} onSelect={() => setSelectedId(card.id)} />
            </li>
          ))}
        </ul>
      </div>

      {selected ? (
        <footer className="shrink-0 border-t border-border bg-surface px-5 py-3 text-xs text-text-muted">
          Selected: <span className="text-text">{selected.focus}</span> —{' '}
          {selected.meaning}
        </footer>
      ) : null}
    </div>
  );
}
