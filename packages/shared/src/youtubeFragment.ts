import type { LanguageFragment, TranscriptSegment, YouTubeAnchor } from './types';

export function isYouTubeAnchor(
  anchor: LanguageFragment['anchor'],
): anchor is YouTubeAnchor {
  return anchor.kind === 'youtube';
}

export function youtubeVideoId(fragment: LanguageFragment): string {
  if (!isYouTubeAnchor(fragment.anchor)) {
    throw new Error(`Expected YouTube fragment, got ${fragment.anchor.kind}`);
  }
  return fragment.anchor.videoId;
}

export function youtubeStartSeconds(fragment: LanguageFragment): number {
  if (!isYouTubeAnchor(fragment.anchor)) return 0;
  return fragment.anchor.startSeconds;
}

export function youtubeEndSeconds(fragment: LanguageFragment): number {
  if (!isYouTubeAnchor(fragment.anchor)) return 0;
  return fragment.anchor.endSeconds;
}

export function youtubeContextCues(fragment: LanguageFragment): TranscriptSegment[] {
  if (!isYouTubeAnchor(fragment.anchor)) return [];
  return fragment.anchor.contextCues;
}
