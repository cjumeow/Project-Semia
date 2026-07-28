export function buildYouTubeEmbedUrl(
  videoId: string,
  startSeconds?: number,
): string {
  const url = new URL(`https://www.youtube.com/embed/${videoId}`);
  url.searchParams.set('rel', '0');
  if (startSeconds !== undefined && startSeconds > 0) {
    url.searchParams.set('start', String(Math.floor(startSeconds)));
  }
  return url.toString();
}

export function buildYouTubeWatchUrl(
  videoId: string,
  startSeconds?: number,
): string {
  const url = new URL('https://www.youtube.com/watch');
  url.searchParams.set('v', videoId);
  if (startSeconds !== undefined && startSeconds > 0) {
    url.searchParams.set('t', `${Math.floor(startSeconds)}s`);
  }
  return url.toString();
}

export function buildYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function buildYouTubeTimestampUrl(
  videoUrl: string,
  startSeconds: number,
): string {
  const url = new URL(videoUrl);
  url.searchParams.set('t', `${Math.max(0, Math.floor(startSeconds))}s`);
  return url.toString();
}

export function formatTimestamp(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainingSeconds = total % 60;

  const minuteSecond = `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;

  return hours > 0
    ? `${hours}:${minuteSecond}`
    : minuteSecond;
}
