import type {
  FocusKeywordCandidate,
  FocusKeywordMode,
} from '@semia/shared';
import { useEffect, useRef, useState } from 'react';
import { corpusRepository } from '../data/corpusRepository';
import type { CorpusSnippet } from '../types/corpus';

const SUGGESTION_DEBOUNCE_MS = 400;

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

  useEffect(() => {
    setCandidates([]);
    setLoading(false);
  }, [snippet?.id]);

  useEffect(() => {
    if (!enabled || !isLive || !snippet) {
      setCandidates([]);
      setLoading(false);
      return;
    }

    const originalSpeech = snippet.note.originalSpeech.trim();
    if (!originalSpeech || !snippet.note.generatedAt) {
      setCandidates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const requestId = ++requestIdRef.current;
    const timer = window.setTimeout(() => {
      void corpusRepository
        .suggestFocusKeywords({
          fragment: snippet,
          userLevelMode,
        })
        .then((result) => {
          if (requestId !== requestIdRef.current) {
            return;
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
  }, [enabled, isLive, snippet, userLevelMode]);

  return { candidates, loading };
}
