import { useEffect, useRef, useState } from 'react';
import { corpusRepository } from '../data/corpusRepository';
import type { CorpusSnippet } from '../types/corpus';
import { isGeneratedNote } from '../types/corpus';

type UseContextWindowGenerationResult = {
  generating: boolean;
  error: string | null;
};

export function useContextWindowGeneration(
  snippet: CorpusSnippet | undefined,
  onUpdated: () => Promise<void>,
  contextWindowEnabled: boolean,
): UseContextWindowGenerationResult {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoAttemptedForId = useRef<string | null>(null);

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
    let cancelled = false;

    void (async () => {
      setGenerating(true);
      setError(null);
      try {
        await corpusRepository.generateContextWindow(snippet);
        if (!cancelled) {
          await onUpdated();
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to generate context window.',
          );
        }
      } finally {
        if (!cancelled) {
          setGenerating(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    contextWindowEnabled,
    onUpdated,
    snippet,
    snippet?.id,
    snippet?.note.dynamicContextBlock,
    snippet?.note.generatedAt,
  ]);

  return { generating, error };
}
