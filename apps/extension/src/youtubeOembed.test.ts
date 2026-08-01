import { describe, expect, it } from 'vitest';
import type { StoredTranscript } from './types';
import {
  enrichTranscriptFromOembed,
  needsOembedEnrichment,
} from './youtubeOembed';

const baseTranscript = (
  overrides: Partial<StoredTranscript> = {},
): StoredTranscript => ({
  videoId: 'abc123',
  videoUrl: 'https://www.youtube.com/watch?v=abc123',
  languageCode: 'en',
  capturedAt: '2026-07-31T00:00:00.000Z',
  source: 'interceptedTimedtextUrl',
  segments: [],
  ...overrides,
});

describe('needsOembedEnrichment', () => {
  it('requests enrichment for placeholder or missing metadata', () => {
    expect(needsOembedEnrichment(baseTranscript())).toBe(true);
    expect(
      needsOembedEnrichment(
        baseTranscript({ title: 'YouTube · abc123', channel: 'Unknown channel' }),
      ),
    ).toBe(true);
  });

  it('skips enrichment when title and channel are already present', () => {
    expect(
      needsOembedEnrichment(
        baseTranscript({ title: 'Real Title', channel: 'Real Channel' }),
      ),
    ).toBe(false);
  });
});

describe('enrichTranscriptFromOembed', () => {
  it('returns the original transcript when enrichment is not needed', async () => {
    const transcript = baseTranscript({
      title: 'Real Title',
      channel: 'Real Channel',
    });

    await expect(enrichTranscriptFromOembed(transcript)).resolves.toBe(transcript);
  });
});
