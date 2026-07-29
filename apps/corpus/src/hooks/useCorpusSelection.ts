import { sourceKey } from '@semia/shared';
import { useEffect, useMemo, useState } from 'react';
import type { CorpusSelection, SourceGroup } from '../types/corpus';
import { findSnippet, findSourceGroup } from '../utils/corpusGrouping';

type UseCorpusSelectionResult = {
  selection: CorpusSelection;
  selectedGroup: SourceGroup | undefined;
  selectedSnippet: ReturnType<typeof findSnippet>;
  selectSource: (sourceKeyValue: string) => void;
  selectSnippet: (snippetId: string) => void;
};

export function useCorpusSelection(
  groups: SourceGroup[],
): UseCorpusSelectionResult {
  const [selection, setSelection] = useState<CorpusSelection>({
    sourceKey: null,
    snippetId: null,
  });

  useEffect(() => {
    if (groups.length === 0) {
      setSelection({ sourceKey: null, snippetId: null });
      return;
    }

    setSelection((prev) => {
      if (prev.snippetId && findSnippet(groups, prev.snippetId)) {
        return prev;
      }

      if (prev.sourceKey) {
        const group = findSourceGroup(groups, prev.sourceKey);
        if (group) {
          return {
            sourceKey: prev.sourceKey,
            snippetId: group.snippets[0]?.id ?? null,
          };
        }
      }

      const first = groups[0]!;
      return {
        sourceKey: first.meta.sourceKey,
        snippetId: first.snippets[0]?.id ?? null,
      };
    });
  }, [groups]);

  const selectedGroup = useMemo(
    () =>
      selection.sourceKey
        ? findSourceGroup(groups, selection.sourceKey)
        : undefined,
    [groups, selection.sourceKey],
  );

  const selectedSnippet = useMemo(
    () =>
      selection.snippetId
        ? findSnippet(groups, selection.snippetId)
        : undefined,
    [groups, selection.snippetId],
  );

  const selectSource = (sourceKeyValue: string): void => {
    const group = findSourceGroup(groups, sourceKeyValue);
    const firstSnippet = group?.snippets[0];
    setSelection({
      sourceKey: sourceKeyValue,
      snippetId: firstSnippet?.id ?? null,
    });
  };

  const selectSnippet = (snippetId: string): void => {
    const snippet = findSnippet(groups, snippetId);
    if (!snippet) return;
    setSelection({ sourceKey: sourceKey(snippet), snippetId });
  };

  return {
    selection,
    selectedGroup,
    selectedSnippet,
    selectSource,
    selectSnippet,
  };
}
