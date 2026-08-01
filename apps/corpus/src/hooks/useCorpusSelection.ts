import { sourceKey } from '@semia/shared';
import { useEffect, useMemo, useState } from 'react';
import type { CorpusPane, CorpusSelection, CorpusSnippet, SourceGroup } from '../types/corpus';
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
  selectedGroup: SourceGroup | undefined;
  selectedSnippet: CorpusSnippet | undefined;
  selectInboxSource: (sourceKeyValue: string) => void;
  selectLibrarySource: (sourceKeyValue: string) => void;
  selectReviewQueue: () => void;
  selectReviewQueueSnippet: (snippetId: string) => void;
  selectSnippet: (snippetId: string) => void;
};

function firstPendingForSource(
  queue: CorpusSnippet[],
  sourceKeyValue: string,
): CorpusSnippet | undefined {
  return queue.find((snippet) => sourceKey(snippet) === sourceKeyValue);
}

export function useCorpusSelection(
  allGroups: SourceGroup[],
  snippets: CorpusSnippet[],
): UseCorpusSelectionResult {
  const inboxSourceGroups = useMemo(() => inboxGroups(allGroups), [allGroups]);
  const librarySourceGroups = useMemo(
    () => libraryGroups(allGroups),
    [allGroups],
  );
  const pendingQueue = useMemo(() => pendingSnippets(snippets), [snippets]);
  const dueQueue = useMemo(() => dueReviewSnippets(snippets), [snippets]);

  const [selection, setSelection] = useState<CorpusSelection>({
    pane: 'inbox',
    sourceKey: null,
    snippetId: null,
  });

  useEffect(() => {
    if (allGroups.length === 0) {
      setSelection({ pane: 'inbox', sourceKey: null, snippetId: null });
      return;
    }

    setSelection((prev) => {
      if (prev.pane === 'review-queue') {
        if (
          prev.snippetId &&
          dueQueue.some((snippet) => snippet.id === prev.snippetId)
        ) {
          return prev;
        }

        return {
          pane: 'review-queue',
          sourceKey: null,
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
        };
      }

      return { pane: 'inbox', sourceKey: null, snippetId: null };
    });
  }, [allGroups, dueQueue, inboxSourceGroups, librarySourceGroups, pendingQueue]);

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

  const selectInboxSource = (sourceKeyValue: string): void => {
    const nextSnippet =
      firstPendingForSource(pendingQueue, sourceKeyValue) ?? pendingQueue[0];
    setSelection({
      pane: 'inbox',
      sourceKey: sourceKeyValue,
      snippetId: nextSnippet?.id ?? null,
    });
  };

  const selectLibrarySource = (sourceKeyValue: string): void => {
    const group = findSourceGroup(librarySourceGroups, sourceKeyValue);
    setSelection({
      pane: 'library',
      sourceKey: sourceKeyValue,
      snippetId: group?.snippets[0]?.id ?? null,
    });
  };

  const selectReviewQueue = (): void => {
    setSelection({
      pane: 'review-queue',
      sourceKey: null,
      snippetId: dueQueue[0]?.id ?? null,
    });
  };

  const selectReviewQueueSnippet = (snippetId: string): void => {
    setSelection({
      pane: 'review-queue',
      sourceKey: null,
      snippetId,
    });
  };

  const selectSnippet = (snippetId: string): void => {
    const snippet = findSnippet(allGroups, snippetId);
    if (!snippet) return;

    const pane: CorpusPane =
      effectiveTriageStatus(snippet) === 'pending' ? 'inbox' : 'library';

    setSelection({
      pane,
      sourceKey: sourceKey(snippet),
      snippetId,
    });
  };

  return {
    selection,
    inboxSourceGroups,
    librarySourceGroups,
    pendingQueue,
    dueQueue,
    selectedGroup,
    selectedSnippet,
    selectInboxSource,
    selectLibrarySource,
    selectReviewQueue,
    selectReviewQueueSnippet,
    selectSnippet,
  };
}
