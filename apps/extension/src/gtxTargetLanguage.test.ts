import { describe, expect, it } from 'vitest';
import { toGtxTargetLanguage } from './gtxTargetLanguage';

describe('toGtxTargetLanguage', () => {
  it('maps zh variants to GTX tl codes', () => {
    expect(toGtxTargetLanguage('zh-TW')).toBe('zh-TW');
    expect(toGtxTargetLanguage('zh-CN')).toBe('zh-CN');
    expect(toGtxTargetLanguage('zh-Hant')).toBe('zh-TW');
    expect(toGtxTargetLanguage('zh-Hans')).toBe('zh-CN');
  });
});
