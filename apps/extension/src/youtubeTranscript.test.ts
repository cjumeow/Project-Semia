import { describe, expect, it } from 'vitest';
import {
  buildLearningTimedtextUrl,
  buildTranslatedTimedtextUrl,
  parseTimedtextXml,
  toJson3Url,
} from './youtubeTranscript';

const SIGNED_JSON3 =
  'https://www.youtube.com/api/timedtext?v=abc&lang=en&fmt=json3&pot=TOKEN&signature=SIG&expire=1&sparams=x';

const SIGNED_SRV3 =
  'https://www.youtube.com/api/timedtext?v=abc&lang=en&fmt=srv3&signature=SIG&expire=1&sparams=x';

const SIGNED_EN_US =
  'https://www.youtube.com/api/timedtext?v=abc&lang=en-US&fmt=srv3&signature=US&expire=1&sparams=x';

describe('toJson3Url', () => {
  it('sets fmt=json3 on timedtext URLs', () => {
    const url = toJson3Url(
      'https://www.youtube.com/api/timedtext?v=abc&lang=en',
    );
    expect(url).toContain('fmt=json3');
  });
});

describe('buildLearningTimedtextUrl', () => {
  it('preserves signed player URLs byte-for-byte when lang already matches', () => {
    expect(buildLearningTimedtextUrl(SIGNED_JSON3, 'en')).toBe(SIGNED_JSON3);
    expect(buildLearningTimedtextUrl(SIGNED_SRV3, 'en')).toBe(SIGNED_SRV3);
    expect(buildLearningTimedtextUrl(SIGNED_EN_US, 'en')).toBe(SIGNED_EN_US);
  });

  it('overrides lang and strips tlang from unsigned intercepted template', () => {
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
  it('appends tlang without re-serializing signed URLs', () => {
    const url = buildTranslatedTimedtextUrl(SIGNED_SRV3, 'en', 'zh-TW');
    expect(url).toBe(`${SIGNED_SRV3}&tlang=zh-Hant`);
  });

  it('adds tlang for zh-TW native language on unsigned templates', () => {
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

describe('parseTimedtextXml', () => {
  it('parses srv3 paragraph cues', () => {
    const xml = `<?xml version="1.0" encoding="utf-8" ?><timedtext><body><p t="1000" d="2000"><s>Hello</s></p></body></timedtext>`;
    expect(parseTimedtextXml(xml)).toEqual([
      { text: 'Hello', start: 1, duration: 2 },
    ]);
  });

  it('decodes HTML entities in cue text', () => {
    const xml = `<?xml version="1.0" encoding="utf-8" ?><timedtext><body><p t="1000" d="2000"><s>That&#39;s cool</s></p></body></timedtext>`;
    expect(parseTimedtextXml(xml)[0]?.text).toBe("That's cool");
  });
});
