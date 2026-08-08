import type {
  LanguageCardDraftContent,
  LanguageCardFieldSuggestions,
  LanguageCardSuggestableField,
} from '@semia/shared';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { corpusRepository } from '../data/corpusRepository';
import type { CorpusSnippet } from '../types/corpus';
import { languageCardSuggestionCacheKey } from './languageCardSuggestionCacheKey';
import {
  buildSuggestionFieldView,
  gateSuggestionView,
  type LanguageCardFieldSuggestionView,
} from './languageCardSuggestionViews';
import {
  emptyLanguageCardSuggestionFields,
  focusAppearsInSpeech,
  focusBaseFormSuggestion,
  shouldRequestLanguageCardFieldSuggestions,
  type LanguageCardSuggestionField,
} from './languageCardSuggestionLogic';

const SUGGESTION_DEBOUNCE_MS = 400;

type PrefetchCacheEntry = {
  focusKey: string;
  baseForm: string | null;
  meaning: string;
  example: string;
};

type PrefetchState = {
  focusKey: string;
  baseForm: string | null;
  meaning: string;
  example: string;
};

type DismissState = {
  focusKey: string;
  focus: boolean;
  meaning: boolean;
  example: boolean;
};

const prefetchCache = new Map<string, PrefetchCacheEntry>();

export type { LanguageCardFieldSuggestionView } from './languageCardSuggestionViews';

export type LanguageCardFieldSuggestionsView = {
  focus: LanguageCardFieldSuggestionView;
  meaning: LanguageCardFieldSuggestionView;
  example: LanguageCardFieldSuggestionView;
  markFocusTextPicked: () => void;
  setFocusedField: (field: LanguageCardSuggestionField | null) => void;
};

