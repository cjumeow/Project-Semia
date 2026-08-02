import { useCallback, useEffect, useRef, useState } from 'react';
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
  contextWindowEnabled: boolean,
): UseContextWindowGenerationResult {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoAttemptedForId = useRef<string | null>(null);

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

  useEffect(() => {
    autoAttemptedForId.current = null;
  }, [snippet?.id]);

  useEffect(() => {
    if (!contextWindowEnabled || !snippet || !isGeneratedNote(snippet.note)) {
      return;
    }
    if (snippet.note.dynamicContextBlock?.trim()) {
      return;
    }
    if (autoAttemptedForId.current === snippet.id) {
      return;
    }

    autoAttemptedForId.current = snippet.id;
    void generate();
  }, [
    contextWindowEnabled,
    generate,
    snippet,
    snippet?.id,
    snippet?.note.dynamicContextBlock,
    snippet?.note.generatedAt,
  ]);

  return { generating, error, generate };
}
