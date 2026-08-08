import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LANGUAGE_CARD_DRAFT_DEBOUNCE_MS,
  createLanguageCardDraftContentWithDefaultFields,
  isLanguageCardDraftContentEmpty,
  type LanguageCardDraft,
  type LanguageCardDraftContent,
  type LanguageCardOptionalFieldKey,
  createDebouncedDraftSaver,
} from '@semia/shared';
import { corpusRepository } from '../data/corpusRepository';

export type LanguageCardDraftSaveState = 'idle' | 'saving' | 'saved' | 'error';

type UseLanguageCardDraftResult = {
  draft: LanguageCardDraftContent;
  loaded: boolean;
  saveState: LanguageCardDraftSaveState;
  updateDraft: (patch: Partial<LanguageCardDraftContent>) => void;
  flushDraft: () => Promise<void>;
  resetDraftToCapture: () => void;
};

function toDraftContent(draft: LanguageCardDraft): LanguageCardDraftContent {
  return {
    focusText: draft.focusText,
    meaning: draft.meaning,
    enabledOptionalFields: draft.enabledOptionalFields,
    optionalSlots: draft.optionalSlots,
  };
}

export function useLanguageCardDraft(
  sourceFragmentId: string | undefined,
  defaultOptionalFields: ReadonlyArray<LanguageCardOptionalFieldKey> = [],
): UseLanguageCardDraftResult {
  const defaultFieldsRef = useRef(defaultOptionalFields);
  defaultFieldsRef.current = defaultOptionalFields;

  const freshDraft = () =>
    createLanguageCardDraftContentWithDefaultFields(defaultFieldsRef.current);

  const [draft, setDraft] = useState<LanguageCardDraftContent>(freshDraft);
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState<LanguageCardDraftSaveState>('idle');

  const draftRef = useRef(draft);
  draftRef.current = draft;

  const fragmentIdRef = useRef(sourceFragmentId);
  fragmentIdRef.current = sourceFragmentId;

  const saverRef = useRef(
    createDebouncedDraftSaver<LanguageCardDraftContent>({
      delayMs: LANGUAGE_CARD_DRAFT_DEBOUNCE_MS,
      save: async (content) => {
        const fragmentId = fragmentIdRef.current;
        if (!fragmentId) return;

        if (isLanguageCardDraftContentEmpty(content)) {
          setSaveState('saving');
          await corpusRepository.clearLanguageCardDraft(fragmentId);
          setSaveState('saved');
          return;
        }

        const nextDraft: LanguageCardDraft = {
          sourceFragmentId: fragmentId,
          updatedAt: new Date().toISOString(),
          ...content,
        };

        setSaveState('saving');
        await corpusRepository.saveLanguageCardDraft(nextDraft);
        setSaveState('saved');
      },
    }),
  );

  useEffect(() => {
    const saver = saverRef.current;
    let cancelled = false;

    const loadDraft = async (): Promise<void> => {
      if (!sourceFragmentId) {
        setDraft(freshDraft());
        setLoaded(true);
        setSaveState('idle');
        return;
      }

      setLoaded(false);
      setSaveState('idle');

      try {
        const stored = await corpusRepository.getLanguageCardDraft(sourceFragmentId);
        if (cancelled) return;
        setDraft(stored ? toDraftContent(stored) : freshDraft());
        setLoaded(true);
      } catch {
        if (cancelled) return;
        setDraft(freshDraft());
        setLoaded(true);
        setSaveState('error');
      }
    };

    void loadDraft();

    return () => {
      cancelled = true;
      void saver.flush().catch(() => {
        setSaveState('error');
      });
      saver.cancel();
    };
  }, [sourceFragmentId]);

  const updateDraft = useCallback((patch: Partial<LanguageCardDraftContent>) => {
    setDraft((current) => {
      const next = { ...current, ...patch };
      draftRef.current = next;
      saverRef.current.schedule(next);
      return next;
    });
    setSaveState('idle');
  }, []);

  const flushDraft = useCallback(async (): Promise<void> => {
    try {
      await saverRef.current.flush();
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  }, []);

  const resetDraftToCapture = useCallback(() => {
    const next = freshDraft();
    setDraft(next);
    draftRef.current = next;
    saverRef.current.schedule(next);
    setSaveState('idle');
  }, []);

  return {
    draft,
    loaded,
    saveState,
    updateDraft,
    flushDraft,
    resetDraftToCapture,
  };
}
