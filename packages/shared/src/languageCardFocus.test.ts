import { describe, expect, it } from 'vitest';
import {
  buildFocusValidationCorpus,
  isFocusTextInCorpus,
  isWholeCaptureFocus,
  validateFocusText,
} from './languageCardFocus';

describe('buildFocusValidationCorpus', () => {
  it('prefers context window when present', () => {
    expect(
      buildFocusValidationCorpus({
        dynamicContextBlock: 'alpha beta gamma',
        selectedText: 'ignored',
        originalSpeech: '',
        naturalTranslation: '',
      }),
    ).toBe('alpha beta gamma');
  });

  it('falls back to capture text when context window is empty', () => {
    expect(
      buildFocusValidationCorpus({
        dynamicContextBlock: '',
        selectedText: 'hello',
        originalSpeech: 'Hello world',
        naturalTranslation: '你好',
      }),
    ).toBe('hello\nHello world\n你好');
  });
});

describe('isFocusTextInCorpus', () => {
  it('matches case-insensitively', () => {
    expect(isFocusTextInCorpus('Beta', 'alpha BETA gamma')).toBe(true);
  });

  it('matches across extra whitespace and newlines', () => {
    expect(
      isFocusTextInCorpus('studying these thousands', 'studying  these\nthousands of values'),
    ).toBe(true);
  });

  it('rejects a partial prefix of a longer word', () => {
    expect(isFocusTextInCorpus('tractab', 'made it totally tractable by')).toBe(
      false,
    );
    expect(isFocusTextInCorpus('tractable', 'made it totally tractable by')).toBe(
      true,
    );
  });
});

describe('validateFocusText', () => {
  it('throws when focus is not in corpus', () => {
    expect(() =>
      validateFocusText('zzzz', {
        dynamicContextBlock: 'alpha beta',
        selectedText: 'alpha',
        originalSpeech: '',
        naturalTranslation: '',
      }),
    ).toThrow(/context window/i);
  });
});

describe('isWholeCaptureFocus', () => {
  it('returns true when focus equals selected text', () => {
    expect(
      isWholeCaptureFocus('Hello world', {
        selectedText: 'hello world',
        originalSpeech: 'Hello world',
      }),
    ).toBe(true);
  });

  it('returns false for a word inside the capture', () => {
    expect(
      isWholeCaptureFocus('world', {
        selectedText: 'Hello world',
        originalSpeech: 'Hello world',
      }),
    ).toBe(false);
  });
});
