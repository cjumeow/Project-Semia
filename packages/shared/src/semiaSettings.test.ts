import { describe, expect, it } from 'vitest';
import {
  isContextWindowEnabled,
  isDarkModeEnabled,
  isLanguageCardsProEnabled,
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
