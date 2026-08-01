import { describe, expect, it } from 'vitest';
import { videoMetaFromTranscripts } from './videoMetaFromTranscripts';

describe('videoMetaFromTranscripts', () => {
  it('builds a lookup map from stored transcript metadata', () => {
    const map = videoMetaFromTranscripts([
      {
        videoId: 'abc123',
        videoUrl: 'https://www.youtube.com/watch?v=abc123',
        languageCode: 'en',
        capturedAt: '2026-07-31T00:00:00.000Z',
        source: 'interceptedTimedtextUrl',
        segments: [],
        title: 'Real Title',
        channel: 'Real Channel',
      },
    ]);

    expect(map.abc123).toEqual({
      videoId: 'abc123',
      title: 'Real Title',
      channel: 'Real Channel',
    });
  });

  it('skips transcripts without title or channel metadata', () => {
    const map = videoMetaFromTranscripts([
      {
        videoId: 'empty',
        videoUrl: 'https://www.youtube.com/watch?v=empty',
        languageCode: 'en',
        capturedAt: '2026-07-31T00:00:00.000Z',
        source: 'unknown',
        segments: [],
      },
    ]);

    expect(map.empty).toBeUndefined();
  });
});
