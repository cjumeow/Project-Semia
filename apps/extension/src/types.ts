import type { StoredTranscript } from '@semia/shared';

export type {
  FocusRef,
  LanguageFragment,
  SelectionRange,
  StoredTranscript,
  TranscriptSegment,
  WordRef,
} from '@semia/shared';

export type StoredTranscriptError = {
  videoId: string;
  videoUrl: string;
  capturedAt: string;
  source: 'ytInitialPlayerResponse' | 'interceptedTimedtextUrl' | 'unknown';
  error: string;
};

export type BackgroundMessage =
  | { type: 'SAVE_TRANSCRIPT'; transcript: StoredTranscript }
  | { type: 'SAVE_TRANSCRIPT_ERROR'; error: StoredTranscriptError };