export function useLanguageCardFieldSuggestions({
  snippet,
  content,
  enabled,
  isLive,
  onAccept,
}: {
  snippet: CorpusSnippet | undefined;
  content: LanguageCardDraftContent;
  enabled: boolean;
  isLive: boolean;
  onAccept: (field: LanguageCardSuggestionField, value: string) => void;
}): LanguageCardFieldSuggestionsView {
  const [prefetch, setPrefetch] = useState<PrefetchState | null>(null);
  const [dismissed, setDismissed] = useState<DismissState>({
    focusKey: '',
    focus: false,
    meaning: false,
    example: false,
  });
  const [focusedField, setFocusedField] = useState<LanguageCardSuggestionField | null>(
    null,
  );

  const requestIdRef = useRef(0);
  const immediatePrefetchRef = useRef(false);
  const snippetRef = useRef(snippet);
  snippetRef.current = snippet;

  const focusKey = content.focusText.trim();
  const meaningEmpty = content.meaning.trim().length === 0;
  const exampleEnabled = content.enabledOptionalFields.includes('example');
  const exampleEmpty = (content.optionalSlots.example ?? '').trim().length === 0;
  const emptyFields = useMemo(
    () =>
      emptyLanguageCardSuggestionFields({
        meaningEmpty,
        exampleEnabled,
        exampleEmpty,
      }),
    [exampleEmpty, exampleEnabled, meaningEmpty],
  );
  const noteGeneratedAt = snippet?.note.generatedAt;
  const cacheKey = languageCardSuggestionCacheKey(
    snippet?.id,
    noteGeneratedAt,
    focusKey,
    emptyFields,
  );

  const markFocusTextPicked = useCallback(() => {
    immediatePrefetchRef.current = true;
  }, []);

  useEffect(() => {
    requestIdRef.current += 1;
    setPrefetch(null);
  }, [focusKey]);

  useEffect(() => {
    setPrefetch(null);
    setDismissed({
      focusKey,
      focus: false,
      meaning: false,
      example: false,
    });
  }, [snippet?.id]);

  useEffect(() => {
    if (dismissed.focusKey !== focusKey) {
      setDismissed({
        focusKey,
        focus: false,
        meaning: false,
        example: false,
      });
    }
  }, [dismissed.focusKey, focusKey]);

  useEffect(() => {
    if (!enabled || !isLive || !snippetRef.current || !focusKey || !noteGeneratedAt) {
      setPrefetch(null);
      return;
    }

    const focusInSpeech = focusAppearsInSpeech(
      focusKey,
      snippetRef.current.note.originalSpeech,
    );
    const shouldRequestFields = shouldRequestLanguageCardFieldSuggestions({
      focusInSpeech,
      emptyFields,
    });

    if (cacheKey && prefetchCache.has(cacheKey)) {
      const cached = prefetchCache.get(cacheKey)!;
      setPrefetch({
        focusKey: cached.focusKey,
        baseForm: cached.baseForm,
        meaning: cached.meaning,
        example: cached.example,
      });
      return;
    }

    const requestId = ++requestIdRef.current;
    const delay = immediatePrefetchRef.current ? 0 : SUGGESTION_DEBOUNCE_MS;
    immediatePrefetchRef.current = false;

    const timer = window.setTimeout(() => {
      const currentSnippet = snippetRef.current;
      if (!currentSnippet) {
        return;
      }

      const baseFormPromise = corpusRepository.suggestBaseForm({
        fragment: currentSnippet,
        focusText: focusKey,
      });

      const fieldsPromise: Promise<LanguageCardFieldSuggestions> = shouldRequestFields
        ? corpusRepository.suggestLanguageCardFields({
            fragment: currentSnippet,
            focusText: focusKey,
            fields: emptyFields as LanguageCardSuggestableField[],
          })
        : Promise.resolve({});

      void Promise.all([baseFormPromise, fieldsPromise])
        .then(([baseFormSuggestion, fieldSuggestions]) => {
          if (requestId !== requestIdRef.current) {
            return;
          }

          const nextEntry: PrefetchCacheEntry = {
            focusKey,
            baseForm: baseFormSuggestion.baseForm,
            meaning: fieldSuggestions.meaning?.trim() ?? '',
            example: fieldSuggestions.example?.trim() ?? '',
          };

          if (cacheKey) {
            prefetchCache.set(cacheKey, nextEntry);
          }

          setPrefetch({
            focusKey,
            baseForm: nextEntry.baseForm,
            meaning: nextEntry.meaning,
            example: nextEntry.example,
          });
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) {
            return;
          }
          setPrefetch(null);
        });
    }, delay);

    return () => {
      window.clearTimeout(timer);
      requestIdRef.current += 1;
    };
  }, [
    cacheKey,
    emptyFields,
    enabled,
    focusKey,
    isLive,
    noteGeneratedAt,
  ]);

  const dismissField = useCallback((field: LanguageCardSuggestionField) => {
    setDismissed((current) =>
      current.focusKey === focusKey
        ? { ...current, [field]: true }
        : {
            focusKey,
            focus: field === 'focus',
            meaning: field === 'meaning',
            example: field === 'example',
          },
    );
  }, [focusKey]);

  const focusSuggestion = focusBaseFormSuggestion(
    prefetch?.focusKey === focusKey ? prefetch.baseForm : null,
    focusKey,
  );
  const meaningSuggestion =
    prefetch?.focusKey === focusKey && meaningEmpty ? prefetch.meaning : '';
  const exampleSuggestion =
    prefetch?.focusKey === focusKey && exampleEnabled && exampleEmpty
      ? prefetch.example
      : '';

  const focusView = buildSuggestionFieldView({
    suggestion: focusSuggestion,
    dismissed: dismissed.focusKey === focusKey && dismissed.focus,
    onAccept: () => {
      if (!focusSuggestion) {
        return;
      }
      onAccept('focus', focusSuggestion);
      setPrefetch(null);
    },
    onDismiss: () => dismissField('focus'),
  });

  const meaningView = buildSuggestionFieldView({
    suggestion: meaningSuggestion || null,
    dismissed: dismissed.focusKey === focusKey && dismissed.meaning,
    onAccept: () => {
      if (!meaningSuggestion) {
        return;
      }
      onAccept('meaning', meaningSuggestion);
      setPrefetch((current) =>
        current ? { ...current, meaning: '' } : current,
      );
    },
    onDismiss: () => dismissField('meaning'),
  });

  const exampleView = buildSuggestionFieldView({
    suggestion: exampleSuggestion || null,
    dismissed: dismissed.focusKey === focusKey && dismissed.example,
    onAccept: () => {
      if (!exampleSuggestion) {
        return;
      }
      onAccept('example', exampleSuggestion);
      setPrefetch((current) =>
        current ? { ...current, example: '' } : current,
      );
    },
    onDismiss: () => dismissField('example'),
  });

  return {
    focus: gateSuggestionView(enabled, focusedField, 'focus', focusView),
    meaning: gateSuggestionView(enabled, focusedField, 'meaning', meaningView),
    example: gateSuggestionView(enabled, focusedField, 'example', exampleView),
    markFocusTextPicked,
    setFocusedField,
  };
}
