import { useCallback, useEffect, useState } from 'react';
import { corpusRepository } from '../data/corpusRepository';

type UseCorpusNoteResult = {
  markdown: string;
  saving: boolean;
  save: (markdown: string) => Promise<void>;
};

export function useCorpusNote(fragmentId: string | undefined): UseCorpusNoteResult {
  const [markdown, setMarkdown] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    if (!fragmentId) {
      setMarkdown('');
      return;
    }

    const notes = await corpusRepository.getNotes();
    setMarkdown(notes[fragmentId]?.markdown ?? '');
  }, [fragmentId]);

  useEffect(() => {
    void load();
    return corpusRepository.subscribe(() => {
      void load();
    });
  }, [load]);

  const save = useCallback(
    async (nextMarkdown: string): Promise<void> => {
      if (!fragmentId) return;

      setSaving(true);
      try {
        await corpusRepository.saveNote(fragmentId, nextMarkdown);
        setMarkdown(nextMarkdown);
      } finally {
        setSaving(false);
      }
    },
    [fragmentId],
  );

  return { markdown, saving, save };
}
