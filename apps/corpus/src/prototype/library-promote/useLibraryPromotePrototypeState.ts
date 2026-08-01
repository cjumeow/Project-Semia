import { useMemo, useState } from 'react';
import {
  createLibraryPromoteMockSnippets,
  describePromoteState,
} from './mockSnippets';

export function useLibraryPromotePrototypeState() {
  const [snippets, setSnippets] = useState(createLibraryPromoteMockSnippets);
  const [selectedId, setSelectedId] = useState<string | null>('r1');

  const selectedSnippet = useMemo(
    () => snippets.find((snippet) => snippet.id === selectedId) ?? null,
    [selectedId, snippets],
  );

  function markMastered(snippetId: string): void {
    setSnippets((current) =>
      current.map((snippet) =>
        snippet.id === snippetId
          ? { ...snippet, triageStatus: 'mastered' as const }
          : snippet,
      ),
    );
  }

  return {
    snippets,
    selectedId,
    selectedSnippet,
    stateSummary: describePromoteState(snippets),
    selectSnippet: setSelectedId,
    markMastered,
  };
}

export type LibraryPromotePrototypeState = ReturnType<
  typeof useLibraryPromotePrototypeState
>;
