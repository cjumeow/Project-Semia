import { useCallback, useEffect, useState } from 'react';
import { corpusRepository } from '../data/corpusRepository';
import type { CorpusSnippet } from '../types/corpus';
import { isGeneratedNote } from '../types/corpus';

type UseSnippetNoteGenerationResult = {
  generating: boolean;
  error: string | null;
  regenerate: () => Promise<void>;
};

export function useSnippetNoteGeneration(
  snippet: CorpusSnippet | undefined,
  onUpdated: () => Promise<void>,
): UseSnippetNoteGenerationResult {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const regenerate = useCallback(async (): Promise<void> => {
    if (!snippet) return;

    setGenerating(true);
    setError(null);
    try {
      await corpusRepository.generateSnippetNote(snippet);
      await onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate note.');
    } finally {
      setGenerating(false);
    }
  }, [snippet, onUpdated]);

  useEffect(() => {
    if (!snippet || isGeneratedNote(snippet.note)) return;
    void regenerate();
  }, [snippet?.id, regenerate]);

  return { generating, error, regenerate };
}
