import { useEffect, useMemo, useState } from 'react';
import type { CorpusSelection, VideoGroup } from '../types/corpus';
import { findSnippet, findVideoGroup } from '../utils/corpusGrouping';

type UseCorpusSelectionResult = {
  selection: CorpusSelection;
  selectedGroup: VideoGroup | undefined;
  selectedSnippet: ReturnType<typeof findSnippet>;
  selectVideo: (videoId: string) => void;
  selectSnippet: (snippetId: string) => void;
};

export function useCorpusSelection(
  groups: VideoGroup[],
): UseCorpusSelectionResult {
  const [selection, setSelection] = useState<CorpusSelection>({
    videoId: null,
    snippetId: null,
  });

  useEffect(() => {
    if (groups.length === 0) {
      setSelection({ videoId: null, snippetId: null });
      return;
    }

    setSelection((prev) => {
      if (prev.snippetId && findSnippet(groups, prev.snippetId)) {
        return prev;
      }

      if (prev.videoId) {
        const group = findVideoGroup(groups, prev.videoId);
        if (group) {
          return {
            videoId: prev.videoId,
            snippetId: group.snippets[0]?.id ?? null,
          };
        }
      }

      const first = groups[0]!;
      return {
        videoId: first.meta.videoId,
        snippetId: first.snippets[0]?.id ?? null,
      };
    });
  }, [groups]);

  const selectedGroup = useMemo(
    () =>
      selection.videoId
        ? findVideoGroup(groups, selection.videoId)
        : undefined,
    [groups, selection.videoId],
  );

  const selectedSnippet = useMemo(
    () =>
      selection.snippetId
        ? findSnippet(groups, selection.snippetId)
        : undefined,
    [groups, selection.snippetId],
  );

  const selectVideo = (videoId: string): void => {
    const group = findVideoGroup(groups, videoId);
    const firstSnippet = group?.snippets[0];
    setSelection({
      videoId,
      snippetId: firstSnippet?.id ?? null,
    });
  };

  const selectSnippet = (snippetId: string): void => {
    const snippet = findSnippet(groups, snippetId);
    if (!snippet) return;
    setSelection({ videoId: snippet.videoId, snippetId });
  };

  return {
    selection,
    selectedGroup,
    selectedSnippet,
    selectVideo,
    selectSnippet,
  };
}
