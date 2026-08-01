import type { StoredTranscript, StoredTranscriptError } from './types';
import { TRANSCRIPTS_STORAGE_KEY } from '@semia/shared';

export {
  FRAGMENTS_STORAGE_KEY,
  TRANSCRIPTS_STORAGE_KEY,
} from '@semia/shared';
const ERROR_STORAGE_KEY = 'youtubeTranscriptErrors';

/**
 * Merge-save a transcript by videoId.
 */
export async function saveTranscript(transcript: StoredTranscript): Promise<void> {
  const current = await chrome.storage.local.get(TRANSCRIPTS_STORAGE_KEY);
  const map = (current[TRANSCRIPTS_STORAGE_KEY] ?? {}) as Record<
    string,
    StoredTranscript
  >;
  const existing = map[transcript.videoId];
  map[transcript.videoId] = {
    ...existing,
    ...transcript,
    title: transcript.title ?? existing?.title,
    channel: transcript.channel ?? existing?.channel,
  };
  await chrome.storage.local.set({ [TRANSCRIPTS_STORAGE_KEY]: map });
}

/**
 * Read a stored transcript by videoId.
 */
export async function getTranscript(
  videoId: string,
): Promise<StoredTranscript | null> {
  const current = await chrome.storage.local.get(TRANSCRIPTS_STORAGE_KEY);
  const map = (current[TRANSCRIPTS_STORAGE_KEY] ?? {}) as Record<
    string,
    StoredTranscript
  >;
  return map[videoId] ?? null;
}

export async function listTranscripts(): Promise<StoredTranscript[]> {
  const current = await chrome.storage.local.get(TRANSCRIPTS_STORAGE_KEY);
  const map = (current[TRANSCRIPTS_STORAGE_KEY] ?? {}) as Record<
    string,
    StoredTranscript
  >;
  return Object.values(map);
}

/**
 * Merge-save a transcript error by videoId.
 */
export async function saveTranscriptError(
  err: StoredTranscriptError,
): Promise<void> {
  const current = await chrome.storage.local.get(ERROR_STORAGE_KEY);
  const map = (current[ERROR_STORAGE_KEY] ?? {}) as Record<
    string,
    StoredTranscriptError
  >;
  map[err.videoId] = err;
  await chrome.storage.local.set({ [ERROR_STORAGE_KEY]: map });
}
