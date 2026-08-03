import { describe, expect, it } from 'vitest';
import {
  buildLearningTimedtextUrl,
  buildTranslatedTimedtextUrl,
  toJson3Url,
} from './youtubeTranscript';

describe('toJson3Url', () => {
  it('sets fmt=json3 on timedtext URLs', () => {
    const url = toJson3Url(
      'https://www.youtube.com/api/timedtext?v=abc&lang=en',
    );
    expect(url).toContain('fmt=json3');
  });
});

describe('buildLearningTimedtextUrl', () => {
  it('overrides lang and strips tlang from intercepted template', () => {
    const url = buildLearningTimedtextUrl(
      'https://www.youtube.com/api/timedtext?v=abc&lang=ja&tlang=zh-Hant&caps=asr',
      'en',
    );
    const parsed = new URL(url);
    expect(parsed.searchParams.get('v')).toBe('abc');
    expect(parsed.searchParams.get('lang')).toBe('en');
    expect(parsed.searchParams.get('tlang')).toBeNull();
    expect(parsed.searchParams.get('fmt')).toBe('json3');
    expect(parsed.searchParams.get('caps')).toBe('asr');
  });

  it('builds from videoId when no template URL', () => {
    const url = buildLearningTimedtextUrl('xyz123', 'ko');
    const parsed = new URL(url);
    expect(parsed.pathname).toContain('timedtext');
    expect(parsed.searchParams.get('v')).toBe('xyz123');
    expect(parsed.searchParams.get('lang')).toBe('ko');
  });
});

describe('buildTranslatedTimedtextUrl', () => {
  it('adds tlang for zh-TW native language', () => {
    const url = buildTranslatedTimedtextUrl('abc', 'en', 'zh-TW');
    const parsed = new URL(url);
    expect(parsed.searchParams.get('lang')).toBe('en');
    expect(parsed.searchParams.get('tlang')).toBe('zh-Hant');
  });

  it('maps zh-CN to zh-Hans tlang', () => {
    const url = buildTranslatedTimedtextUrl('abc', 'en', 'zh-CN');
    expect(new URL(url).searchParams.get('tlang')).toBe('zh-Hans');
  });
});
