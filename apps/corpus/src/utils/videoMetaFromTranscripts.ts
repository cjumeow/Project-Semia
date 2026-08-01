import type { StoredTranscript } from '@semia/shared';
import type { VideoMeta } from '../types/corpus';
import {
  placeholderYoutubeTitle,
  resolveYoutubeChannel,
} from '@semia/shared';

/** Build sidebar video metadata from stored YouTube transcripts. */
export function videoMetaFromTranscripts(
  transcripts: StoredTranscript[],
): Record<string, VideoMeta> {
  const map: Record<string, VideoMeta> = {};

  for (const transcript of transcripts) {
    if (!transcript.title && !transcript.channel) continue;

    map[transcript.videoId] = {
      videoId: transcript.videoId,
      title: transcript.title?.trim() || placeholderYoutubeTitle(transcript.videoId),
      channel: resolveYoutubeChannel(transcript.channel),
    };
  }

  return map;
}
