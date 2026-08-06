import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LANGUAGE_CARD_DRAFT_DEBOUNCE_MS,
  createDebouncedDraftSaver,
  editorContentFromLanguageCard,
  type LanguageCard,
  type LanguageCardDraftContent,
} from '@semia/shared';
import { corpusRepository } from '../data/corpusRepository';

export type EstablishedCardSaveState = 'idle' | 'saving' | 'saved' | 'error';

type UseLanguageCardEstablishedEditResult = {
  content: LanguageCardDraftContent;
  loaded: boolean;
  saveState: EstablishedCardSaveState;
  updateContent: (patch: Partial<LanguageCardDraftContent>) => void;
  flushContent: () => Promise<void>;
};

export function useLanguageCardEstablishedEdit(
  card: LanguageCard | undefined,
  enabled: boolean,
): UseLanguageCardEstablishedEditResult {
  const [content, setContent] = useState<LanguageCardDraftContent>(
    card ? editorContentFromLanguageCard(card) : {
      focusText: '',
      meaning: '',
      enabledOptionalFields: [],
      optionalSlots: {},
    },
  );
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] =
    useState<EstablishedCardSaveState>('idle');

  const cardIdRef = useRef(card?.id);
  cardIdRef.current = card?.id;

  const saverRef = useRef(
    createDebouncedDraftSaver<LanguageCardDraftContent>({
      delayMs: LANGUAGE_CARD_DRAFT_DEBOUNCE_MS,
      save: async (nextContent) => {
        const cardId = cardIdRef.current;
        if (!cardId) return;

        setSaveState('saving');
        await corpusRepository.updateLanguageCardContent(cardId, nextContent);
        setSaveState('saved');
      },
    }),
  );

  useEffect(() => {
    const saver = saverRef.current;
    let cancelled = false;

    if (!enabled || !card) {
      setLoaded(false);
      return () => {
        saver.cancel();
      };
    }

    setLoaded(false);
    setSaveState('idle');
    const nextContent = editorContentFromLanguageCard(card);
    setContent(nextContent);

    queueMicrotask(() => {
      if (!cancelled) {
        setLoaded(true);
      }
    });

    return () => {
      cancelled = true;
      void saver.flush().catch(() => {
        setSaveState('error');
      });
      saver.cancel();
    };
  }, [card, enabled]);

  const updateContent = useCallback((patch: Partial<LanguageCardDraftContent>) => {
    setContent((current) => {
      const next = { ...current, ...patch };
      saverRef.current.schedule(next);
      return next;
    });
    setSaveState('idle');
  }, []);

  const flushContent = useCallback(async (): Promise<void> => {
    try {
      await saverRef.current.flush();
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  }, []);

  return {
    content,
    loaded,
    saveState,
    updateContent,
    flushContent,
  };
}
