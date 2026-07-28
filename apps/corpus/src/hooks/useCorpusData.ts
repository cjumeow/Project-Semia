import { useCallback, useEffect, useState } from 'react';
import { corpusRepository } from '../data/corpusRepository';
import type { VideoGroup } from '../types/corpus';
import { groupSnippetsByVideo } from '../utils/corpusGrouping';
import { fragmentToSnippet } from '../utils/fragmentToSnippet';

type UseCorpusDataResult = {
  groups: VideoGroup[];
  loading: boolean;
  error: string | null;
  fragmentCount: number;
  isLive: boolean;
  refresh: () => Promise<void>;
};

export function useCorpusData(): UseCorpusDataResult {
  const [groups, setGroups] = useState<VideoGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fragmentCount, setFragmentCount] = useState(0);
  const isLive = corpusRepository.isLive();

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const [fragments, snippetNotes] = await Promise.all([
        corpusRepository.listFragments(),
        corpusRepository.getSnippetNotes(),
      ]);
      setFragmentCount(fragments.length);
      const snippets = fragments.map((fragment) =>
        fragmentToSnippet(fragment, snippetNotes[fragment.id]),
      );
      setGroups(groupSnippetsByVideo(snippets));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load captures.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    return corpusRepository.subscribe(() => {
      void refresh();
    });
  }, [refresh]);

  return { groups, loading, error, fragmentCount, isLive, refresh };
}
