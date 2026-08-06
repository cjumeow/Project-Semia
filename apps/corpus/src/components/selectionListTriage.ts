import type { CorpusSnippet } from '../types/corpus';

/** Snippets still animating out or waiting to be shown. */
export function visibleTriageSnippets(
  snippets: CorpusSnippet[],
  hiddenAfterExitIds: ReadonlySet<string>,
): CorpusSnippet[] {
  return snippets.filter((snippet) => !hiddenAfterExitIds.has(snippet.id));
}

export function pruneHiddenAfterExitIds(
  hiddenAfterExitIds: ReadonlySet<string>,
  snippetIds: ReadonlySet<string>,
): Set<string> {
  const next = new Set<string>();
  for (const id of hiddenAfterExitIds) {
    if (snippetIds.has(id)) {
      next.add(id);
    }
  }
  return next;
}
