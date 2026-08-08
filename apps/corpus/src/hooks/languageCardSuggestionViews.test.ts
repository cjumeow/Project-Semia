import { describe, expect, it } from 'vitest';
import {
  buildSuggestionFieldView,
  gateSuggestionView,
} from './languageCardSuggestionViews';

describe('languageCardSuggestionViews', () => {
  it('does not mark loading as visible', () => {
    expect(
      buildSuggestionFieldView({
        suggestion: null,
        dismissed: false,
        onAccept: () => {},
        onDismiss: () => {},
      }).visible,
    ).toBe(false);
  });

  it('shows suggestions only for the focused field', () => {
    const meaningView = buildSuggestionFieldView({
      suggestion: '聯盟',
      dismissed: false,
      onAccept: () => {},
      onDismiss: () => {},
    });

    expect(
      gateSuggestionView(true, 'focus', 'meaning', meaningView).visible,
    ).toBe(false);
    expect(
      gateSuggestionView(true, 'meaning', 'meaning', meaningView).visible,
    ).toBe(true);
  });
});
