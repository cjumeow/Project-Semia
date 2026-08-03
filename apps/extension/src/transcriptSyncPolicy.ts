/**
 * When YouTube's player requests timedtext, the URL includes auth params
 * (signature, pot, etc.). A bare `?v=&lang=&fmt=json3` URL often returns empty
 * JSON — see issue #51.
 */
export type CaptionTrackRef = {
  languageCode: string;
  baseUrl: string;
};

export function extractTimedtextLanguage(
  timedtextUrl: string | undefined,
): string | undefined {
  if (!timedtextUrl) return undefined;
  try {
    return new URL(timedtextUrl, 'https://www.youtube.com').searchParams.get(
      'lang',
    ) ?? undefined;
  } catch {
    return undefined;
  }
}

/** Settings "en" can use an en-US track, but not the reverse. */
export function learningLanguagesCompatible(
  trackLanguage: string,
  settingsLanguage: string,
): boolean {
  if (trackLanguage === settingsLanguage) return true;
  const trackBase = trackLanguage.split('-')[0];
  const settingsBase = settingsLanguage.split('-')[0];
  if (trackBase !== settingsBase) return false;
  if (!settingsLanguage.includes('-')) {
    return trackLanguage.startsWith(`${settingsLanguage}-`);
  }
  return false;
}

export function isInterceptedTimedtextTemplate(
  value: string | undefined,
): value is string {
  return Boolean(value?.includes('/api/timedtext'));
}

export function hasTimedtextAuthParams(url: string): boolean {
  try {
    const parsed = new URL(url, 'https://www.youtube.com');
    if (parsed.searchParams.has('pot')) return true;
    if (
      parsed.searchParams.has('signature') ||
      parsed.searchParams.has('sig')
    ) {
      return true;
    }
    if (
      parsed.searchParams.has('expire') &&
      parsed.searchParams.has('sparams')
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function isUsableTimedtextTemplate(
  value: string | undefined,
): value is string {
  return (
    isInterceptedTimedtextTemplate(value) && hasTimedtextAuthParams(value)
  );
}

export function resolveTimedtextTemplate(
  templateByVideoId: ReadonlyMap<string, string>,
  videoId: string,
  explicitTemplate?: string,
): string | undefined {
  const candidate = explicitTemplate ?? templateByVideoId.get(videoId);
  return isUsableTimedtextTemplate(candidate) ? candidate : undefined;
}

/** Wait for a signed timedtext template before fetching. */
export function shouldDeferTranscriptFetch(
  template: string | undefined,
): boolean {
  return !isUsableTimedtextTemplate(template);
}

/** Player intercept URLs with pot are one-shot and must not be stored or replayed. */
export function shouldStoreTimedtextTemplate(
  templateUrl: string | undefined,
): boolean {
  if (!isUsableTimedtextTemplate(templateUrl)) return false;
  try {
    return !new URL(templateUrl!, 'https://www.youtube.com').searchParams.has(
      'pot',
    );
  } catch {
    return false;
  }
}

export function pickCaptionTrackBaseUrl(
  tracks: readonly CaptionTrackRef[],
  learningLanguage: string,
  preferredTrackLanguage?: string,
): string | undefined {
  const lang = learningLanguage.trim() || 'en';
  const preferred = preferredTrackLanguage?.trim();
  const usable = tracks.filter((track) =>
    isUsableTimedtextTemplate(track.baseUrl),
  );
  if (!usable.length) return undefined;

  if (preferred) {
    const preferredTrack = usable.find(
      (track) => track.languageCode === preferred,
    );
    if (preferredTrack) return preferredTrack.baseUrl;
  }

  const exact = usable.find((track) => track.languageCode === lang);
  if (exact) return exact.baseUrl;

  if (!lang.includes('-')) {
    const regional = usable.find((track) =>
      track.languageCode.startsWith(`${lang}-`),
    );
    if (regional) return regional.baseUrl;
  }

  const primary = usable.find((track) => !track.languageCode.includes('-'));
  if (primary && !lang.includes('-')) return primary.baseUrl;

  return usable[0]?.baseUrl;
}
