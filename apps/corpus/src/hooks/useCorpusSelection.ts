import { dueReviewCards } from '@semia/shared';
import type { LanguageCard } from '@semia/shared';
import { sourceKey } from '@semia/shared';
import { useEffect, useMemo, useState } from 'react';
import type { CorpusSelection, CorpusSnippet, SourceGroup } from '../types/corpus';
import {
  dueReviewSnippets,
  effectiveTriageStatus,
  findSnippet,
  findSourceGroup,
  inboxGroups,
  libraryGroups,
  pendingSnippets,
} from '../utils/corpusGrouping';

type UseCorpusSelectionResult = {
  selection: CorpusSelection;
  inboxSourceGroups: SourceGroup[];
  librarySourceGroups: SourceGroup[];
  pendingQueue: CorpusSnippet[];
  dueQueue: CorpusSnippet[];
  dueCardQueue: LanguageCard[];
  selectedGroup: SourceGroup | undefined;
  selectedSnippet: CorpusSnippet | undefined;
  selectedCard: LanguageCard | undefined;
  selectInboxSource: (sourceKeyValue: string) => void;
  selectLibrarySource: (sourceKeyValue: string) => void;
  selectMyCards: () => void;
  selectReviewQueue: () => void;
  selectCardReviewQueue: () => void;
  selectReviewQueueSnippet: (snippetId: string) => void;
  selectCardReviewQueueCard: (cardId: string) => void;
  selectSnippet: (snippetId: string) => void;
};

function firstPendingForSource(
  queue: CorpusSnippet[],
  sourceKeyValue: string,
): CorpusSnippet | undefined {
  return queue.find((snippet) => sourceKey(snippet) === sourceKeyValue);
}

const emptySelection = {
  sourceKey: null,
  snippetId: null,
  cardId: null,
} as const;

