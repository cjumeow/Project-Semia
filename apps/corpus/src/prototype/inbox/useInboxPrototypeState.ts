import { useMemo, useState } from 'react';
import {
  createInitialPrototypeSnippets,
  inboxSources,
  librarySources,
  setSnippetStatus,
  simulateCapture,
  snippetsForPane,
  type SidebarPane,
} from './inboxTriageModel';

export type InboxSelection = {
  pane: SidebarPane;
  sourceKey: string;
  snippetId: string | null;
};

export function useInboxPrototypeState() {
  const [snippets, setSnippets] = useState(createInitialPrototypeSnippets);
  const [selection, setSelection] = useState<InboxSelection | null>(() => {
    const initial = createInitialPrototypeSnippets();
    const firstInbox = inboxSources(initial)[0];
    if (!firstInbox) return null;
    const visible = snippetsForPane(initial, firstInbox.sourceKey, 'inbox');
    return {
      pane: 'inbox',
      sourceKey: firstInbox.sourceKey,
      snippetId: visible[0]?.id ?? null,
    };
  });

  const inbox = useMemo(() => inboxSources(snippets), [snippets]);
  const library = useMemo(() => librarySources(snippets), [snippets]);

  const visibleSnippets = selection
    ? snippetsForPane(snippets, selection.sourceKey, selection.pane)
    : [];

  const selectedSnippet =
    visibleSnippets.find((snippet) => snippet.id === selection?.snippetId) ??
    visibleSnippets[0] ??
    null;

  const selectedSource =
    inbox.find((source) => source.sourceKey === selection?.sourceKey) ??
    library.find((source) => source.sourceKey === selection?.sourceKey) ??
    null;

  const allPendingSnippets = useMemo(
    () => snippets.filter((snippet) => snippet.triageStatus === 'pending'),
    [snippets],
  );

  function selectSource(pane: SidebarPane, sourceKey: string): void {
    const nextSnippets = snippetsForPane(snippets, sourceKey, pane);
    setSelection({
      pane,
      sourceKey,
      snippetId: nextSnippets[0]?.id ?? null,
    });
  }

  function selectSnippet(snippetId: string, sourceKey?: string, pane?: SidebarPane): void {
    if (!selection && !sourceKey) return;
    const snippet = snippets.find((item) => item.id === snippetId);
    setSelection({
      pane: pane ?? selection?.pane ?? 'inbox',
      sourceKey: sourceKey ?? snippet?.sourceKey ?? selection!.sourceKey,
      snippetId,
    });
  }

  function markSnippet(snippetId: string, status: 'review' | 'mastered'): void {
    const next = setSnippetStatus(snippets, snippetId, status);
    setSnippets(next);

    if (!selection) return;
    const stillVisible = snippetsForPane(next, selection.sourceKey, selection.pane);
    if (stillVisible.some((snippet) => snippet.id === snippetId)) {
      if (selection.snippetId === snippetId) return;
      return;
    }
    setSelection({
      ...selection,
      snippetId: stillVisible[0]?.id ?? null,
    });
  }

  function handleSimulateCapture(): void {
    if (!selection || selection.pane !== 'library') return;
    const next = simulateCapture(
      snippets,
      selection.sourceKey,
      'new capture phrase',
    );
    setSnippets(next);
    const pending = snippetsForPane(next, selection.sourceKey, 'inbox');
    const lastPending = pending[pending.length - 1];
    if (lastPending) {
      setSelection({
        pane: 'inbox',
        sourceKey: selection.sourceKey,
        snippetId: lastPending.id,
      });
    }
  }

  return {
    snippets,
    inbox,
    library,
    selection,
    visibleSnippets,
    selectedSnippet,
    selectedSource,
    allPendingSnippets,
    selectSource,
    selectSnippet,
    markSnippet,
    handleSimulateCapture,
    setSelection,
  };
}

export type InboxPrototypeState = ReturnType<typeof useInboxPrototypeState>;
