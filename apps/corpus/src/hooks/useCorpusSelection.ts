import { useMemo, useState } from 'react';
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
  const defaultVideoId = groups[0]?.meta.videoId ?? null;
  const defaultSnippetId = groups[0]?.snippets[0]?.id ?? null;

  const [selection, setSelection] = useState<CorpusSelection>({
    videoId: defaultVideoId,
    snippetId: defaultSnippetId,
  });

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
