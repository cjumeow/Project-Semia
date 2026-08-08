import { useCallback, useEffect, useState, type RefObject } from 'react';

const STOP_WORDS = new Set([
  'about',
  'after',
  'again',
  'against',
  'because',
  'before',
  'being',
  'between',
  'could',
  'every',
  'from',
  'have',
  'help',
  'into',
  'just',
  'like',
  'make',
  'more',
  'only',
  'other',
  'over',
  'people',
  'really',
  'sentence',
  'should',
  'some',
  'such',
  'than',
  'that',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'through',
  'under',
  'usually',
  'very',
  'when',
  'where',
  'which',
  'while',
  'with',
  'word',
  'would',
  'write',
  'writing',
  'your',
]);

/** PROTOTYPE — heuristic keyword chips; production would call AI. */
export function extractKeywordChips(originalSpeech: string): string[] {
  const quoted = [
    ...originalSpeech.matchAll(/"([^"]{2,40})"/g),
  ].map((match) => match[1]!.trim());

  const longWords =
    originalSpeech.match(/\b[A-Za-z][A-Za-z'-]{4,}\b/g) ?? [];

  const candidates = [...quoted, ...longWords];
  const seen = new Set<string>();
  const chips: string[] = [];

  for (const candidate of candidates) {
    const key = candidate.toLowerCase();
    if (seen.has(key) || STOP_WORDS.has(key)) {
      continue;
    }
    seen.add(key);
    chips.push(candidate);
    if (chips.length >= 5) {
      break;
    }
  }

  return chips;
}

export type FocusSelectionAnchor = {
  text: string;
  top: number;
  left: number;
};

function selectionAnchorFromRange(): FocusSelectionAnchor | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null;
  }

  const text = selection.toString().trim();
  if (!text) {
    return null;
  }

  const rect = selection.getRangeAt(0).getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return null;
  }

  return {
    text,
    top: rect.top + window.scrollY,
    left: rect.left + rect.width / 2 + window.scrollX,
  };
}

export function useFocusTextSelection(
  containerRef: RefObject<HTMLElement | null>,
) {
  const [anchor, setAnchor] = useState<FocusSelectionAnchor | null>(null);

  const clearAnchor = useCallback(() => {
    setAnchor(null);
  }, []);

  const handleDoubleClick = useCallback(() => {
    const next = selectionAnchorFromRange();
    if (next) {
      setAnchor(next);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    const next = selectionAnchorFromRange();
    if (next) {
      setAnchor(next);
    }
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) {
        return;
      }
      setAnchor(null);
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [containerRef]);

  return {
    anchor,
    clearAnchor,
    handleDoubleClick,
    handleMouseUp,
  };
}

export type FocusPickState = {
  focusText: string;
  lastAction: string;
};
