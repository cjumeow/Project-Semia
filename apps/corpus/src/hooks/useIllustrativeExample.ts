import { useCallback, useState } from 'react';
import { corpusRepository } from '../data/corpusRepository';
import type { CorpusSnippet } from '../types/corpus';

type UseIllustrativeExampleResult = {
  generating: boolean;
  saving: boolean;
  error: string | null;
  generate: () => Promise<void>;
  save: (text: string) => Promise<void>;
};

export function useIllustrativeExample(
  snippet: CorpusSnippet | undefined,
  onUpdated: () => Promise<void>,
): UseIllustrativeExampleResult {
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (): Promise<void> => {
    if (!snippet) return;

    setGenerating(true);
    setError(null);
    try {
      await corpusRepository.generateIllustrativeExample(snippet);
      await onUpdated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate illustrative example.',
      );
    } finally {
      setGenerating(false);
    }
  }, [snippet, onUpdated]);

  const save = useCallback(
    async (text: string): Promise<void> => {
      if (!snippet) return;

      setSaving(true);
      setError(null);
      try {
        await corpusRepository.saveIllustrativeExample(snippet.id, text);
        await onUpdated();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to save illustrative example.',
        );
      } finally {
        setSaving(false);
      }
    },
    [snippet, onUpdated],
  );

  return { generating, saving, error, generate, save };
}
