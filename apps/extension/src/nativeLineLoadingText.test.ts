import { describe, expect, it } from 'vitest';
import { getNativeLineLoadingText } from './nativeLineLoadingText';

describe('getNativeLineLoadingText', () => {
  it('returns Japanese loading copy for ja native language', () => {
    expect(getNativeLineLoadingText('ja')).toBe('翻訳を読み込み中…');
  });

  it('falls back to zh-TW copy for unknown native language', () => {
    expect(getNativeLineLoadingText('fr')).toBe('翻譯載入中');
  });
});
