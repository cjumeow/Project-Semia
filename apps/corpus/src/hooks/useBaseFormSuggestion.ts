import { useCallback, useEffect, useRef, useState } from 'react';
import { corpusRepository } from '../data/corpusRepository';
import type { CorpusSnippet } from '../types/corpus';
import {
  baseFormSuggestionCacheKey,
  focusAppearsInSpeech,
  focusBaseFormSuggestion,
} from './baseFormSuggestionLogic';

const SUGGESTION_DEBOUNCE_MS = 400;

type CacheEntry = {
  focusKey: string;
  baseForm: string | null;
};

const prefetchCache = new Map<string, CacheEntry>();

export type BaseFormSuggestionView = {
  suggestion: string | null;
  loading: boolean;
  visible: boolean;
  accept: () => void;
  dismiss: () => void;
  markFocusTextPicked: () => void;
};

const EMPTY_VIEW: BaseFormSuggestionView = {
  suggestion: null,
  loading: false,
  visible: false,
  accept: () => {},
  dismiss: () => {},
  markFocusTextPicked: () => {},
};

export function useBaseFormSuggestion({
  snippet,
  focusText,
  enabled,
  isLive,
  onAccept,
}: {
  snippet: CorpusSnippet | undefined;
  focusText: string;
  enabled: boolean;
  isLive: boolean;
  onAccept: (baseForm: string) => void;
}): BaseFormSuggestionView {
  const [prefetch, setPrefetch] = useState<CacheEntry | null>(null);
  const [dismissedFocusKey, setDismissedFocusKey] = useState('');
  const requestIdRef = useRef(0);
  const immediatePrefetchRef = useRef(false);
  const snippetRef = useRef(snippet);
  snippetRef.current = snippet;

  const focusKey = focusText.trim();
  const noteGeneratedAt = snippet?.note.generatedAt;
  const cacheKey = baseFormSuggestionCacheKey(
    snippet?.id,
    noteGeneratedAt,
    focusKey,
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
    setDismissedFocusKey('');
  }, [snippet?.id]);

  useEffect(() => {
    if (!enabled || !isLive || !snippetRef.current || !focusKey || !noteGeneratedAt) {
      setPrefetch(null);
      return;
    }

    const originalSpeech = snippetRef.current.note.originalSpeech;
    if (!focusAppearsInSpeech(focusKey, originalSpeech)) {
      setPrefetch(null);
      return;
    }

    if (cacheKey && prefetchCache.has(cacheKey)) {
      const cached = prefetchCache.get(cacheKey)!;
      setPrefetch(cached);
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

      void corpusRepository
        .suggestBaseForm({
          fragment: currentSnippet,
          focusText: focusKey,
        })
        .then((baseFormSuggestion) => {
          if (requestId !== requestIdRef.current) {
            return;
          }

          const nextEntry: CacheEntry = {
            focusKey,
            baseForm: baseFormSuggestion.baseForm,
          };

          if (cacheKey) {
            prefetchCache.set(cacheKey, nextEntry);
          }

          setPrefetch(nextEntry);
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
  }, [cacheKey, enabled, focusKey, isLive, noteGeneratedAt]);

  const suggestion = focusBaseFormSuggestion(
    prefetch?.focusKey === focusKey ? prefetch.baseForm : null,
    focusKey,
  );

  if (!enabled || !suggestion || dismissedFocusKey === focusKey) {
    return {
      ...EMPTY_VIEW,
      markFocusTextPicked,
    };
  }

  return {
    suggestion,
    loading: false,
    visible: true,
    markFocusTextPicked,
    accept: () => {
      onAccept(suggestion);
      setPrefetch(null);
      if (cacheKey) {
        prefetchCache.delete(cacheKey);
      }
    },
    dismiss: () => {
      setDismissedFocusKey(focusKey);
    },
  };
}
