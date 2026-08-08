import type { FocusKeywordCandidate } from './focusPickMockKeywords';

export type FocusKeywordMode = 'daily' | 'advanced';

export type FocusPickLockedState = {
  focusText: string;
  panelOpen: boolean;
  keywordMode: FocusKeywordMode;
  candidates: FocusKeywordCandidate[];
  loading: boolean;
  lastAction: string;
};

export function speechPreview(text: string, maxLen = 36): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLen)}…`;
}
