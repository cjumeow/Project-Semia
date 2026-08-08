import type {
  FocusKeywordCandidate,
  FocusKeywordMode,
} from '@semia/shared';
import { useEffect, useRef, useState } from 'react';
import { corpusRepository } from '../data/corpusRepository';
import type { CorpusSnippet } from '../types/corpus';
import { focusKeywordSuggestionCacheKey } from './focusKeywordSuggestionCacheKey';

const SUGGESTION_DEBOUNCE_MS = 400;

const suggestionCache = new Map<string, FocusKeywordCandidate[]>();

export function useFocusKeywordSuggestions({
  snippet,
  enabled,
  isLive,
  userLevelMode,
}: {
  snippet: CorpusSnippet | undefined;
  enabled: boolean;
  isLive: boolean;
  userLevelMode: FocusKeywordMode;
}): {
  candidates: FocusKeywordCandidate[];
  loading: boolean;
} {
  const [candidates, setCandidates] = useState<FocusKeywordCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);
  const snippetRef = useRef(snippet);
  snippetRef.current = snippet;

  const snippetId = snippet?.id;
  const originalSpeech = snippet?.note.originalSpeech.trim() ?? '';
  const noteGeneratedAt = snippet?.note.generatedAt;
  const cacheKey = focusKeywordSuggestionCacheKey(
    snippetId,
    userLevelMode,
    noteGeneratedAt,
  );

  useEffect(() => {
    setCandidates([]);
    setLoading(false);
  }, [snippetId]);

  useEffect(() => {
    if (!enabled || !isLive || !snippetId || !snippetRef.current) {
      setCandidates([]);
      setLoading(false);
      return;
    }

    if (!originalSpeech || !noteGeneratedAt) {
      setCandidates([]);
      setLoading(false);
      return;
    }

    if (cacheKey && suggestionCache.has(cacheKey)) {
      setCandidates(suggestionCache.get(cacheKey) ?? []);
      setLoading(false);
      return;
    }

    setLoading(true);
    const requestId = ++requestIdRef.current;
    const timer = window.setTimeout(() => {
      const currentSnippet = snippetRef.current;
      if (!currentSnippet) {
        return;
      }

      void corpusRepository
        .suggestFocusKeywords({
          fragment: currentSnippet,
          userLevelMode,
        })
        .then((result) => {
          if (requestId !== requestIdRef.current) {
            return;
          }
          if (cacheKey) {
            suggestionCache.set(cacheKey, result.candidates);
          }
          setCandidates(result.candidates);
          setLoading(false);
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) {
            return;
          }
          setCandidates([]);
          setLoading(false);
        });
    }, SUGGESTION_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    cacheKey,
    enabled,
    isLive,
    noteGeneratedAt,
    originalSpeech,
    snippetId,
    userLevelMode,
  ]);

  return { candidates, loading };
}
