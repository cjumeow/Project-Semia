import type { LanguageCard } from '@semia/shared';
import { useMemo, useState } from 'react';
import type { CorpusSnippet } from '../types/corpus';
import { intentLabel } from './LanguageCardView';
import { SourceSnipModal } from './SourceSnipModal';

type MyCardsWorkspaceProps = {
  cards: LanguageCard[];
  snippets: CorpusSnippet[];
  contextWindowEnabled: boolean;
};

export function MyCardsWorkspace({
  cards,
  snippets,
  contextWindowEnabled,
}: MyCardsWorkspaceProps) {
  const [sourceSnippet, setSourceSnippet] = useState<CorpusSnippet | undefined>();

  const snippetById = useMemo(() => {
    return new Map(snippets.map((snippet) => [snippet.id, snippet]));
  }, [snippets]);

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

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {cards.length === 0 ? (
          <p className="text-sm text-text-muted">
            No language cards yet. Create one from a snippet note in Library or
            Inbox.
          </p>
        ) : (
          <ul className="mx-auto flex max-w-2xl flex-col gap-3">
            {cards.map((card) => {
              const snippet = snippetById.get(card.sourceFragmentId);

              return (
                <li key={card.id}>
                  <article className="rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(28,25,23,0.04)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-reading text-lg font-semibold text-text">
                          {card.focus}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-text-muted">
                          {snippet?.sourceTitle ?? 'Unknown source'} ·{' '}
                          {card.focusText}
                        </p>
                      </div>
                      {snippet ? (
                        <button
                          type="button"
                          className="shrink-0 text-[11px] font-medium text-accent hover:underline"
                          onClick={() => setSourceSnippet(snippet)}
                        >
                          View source
                        </button>
                      ) : null}
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                      {card.meaning}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {card.intents.map((intent) => (
                        <span
                          key={intent}
                          className="rounded-md bg-canvas px-1.5 py-0.5 font-mono text-[10px] uppercase text-text-muted"
                        >
                          {intentLabel(intent)}
                        </span>
                      ))}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <SourceSnipModal
        snippet={sourceSnippet}
        contextWindowEnabled={contextWindowEnabled}
        onClose={() => setSourceSnippet(undefined)}
      />
    </section>
  );
}
