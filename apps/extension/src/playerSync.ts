import type { TranscriptSegment } from './types';

/**
 * Prefer the main YouTube HTML5 video element.
 */
export function getVideoElement(): HTMLVideoElement | null {
  const player = document.querySelector(
    '#movie_player video.html5-main-video, .html5-video-player video.html5-main-video, video.html5-main-video',
  );
  if (player instanceof HTMLVideoElement) return player;

  const any = document.querySelector('video');
  return any instanceof HTMLVideoElement ? any : null;
}

export function pauseVideo(): void {
  getVideoElement()?.pause();
}

export function playVideo(): void {
  const video = getVideoElement();
  if (!video) return;
  void video.play();
}

export function getCurrentTime(): number {
  return getVideoElement()?.currentTime ?? 0;
}

/**
 * Find the active cue index for a playback time.
 * Returns the last cue whose start <= t, or 0 if before the first cue.
 */
export function findCueIndexByTime(
  segments: TranscriptSegment[],
  timeSeconds: number,
): number {
  if (segments.length === 0) return -1;

  let result = 0;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    if (seg.start <= timeSeconds) {
      result = i;
    } else {
      break;
    }
  }
  return result;
}

export function seekTo(timeSeconds: number): void {
  const video = getVideoElement();
  if (!video) return;
  video.currentTime = timeSeconds;
}

/** Seek to the previous or next cue relative to current playback time. */
export function navigateCue(
  segments: TranscriptSegment[],
  delta: number,
): void {
  if (segments.length === 0) return;

  const current = findCueIndexByTime(segments, getCurrentTime());
  if (current < 0) return;

  const next = Math.max(0, Math.min(segments.length - 1, current + delta));
  seekTo(segments[next]!.start);
}

/**
 * Read videoId from the current YouTube URL.
 */
export function getVideoIdFromUrl(href = location.href): string | null {
  try {
    const url = new URL(href);
    if (url.pathname.startsWith('/watch')) {
      return url.searchParams.get('v');
    }
    // Shorts: /shorts/VIDEO_ID
    const shorts = url.pathname.match(/^\/shorts\/([^/?]+)/);
    if (shorts?.[1]) return shorts[1];
  } catch {
    // ignore
  }
  return null;
}
