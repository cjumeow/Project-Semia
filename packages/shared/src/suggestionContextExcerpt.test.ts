import { describe, expect, it } from 'vitest';
import {
  buildSuggestionContextExcerpt,
  SUGGESTION_EXCERPT_MAX_CHARS,
} from './suggestionContextExcerpt';

describe('buildSuggestionContextExcerpt', () => {
  it('returns the full speech when it is shorter than the cap', () => {
    const speech = 'She ran quickly.';
    expect(
      buildSuggestionContextExcerpt({
        originalSpeech: speech,
        focusText: 'ran',
      }),
    ).toBe(speech);
  });

  it('expands to the sentence containing the focus text', () => {
    const speech =
      'Intro one. Intro two. She ran quickly to the store. Tail one. Tail two.';
    const excerpt = buildSuggestionContextExcerpt({
      originalSpeech: speech,
      focusText: 'ran',
    });
    expect(excerpt).toContain('She ran quickly to the store');
    expect(excerpt).toContain('Intro two');
    expect(excerpt).toContain('Tail one');
    expect(excerpt).not.toContain('Intro one');
    expect(excerpt).not.toContain('Tail two');
  });

  it('includes one adjacent sentence on each side when available', () => {
    const speech =
      'Alpha starts. She ran quickly. Beta ends here. Gamma is far away.';
    const excerpt = buildSuggestionContextExcerpt({
      originalSpeech: speech,
      focusText: 'ran',
    });
    expect(excerpt).toContain('Alpha starts');
    expect(excerpt).toContain('She ran quickly');
    expect(excerpt).toContain('Beta ends here');
    expect(excerpt).not.toContain('Gamma');
  });

  it('falls back to capture text when focus is not in original speech', () => {
    expect(
      buildSuggestionContextExcerpt({
        originalSpeech: 'Totally unrelated speech.',
        focusText: 'ran',
        captureText: 'He ran home before dark.',
      }),
    ).toBe('He ran home before dark.');
  });

  it('falls back to the head of original speech when focus and capture miss', () => {
    const speech = 'x'.repeat(SUGGESTION_EXCERPT_MAX_CHARS + 50);
    const excerpt = buildSuggestionContextExcerpt({
      originalSpeech: speech,
      focusText: 'missing',
    });
    expect(excerpt.length).toBe(SUGGESTION_EXCERPT_MAX_CHARS);
    expect(excerpt).toBe(speech.slice(0, SUGGESTION_EXCERPT_MAX_CHARS));
  });

  it('hard-caps long multi-sentence excerpts around the focus match', () => {
    const middle = 'She ran quickly to the store';
    const speech = `${'A'.repeat(200)}. ${middle}. ${'B'.repeat(200)}.`;
    const excerpt = buildSuggestionContextExcerpt({
      originalSpeech: speech,
      focusText: 'ran',
      maxChars: 80,
    });
    expect(excerpt.length).toBeLessThanOrEqual(80);
    expect(excerpt).toContain('ran');
  });

  it('supports CJK sentence punctuation', () => {
    const speech = '前文です。彼は走った。後文です。';
    const excerpt = buildSuggestionContextExcerpt({
      originalSpeech: speech,
      focusText: '走った',
    });
    expect(excerpt).toContain('彼は走った');
    expect(excerpt).toContain('前文です');
    expect(excerpt).toContain('後文です');
  });
});
