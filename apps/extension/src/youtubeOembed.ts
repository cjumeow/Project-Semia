import {
  isPlaceholderYoutubeTitle,
  resolveYoutubeChannel,
} from '@semia/shared';
import type { StoredTranscript } from './types';

type YoutubeOembed = {
  title?: string;
  author_name?: string;
};

const oembedCache = new Map<string, StoredTranscript>();

export function needsOembedEnrichment(transcript: StoredTranscript): boolean {
  const title = transcript.title?.trim();
  const channel = transcript.channel?.trim();

  if (!title || isPlaceholderYoutubeTitle(title, transcript.videoId)) {
    return true;
  }

  if (!channel || channel === resolveYoutubeChannel()) {
    return true;
  }

  return false;
}

export async function fetchYoutubeOembed(
  videoUrl: string,
): Promise<YoutubeOembed | null> {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) return null;
    return (await response.json()) as YoutubeOembed;
  } catch {
    return null;
  }
}

export async function enrichTranscriptFromOembed(
  transcript: StoredTranscript,
): Promise<StoredTranscript> {
  if (!needsOembedEnrichment(transcript)) {
    return transcript;
  }

  const cached = oembedCache.get(transcript.videoId);
  if (cached) return cached;

  const oembed = await fetchYoutubeOembed(transcript.videoUrl);
  if (!oembed) return transcript;

  const title = oembed.title?.trim();
  const channel = oembed.author_name?.trim();
  if (!title && !channel) return transcript;

  const enriched = {
    ...transcript,
    title: title ?? transcript.title,
    channel: channel ?? transcript.channel,
  };
  oembedCache.set(transcript.videoId, enriched);
  return enriched;
}
