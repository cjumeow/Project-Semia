import { sourceKey } from '@semia/shared';
import type { CorpusSelection, CorpusSnippet, SourceGroup } from '../types/corpus';

function firstPendingForSource(
  queue: CorpusSnippet[],
  sourceKeyValue: string,
): CorpusSnippet | undefined {
  return queue.find((snippet) => sourceKey(snippet) === sourceKeyValue);
}

/** Advance inbox selection when the currently selected snippet is triaged out. */
export function inboxSelectionAfterTriage(
  triagedSnippetId: string,
  current: CorpusSelection,
  pendingQueue: CorpusSnippet[],
  inboxSourceGroups: SourceGroup[],
): CorpusSelection | null {
  if (current.pane !== 'inbox' || current.snippetId !== triagedSnippetId) {
    return null;
  }

  const remaining = pendingQueue.filter(
    (snippet) => snippet.id !== triagedSnippetId,
  );
  if (remaining.length === 0) {
    return {
      pane: 'inbox',
      sourceKey: current.sourceKey,
      snippetId: null,
      cardId: null,
    };
  }

  const nextSourceKey =
    current.sourceKey &&
    inboxSourceGroups.some((group) => group.meta.sourceKey === current.sourceKey)
      ? current.sourceKey
      : inboxSourceGroups[0]?.meta.sourceKey ?? null;
  const nextSnippet =
    (nextSourceKey
      ? firstPendingForSource(remaining, nextSourceKey)
      : undefined) ?? remaining[0]!;

  return {
    pane: 'inbox',
    sourceKey: nextSourceKey,
    snippetId: nextSnippet.id,
    cardId: null,
  };
}

/** Avoid a blank detail panel while selection still points at a removed snippet. */
export function resolveInboxSelectedSnippet(
  snippetId: string | null,
  pendingQueue: CorpusSnippet[],
): CorpusSnippet | undefined {
  if (!snippetId) return undefined;
  const found = pendingQueue.find((snippet) => snippet.id === snippetId);
  if (found) return found;
  return pendingQueue[0];
}
