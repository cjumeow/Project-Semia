import { describe, expect, it } from 'vitest';
import type { StoredTranscript } from './types';
import { transcriptMetadataChanged } from './transcriptOembedEnrichment';

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

describe('transcriptMetadataChanged', () => {
  it('is true when title or channel changes', () => {
    const before = baseTranscript({ title: 'Old', channel: 'Old Channel' });
    expect(
      transcriptMetadataChanged(
        before,
        baseTranscript({ title: 'New', channel: 'Old Channel' }),
      ),
    ).toBe(true);
    expect(
      transcriptMetadataChanged(
        before,
        baseTranscript({ title: 'Old', channel: 'New Channel' }),
      ),
    ).toBe(true);
  });

  it('is false when metadata is unchanged', () => {
    const transcript = baseTranscript({
      title: 'Same',
      channel: 'Same Channel',
    });
    expect(transcriptMetadataChanged(transcript, transcript)).toBe(false);
  });
});
