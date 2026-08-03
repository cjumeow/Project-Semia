import type { SemiaSettings } from '@semia/shared';
import type { StoredTranscript } from './types';
import {
  buildLearningTimedtextUrl,
  buildTranslatedTimedtextUrl,
  fetchTranscriptSegments,
} from './youtubeTranscript';
import { validateNativeTrackLength } from './cuePairing';

export type BilingualFetchResult =
  | { ok: true; transcript: StoredTranscript; translationUnavailable?: boolean }
  | { ok: false; error: string };

export function transcriptMatchesSettings(
  transcript: StoredTranscript | null,
  settings: SemiaSettings,
): boolean {
  if (!transcript?.segments.length) return false;
  const learningLang = settings.learningLanguage?.trim() || 'en';
  if (transcript.languageCode !== learningLang) return false;

  const bilingual = settings.bilingualCaptionsEnabled !== false;
  if (!bilingual) return true;

  const nativeLang = settings.nativeLanguage?.trim() || 'zh-TW';
  if (transcript.nativeLanguageCode !== nativeLang) return false;
  return (transcript.nativeSegments?.length ?? 0) > 0;
}

export async function fetchBilingualTranscript(options: {
  videoId: string;
  templateUrl?: string;
  settings: SemiaSettings;
  pageMeta?: { title?: string; channel?: string };
  source?: StoredTranscript['source'];
}): Promise<BilingualFetchResult> {
  const { videoId, templateUrl, settings, pageMeta, source } = options;
  const learningLang = settings.learningLanguage?.trim() || 'en';
  const nativeLang = settings.nativeLanguage?.trim() || 'zh-TW';
  const bilingual = settings.bilingualCaptionsEnabled !== false;
  const template = templateUrl ?? videoId;

  let learningSegments;
  try {
    const learningUrl = buildLearningTimedtextUrl(template, learningLang);
    learningSegments = await fetchTranscriptSegments(learningUrl);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to fetch learning track';
    return { ok: false, error: message };
  }

  if (!learningSegments.length) {
    return {
      ok: false,
      error: `No captions for learning language (${learningLang})`,
    };
  }

  let nativeSegments: StoredTranscript['nativeSegments'];
  let translationError: string | undefined;

  if (bilingual && learningLang !== nativeLang) {
    try {
      const nativeUrl = buildTranslatedTimedtextUrl(
        template,
        learningLang,
        nativeLang,
      );
      nativeSegments = await fetchTranscriptSegments(nativeUrl);
      const lengthWarning = validateNativeTrackLength(
        learningSegments.length,
        nativeSegments.length,
      );
      if (lengthWarning === 'length_mismatch') {
        console.warn(
          `[Semia] Native track length mismatch for ${videoId}: learning=${learningSegments.length}, native=${nativeSegments.length}`,
        );
      }
    } catch (err) {
      translationError =
        err instanceof Error ? err.message : 'Translation track failed';
      nativeSegments = [];
      console.warn(`[Semia] Translation unavailable for ${videoId}:`, err);
    }
  }

  const transcript: StoredTranscript = {
    videoId,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    languageCode: learningLang,
    nativeLanguageCode: bilingual ? nativeLang : undefined,
    nativeSegments: bilingual ? nativeSegments : undefined,
    capturedAt: new Date().toISOString(),
    source: source ?? 'interceptedTimedtextUrl',
    segments: learningSegments,
    title: pageMeta?.title,
    channel: pageMeta?.channel,
  };

  if (translationError) {
    return { ok: true, transcript, translationUnavailable: true };
  }

  return { ok: true, transcript };
}
