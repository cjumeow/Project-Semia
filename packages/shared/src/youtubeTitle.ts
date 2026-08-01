export const YOUTUBE_TITLE_SUFFIX = ' - YouTube';

/** Legacy placeholder stored before real titles were captured. */
export function placeholderYoutubeTitle(videoId: string): string {
  return `YouTube · ${videoId}`;
}

export function isPlaceholderYoutubeTitle(
  sourceTitle: string,
  videoId: string,
): boolean {
  return sourceTitle.trim() === placeholderYoutubeTitle(videoId);
}

/** Strip the trailing " - YouTube" suffix from `document.title`. */
export function parseYoutubeDocumentTitle(documentTitle: string): string {
  const trimmed = documentTitle.trim();
  if (!trimmed) return trimmed;

  if (trimmed.endsWith(YOUTUBE_TITLE_SUFFIX)) {
    return trimmed.slice(0, -YOUTUBE_TITLE_SUFFIX.length).trim();
  }

  return trimmed;
}

export function resolveYoutubeTitle(options: {
  videoId: string;
  sourceTitle: string;
  metaTitle?: string;
}): string {
  const storedTitle = isPlaceholderYoutubeTitle(
    options.sourceTitle,
    options.videoId,
  )
    ? undefined
    : options.sourceTitle;

  const richer = pickRicherYoutubeTitle(options.metaTitle, storedTitle);
  if (richer) return richer;
  return placeholderYoutubeTitle(options.videoId);
}

export function resolveYoutubeChannel(channel?: string): string {
  return channel?.trim() || 'Unknown channel';
}

/** Prefer the most descriptive non-empty title candidate. */
export function pickRicherYoutubeTitle(
  ...candidates: Array<string | undefined>
): string | undefined {
  const valid = [
    ...new Set(
      candidates
        .map((candidate) => candidate?.trim())
        .filter((candidate): candidate is string => Boolean(candidate)),
    ),
  ];

  if (valid.length === 0) return undefined;
  return valid.sort((a, b) => b.length - a.length)[0];
}

/** Return the first non-empty channel candidate. */
export function pickYoutubeChannel(
  ...candidates: Array<string | undefined>
): string | undefined {
  return candidates
    .map((candidate) => candidate?.trim())
    .find((candidate): candidate is string => Boolean(candidate));
}

export function shouldRefreshYoutubeMeta(
  current: { title?: string; channel?: string },
  next: { title?: string; channel?: string },
): boolean {
  const currentTitle = current.title?.trim() ?? '';
  const nextTitle = next.title?.trim() ?? '';
  if (nextTitle && nextTitle !== currentTitle) {
    if (!currentTitle || nextTitle.length > currentTitle.length) {
      return true;
    }
  }

  const currentChannel = current.channel?.trim() ?? '';
  const nextChannel = next.channel?.trim() ?? '';
  if (nextChannel && nextChannel !== currentChannel) {
    if (!currentChannel || currentChannel === 'Unknown channel') {
      return true;
    }
  }

  return false;
}
