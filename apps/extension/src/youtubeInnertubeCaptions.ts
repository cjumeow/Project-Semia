import type { CaptionTrackRef } from './transcriptSyncPolicy';

const INNERTUBE_PLAYER_URL =
  'https://www.youtube.com/youtubei/v1/player?prettyPrint=false';
const INNERTUBE_ANDROID_VERSION = '20.10.38';

type InnertubePlayerResponse = {
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: Array<{
        languageCode?: string;
        baseUrl?: string;
      }>;
    };
  };
};

export async function fetchInnertubeCaptionTracks(
  videoId: string,
): Promise<CaptionTrackRef[]> {
  const res = await fetch(INNERTUBE_PLAYER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      context: {
        client: {
          clientName: 'ANDROID',
          clientVersion: INNERTUBE_ANDROID_VERSION,
        },
      },
      videoId,
    }),
  });

  if (!res.ok) {
    throw new Error(`Innertube player request failed: ${res.status}`);
  }

  const data = (await res.json()) as InnertubePlayerResponse;
  const tracks =
    data.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];

  return tracks
    .map((track) => ({
      languageCode: track.languageCode ?? '',
      baseUrl: track.baseUrl ?? '',
    }))
    .filter((track) => track.languageCode && track.baseUrl);
}
