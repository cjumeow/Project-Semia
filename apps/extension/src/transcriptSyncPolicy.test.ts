import { describe, expect, it } from 'vitest';
import {
  hasTimedtextAuthParams,
  isInterceptedTimedtextTemplate,
  isUsableTimedtextTemplate,
  learningLanguagesCompatible,
  pickCaptionTrackBaseUrl,
  resolveTimedtextTemplate,
  shouldDeferTranscriptFetch,
  shouldStoreTimedtextTemplate,
} from './transcriptSyncPolicy';

const SIGNED_TEMPLATE =
  'https://www.youtube.com/api/timedtext?v=abc&lang=en&fmt=json3&signature=xyz&expire=123&sparams=foo';

const MINIMAL_TEMPLATE =
  'https://www.youtube.com/api/timedtext?v=abc&lang=en&fmt=json3';

describe('hasTimedtextAuthParams', () => {
  it('accepts signature-based player URLs', () => {
    expect(hasTimedtextAuthParams(SIGNED_TEMPLATE)).toBe(true);
  });

  it('accepts pot-based URLs', () => {
    expect(
      hasTimedtextAuthParams(
        'https://www.youtube.com/api/timedtext?v=abc&pot=token',
      ),
    ).toBe(true);
  });

  it('rejects bare timedtext URLs', () => {
    expect(hasTimedtextAuthParams(MINIMAL_TEMPLATE)).toBe(false);
    expect(hasTimedtextAuthParams('xJoT3bJyHuA')).toBe(false);
  });
});

describe('isUsableTimedtextTemplate', () => {
  it('requires both timedtext path and auth params', () => {
    expect(isUsableTimedtextTemplate(SIGNED_TEMPLATE)).toBe(true);
    expect(isUsableTimedtextTemplate(MINIMAL_TEMPLATE)).toBe(false);
    expect(isUsableTimedtextTemplate(undefined)).toBe(false);
  });
});

describe('isInterceptedTimedtextTemplate', () => {
  it('accepts any timedtext path', () => {
    expect(isInterceptedTimedtextTemplate(MINIMAL_TEMPLATE)).toBe(true);
  });
});

describe('resolveTimedtextTemplate', () => {
  it('returns signed templates only', () => {
    const map = new Map([
      ['abc', SIGNED_TEMPLATE],
      ['bad', MINIMAL_TEMPLATE],
    ]);
    expect(resolveTimedtextTemplate(map, 'abc')).toBe(SIGNED_TEMPLATE);
    expect(resolveTimedtextTemplate(map, 'bad')).toBeUndefined();
  });

  it('prefers an explicit signed URL', () => {
    const map = new Map([['abc', SIGNED_TEMPLATE]]);
    expect(
      resolveTimedtextTemplate(map, 'abc', SIGNED_TEMPLATE),
    ).toBe(SIGNED_TEMPLATE);
    expect(
      resolveTimedtextTemplate(map, 'abc', MINIMAL_TEMPLATE),
    ).toBeUndefined();
  });
});

describe('shouldDeferTranscriptFetch', () => {
  it('defers until a signed timedtext template exists', () => {
    expect(shouldDeferTranscriptFetch(undefined)).toBe(true);
    expect(shouldDeferTranscriptFetch(MINIMAL_TEMPLATE)).toBe(true);
    expect(shouldDeferTranscriptFetch(SIGNED_TEMPLATE)).toBe(false);
  });
});

describe('shouldStoreTimedtextTemplate', () => {
  it('rejects one-shot pot intercept URLs', () => {
    const potUrl = `${SIGNED_TEMPLATE}&pot=TOKEN`;
    expect(shouldStoreTimedtextTemplate(potUrl)).toBe(false);
    expect(shouldStoreTimedtextTemplate(SIGNED_TEMPLATE)).toBe(true);
  });
});

describe('pickCaptionTrackBaseUrl', () => {
  const tracks = [
    {
      languageCode: 'en',
      baseUrl: SIGNED_TEMPLATE,
    },
    {
      languageCode: 'ru',
      baseUrl:
        'https://www.youtube.com/api/timedtext?v=abc&lang=ru&signature=ru&expire=1&sparams=x',
    },
    {
      languageCode: 'bad',
      baseUrl: MINIMAL_TEMPLATE,
    },
  ];

  it('prefers the learning language track', () => {
    expect(pickCaptionTrackBaseUrl(tracks, 'en')).toBe(SIGNED_TEMPLATE);
    expect(
      pickCaptionTrackBaseUrl(tracks, 'ru'),
    ).toContain('lang=ru');
  });

  it('prefers the active YouTube caption language over generic en', () => {
    const bothEnglish = [
      {
        languageCode: 'en',
        baseUrl: SIGNED_TEMPLATE,
      },
      {
        languageCode: 'en-US',
        baseUrl:
          'https://www.youtube.com/api/timedtext?v=abc&lang=en-US&signature=us&expire=1&sparams=x',
      },
    ];
    expect(pickCaptionTrackBaseUrl(bothEnglish, 'en', 'en-US')).toContain(
      'lang=en-US',
    );
    expect(pickCaptionTrackBaseUrl(bothEnglish, 'en')).toBe(SIGNED_TEMPLATE);
  });

  it('falls back to a regional track when only that variant exists', () => {
    const regional = [
      {
        languageCode: 'en-US',
        baseUrl:
          'https://www.youtube.com/api/timedtext?v=abc&lang=en-US&signature=us&expire=1&sparams=x',
      },
    ];
    expect(pickCaptionTrackBaseUrl(regional, 'en')).toContain('lang=en-US');
  });
});

describe('learningLanguagesCompatible', () => {
  it('treats en-US as compatible with settings en', () => {
    expect(learningLanguagesCompatible('en-US', 'en')).toBe(true);
    expect(learningLanguagesCompatible('en', 'en-US')).toBe(false);
  });
});
