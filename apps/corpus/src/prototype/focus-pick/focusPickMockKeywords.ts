import type { FocusKeywordMode } from './focusPickLockedState';

export type FocusKeywordCandidate = {
  text: string;
  kind: 'word' | 'phrase' | 'collocation';
};

/** PROTOTYPE — simulates AI suggestFocusKeywords API (original speech only). */
export function mockFocusKeywordCandidates(
  mode: FocusKeywordMode,
  simulateEmpty: boolean,
): FocusKeywordCandidate[] {
  if (simulateEmpty) {
    return [];
  }

  if (mode === 'advanced') {
    return [
      { text: 'surrounding situation', kind: 'phrase' },
      { text: 'overuse', kind: 'word' },
    ];
  }

  return [
    { text: 'careful with', kind: 'collocation' },
    { text: 'formal emails', kind: 'phrase' },
    { text: 'context', kind: 'word' },
  ];
}
