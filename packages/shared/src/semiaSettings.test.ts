import { describe, expect, it } from 'vitest';
import {
  getFocusKeywordMode,
  getLanguageCardDefaultOptionalFields,
  getLearningLanguage,
  getNativeLanguage,
  isContextWindowEnabled,
  isDarkModeEnabled,
  isLanguageCardsProEnabled,
  isSnippetChatDragModeEnabled,
} from './semiaSettings';

describe('isContextWindowEnabled', () => {
  it('defaults to enabled when setting is missing', () => {
    expect(isContextWindowEnabled()).toBe(true);
    expect(isContextWindowEnabled({})).toBe(true);
  });

  it('respects explicit false', () => {
    expect(isContextWindowEnabled({ contextWindowEnabled: false })).toBe(false);
  });

  it('respects explicit true', () => {
    expect(isContextWindowEnabled({ contextWindowEnabled: true })).toBe(true);
  });
});

describe('isLanguageCardsProEnabled', () => {
  it('defaults to disabled when setting is missing', () => {
    expect(isLanguageCardsProEnabled()).toBe(false);
    expect(isLanguageCardsProEnabled({})).toBe(false);
  });

  it('is enabled only when explicitly true', () => {
    expect(isLanguageCardsProEnabled({ languageCardsProEnabled: true })).toBe(
      true,
    );
    expect(isLanguageCardsProEnabled({ languageCardsProEnabled: false })).toBe(
      false,
    );
  });
});

describe('isDarkModeEnabled', () => {
  it('defaults to disabled when setting is missing', () => {
    expect(isDarkModeEnabled()).toBe(false);
    expect(isDarkModeEnabled({})).toBe(false);
  });

  it('is enabled only when explicitly true', () => {
    expect(isDarkModeEnabled({ darkModeEnabled: true })).toBe(true);
    expect(isDarkModeEnabled({ darkModeEnabled: false })).toBe(false);
  });
});

describe('isSnippetChatDragModeEnabled', () => {
  it('defaults to disabled when setting is missing', () => {
    expect(isSnippetChatDragModeEnabled()).toBe(false);
    expect(isSnippetChatDragModeEnabled({})).toBe(false);
  });

  it('is enabled only when explicitly true', () => {
    expect(
      isSnippetChatDragModeEnabled({ snippetChatDragModeEnabled: true }),
    ).toBe(true);
    expect(
      isSnippetChatDragModeEnabled({ snippetChatDragModeEnabled: false }),
    ).toBe(false);
  });
});

describe('getFocusKeywordMode', () => {
  it('defaults to daily', () => {
    expect(getFocusKeywordMode()).toBe('daily');
    expect(getFocusKeywordMode({})).toBe('daily');
  });

  it('respects advanced', () => {
    expect(getFocusKeywordMode({ focusKeywordMode: 'advanced' })).toBe(
      'advanced',
    );
  });
});

describe('getLanguageCardDefaultOptionalFields', () => {
  it('defaults to empty when missing or invalid', () => {
    expect(getLanguageCardDefaultOptionalFields()).toEqual([]);
    expect(getLanguageCardDefaultOptionalFields({})).toEqual([]);
    expect(
      getLanguageCardDefaultOptionalFields({
        languageCardDefaultOptionalFields: ['not-a-field' as never],
      }),
    ).toEqual([]);
  });

  it('dedupes and sorts known optional fields', () => {
    expect(
      getLanguageCardDefaultOptionalFields({
        languageCardDefaultOptionalFields: ['dialogue', 'example', 'example'],
      }),
    ).toEqual(['example', 'dialogue']);
  });
});

describe('getLearningLanguage', () => {
  it('defaults to en', () => {
    expect(getLearningLanguage()).toBe('en');
    expect(getLearningLanguage({})).toBe('en');
  });

  it('respects supported codes', () => {
    expect(getLearningLanguage({ learningLanguage: 'ja' })).toBe('ja');
  });
});

describe('getNativeLanguage', () => {
  it('defaults to zh-TW', () => {
    expect(getNativeLanguage()).toBe('zh-TW');
    expect(getNativeLanguage({})).toBe('zh-TW');
  });

  it('respects supported codes', () => {
    expect(getNativeLanguage({ nativeLanguage: 'en' })).toBe('en');
  });
});
