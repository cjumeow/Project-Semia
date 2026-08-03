import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fetchInnertubeCaptionTracks } from './youtubeInnertubeCaptions';

describe('fetchInnertubeCaptionTracks', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns caption track refs from innertube player response', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        captions: {
          playerCaptionsTracklistRenderer: {
            captionTracks: [
              {
                languageCode: 'en',
                baseUrl:
                  'https://www.youtube.com/api/timedtext?v=abc&lang=en&fmt=srv3&signature=sig&expire=1&sparams=x',
              },
            ],
          },
        },
      }),
    } as Response);

    const tracks = await fetchInnertubeCaptionTracks('abc');

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(tracks).toEqual([
      {
        languageCode: 'en',
        baseUrl:
          'https://www.youtube.com/api/timedtext?v=abc&lang=en&fmt=srv3&signature=sig&expire=1&sparams=x',
      },
    ]);
  });
});