export function useCorpusSelection(
  allGroups: SourceGroup[],
  snippets: CorpusSnippet[],
  languageCards: LanguageCard[],
): UseCorpusSelectionResult {
  const inboxSourceGroups = useMemo(() => inboxGroups(allGroups), [allGroups]);
  const librarySourceGroups = useMemo(
    () => libraryGroups(allGroups),
    [allGroups],
  );
  const pendingQueue = useMemo(() => pendingSnippets(snippets), [snippets]);
  const dueQueue = useMemo(() => dueReviewSnippets(snippets), [snippets]);
  const dueCardQueue = useMemo(
    () => dueReviewCards(languageCards, new Date().toISOString()),
    [languageCards],
  );

  const [selection, setSelection] = useState<CorpusSelection>({
    pane: 'inbox',
    ...emptySelection,
  });

  useEffect(() => {
    if (allGroups.length === 0 && languageCards.length === 0) {
      setSelection({ pane: 'inbox', ...emptySelection });
      return;
    }

    setSelection((prev) => {
      if (prev.pane === 'my-cards') {
        return prev;
      }

      if (prev.pane === 'card-review-queue') {
        if (
          prev.cardId &&
          dueCardQueue.some((card) => card.id === prev.cardId)
        ) {
          return prev;
        }

        return {
          pane: 'card-review-queue',
          ...emptySelection,
          cardId: dueCardQueue[0]?.id ?? null,
        };
      }

      if (prev.pane === 'review-queue') {
        if (
          prev.snippetId &&
          dueQueue.some((snippet) => snippet.id === prev.snippetId)
        ) {
          return prev;
        }

        return {
          pane: 'review-queue',
          ...emptySelection,
          snippetId: dueQueue[0]?.id ?? null,
        };
      }

      if (prev.snippetId) {
        if (
          prev.pane === 'inbox' &&
          pendingQueue.some((snippet) => snippet.id === prev.snippetId)
        ) {
          return prev;
        }

        if (prev.pane === 'library') {
          const group = findSourceGroup(librarySourceGroups, prev.sourceKey ?? '');
          if (group?.snippets.some((snippet) => snippet.id === prev.snippetId)) {
            return prev;
          }
        }
      }

      if (pendingQueue.length > 0) {
        const nextSourceKey =
          prev.pane === 'inbox' &&
          prev.sourceKey &&
          inboxSourceGroups.some(
            (group) => group.meta.sourceKey === prev.sourceKey,
          )
            ? prev.sourceKey
            : inboxSourceGroups[0]?.meta.sourceKey ?? null;
        const nextSnippet =
          (nextSourceKey
            ? firstPendingForSource(pendingQueue, nextSourceKey)
            : undefined) ?? pendingQueue[0];

        return {
          pane: 'inbox',
          sourceKey: nextSourceKey,
          snippetId: nextSnippet?.id ?? null,
          cardId: null,
        };
      }

      if (librarySourceGroups.length > 0) {
        const nextSourceKey =
          prev.pane === 'library' &&
          prev.sourceKey &&
          librarySourceGroups.some(
            (group) => group.meta.sourceKey === prev.sourceKey,
          )
            ? prev.sourceKey
            : librarySourceGroups[0]!.meta.sourceKey;
        const group = findSourceGroup(librarySourceGroups, nextSourceKey)!;

        return {
          pane: 'library',
          sourceKey: nextSourceKey,
          snippetId: group.snippets[0]?.id ?? null,
          cardId: null,
        };
      }

      return { pane: 'inbox', ...emptySelection };
    });
  }, [
    allGroups,
    dueCardQueue,
    dueQueue,
    inboxSourceGroups,
    languageCards.length,
    librarySourceGroups,
    pendingQueue,
  ]);

  const selectedGroup = useMemo(() => {
    if (selection.pane !== 'library' || !selection.sourceKey) return undefined;
    return findSourceGroup(librarySourceGroups, selection.sourceKey);
  }, [librarySourceGroups, selection.pane, selection.sourceKey]);

  const selectedSnippet = useMemo(() => {
    if (!selection.snippetId) return undefined;

    if (selection.pane === 'review-queue') {
      return dueQueue.find((snippet) => snippet.id === selection.snippetId);
    }

    if (selection.pane === 'inbox') {
      return pendingQueue.find((snippet) => snippet.id === selection.snippetId);
    }

    return findSnippet(librarySourceGroups, selection.snippetId);
  }, [
    dueQueue,
    librarySourceGroups,
    pendingQueue,
    selection.pane,
    selection.snippetId,
  ]);

  const selectedCard = useMemo(() => {
    if (!selection.cardId) return undefined;
    if (selection.pane !== 'card-review-queue') return undefined;
    return dueCardQueue.find((card) => card.id === selection.cardId);
  }, [dueCardQueue, selection.cardId, selection.pane]);

  const selectInboxSource = (sourceKeyValue: string): void => {
    const nextSnippet =
      firstPendingForSource(pendingQueue, sourceKeyValue) ?? pendingQueue[0];
    setSelection({
      pane: 'inbox',
      sourceKey: sourceKeyValue,
      snippetId: nextSnippet?.id ?? null,
      cardId: null,
    });
  };

  const selectLibrarySource = (sourceKeyValue: string): void => {
    const group = findSourceGroup(librarySourceGroups, sourceKeyValue);
    setSelection({
      pane: 'library',
      sourceKey: sourceKeyValue,
      snippetId: group?.snippets[0]?.id ?? null,
      cardId: null,
    });
  };

  const selectMyCards = (): void => {
    setSelection({
      pane: 'my-cards',
      ...emptySelection,
    });
  };

  const selectReviewQueue = (): void => {
    setSelection({
      pane: 'review-queue',
      ...emptySelection,
      snippetId: dueQueue[0]?.id ?? null,
    });
  };

  const selectCardReviewQueue = (): void => {
    setSelection({
      pane: 'card-review-queue',
      ...emptySelection,
      cardId: dueCardQueue[0]?.id ?? null,
    });
  };

  const selectReviewQueueSnippet = (snippetId: string): void => {
    setSelection({
      pane: 'review-queue',
      ...emptySelection,
      snippetId,
    });
  };

  const selectCardReviewQueueCard = (cardId: string): void => {
    setSelection({
      pane: 'card-review-queue',
      ...emptySelection,
      cardId,
    });
  };

  const selectSnippet = (snippetId: string): void => {
    const snippet = findSnippet(allGroups, snippetId);
    if (!snippet) return;

    const pane =
      effectiveTriageStatus(snippet) === 'pending' ? 'inbox' : 'library';

    setSelection({
      pane,
      sourceKey: sourceKey(snippet),
      snippetId,
      cardId: null,
    });
  };

  return {
    selection,
    inboxSourceGroups,
    librarySourceGroups,
    pendingQueue,
    dueQueue,
    dueCardQueue,
    selectedGroup,
    selectedSnippet,
    selectedCard,
    selectInboxSource,
    selectLibrarySource,
    selectMyCards,
    selectReviewQueue,
    selectCardReviewQueue,
    selectReviewQueueSnippet,
    selectCardReviewQueueCard,
    selectSnippet,
  };
}
