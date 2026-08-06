import type {
  LanguageCardDraftContent,
  LanguageCardFieldSuggestions,
  LanguageCardSuggestableField,
} from '@semia/shared';
import { useEffect, useRef, useState } from 'react';
import { corpusRepository } from '../data/corpusRepository';
import type { CorpusSnippet } from '../types/corpus';

const SUGGESTION_DEBOUNCE_MS = 400;

type SuggestionState = {
  focusKey: string;
  text: string;
  loading: boolean;
  dismissed: boolean;
};

export type LanguageCardFieldSuggestionsView = {
  meaning: SuggestionState | null;
  example: SuggestionState | null;
  acceptMeaning: () => void;
  dismissMeaning: () => void;
  acceptExample: () => void;
  dismissExample: () => void;
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
  onAccept: (field: LanguageCardSuggestableField, value: string) => void;
}): LanguageCardFieldSuggestionsView {
  const [meaning, setMeaning] = useState<SuggestionState | null>(null);
  const [example, setExample] = useState<SuggestionState | null>(null);
  const requestIdRef = useRef(0);

  const focusKey = content.focusText.trim();
  const meaningEmpty = content.meaning.trim().length === 0;
  const exampleEmpty =
    (content.optionalSlots.example ?? '').trim().length === 0;

  useEffect(() => {
    setMeaning(null);
    setExample(null);
  }, [snippet?.id]);

  useEffect(() => {
    if (!enabled || !isLive || !snippet || !focusKey) {
      setMeaning(null);
      setExample(null);
      return;
    }

    const fields: LanguageCardSuggestableField[] = [];
    if (meaningEmpty) {
      fields.push('meaning');
    }
    if (exampleEmpty) {
      fields.push('example');
    }

    if (fields.length === 0) {
      setMeaning(null);
      setExample(null);
      return;
    }

    if (meaningEmpty) {
      setMeaning({ focusKey, text: '', loading: true, dismissed: false });
    } else {
      setMeaning(null);
    }

    if (exampleEmpty) {
      setExample({ focusKey, text: '', loading: true, dismissed: false });
    } else {
      setExample(null);
    }

    const requestId = ++requestIdRef.current;
    const timer = window.setTimeout(() => {
      void corpusRepository
        .suggestLanguageCardFields({
          fragment: snippet,
          focusText: focusKey,
          fields,
        })
        .then((suggestions: LanguageCardFieldSuggestions) => {
          if (requestId !== requestIdRef.current) {
            return;
          }

          if (meaningEmpty) {
            const text = suggestions.meaning?.trim() ?? '';
            setMeaning({
              focusKey,
              text,
              loading: false,
              dismissed: false,
            });
          }

          if (exampleEmpty) {
            const text = suggestions.example?.trim() ?? '';
            setExample({
              focusKey,
              text,
              loading: false,
              dismissed: false,
            });
          }
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) {
            return;
          }
          setMeaning(null);
          setExample(null);
        });
    }, SUGGESTION_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    enabled,
    exampleEmpty,
    focusKey,
    isLive,
    meaningEmpty,
    snippet,
  ]);

  return {
    meaning:
      meaning && !meaning.dismissed && (meaning.loading || meaning.text)
        ? meaning
        : null,
    example:
      example && !example.dismissed && (example.loading || example.text)
        ? example
        : null,
    acceptMeaning: () => {
      if (!meaning?.text) return;
      onAccept('meaning', meaning.text);
      setMeaning(null);
    },
    dismissMeaning: () => {
      setMeaning((current) =>
        current ? { ...current, dismissed: true } : null,
      );
    },
    acceptExample: () => {
      if (!example?.text) return;
      onAccept('example', example.text);
      setExample(null);
    },
    dismissExample: () => {
      setExample((current) =>
        current ? { ...current, dismissed: true } : null,
      );
    },
  };
}
