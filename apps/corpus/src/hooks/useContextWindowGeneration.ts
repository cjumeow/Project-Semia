import { useCallback, useState } from 'react';
import { corpusRepository } from '../data/corpusRepository';
import type { CorpusSnippet } from '../types/corpus';
import { isGeneratedNote } from '../types/corpus';

type UseContextWindowGenerationResult = {
  generating: boolean;
  error: string | null;
  generate: () => Promise<void>;
};

export function useContextWindowGeneration(
  snippet: CorpusSnippet | undefined,
  onUpdated: () => Promise<void>,
): UseContextWindowGenerationResult {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (): Promise<void> => {
    if (!snippet || !isGeneratedNote(snippet.note)) return;

    setGenerating(true);
    setError(null);
    try {
      await corpusRepository.generateContextWindow(snippet);
      await onUpdated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate context window.',
      );
    } finally {
      setGenerating(false);
    }
  }, [snippet, onUpdated]);

  return { generating, error, generate };
}
