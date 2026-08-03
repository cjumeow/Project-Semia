import { describe, expect, it } from 'vitest';
import { toYoutubeTlang } from './subtitleLanguages';

describe('toYoutubeTlang', () => {
  it('maps zh-TW to zh-Hant', () => {
    expect(toYoutubeTlang('zh-TW')).toBe('zh-Hant');
  });

  it('maps zh-CN to zh-Hans', () => {
    expect(toYoutubeTlang('zh-CN')).toBe('zh-Hans');
  });

  it('passes through unmapped codes', () => {
    expect(toYoutubeTlang('en')).toBe('en');
  });
});
