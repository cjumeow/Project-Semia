import type { LanguageFragment, StoredTranscript } from '@semia/shared';

export type {
  FocusRef,
  LanguageFragment,
  SelectionRange,
  SnippetNote,
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
  | { type: 'SAVE_TRANSCRIPT_ERROR'; error: StoredTranscriptError }
  | { type: 'OPEN_SEMIA' }
  | { type: 'LIST_FRAGMENTS' }
  | { type: 'LIST_SNIPPET_NOTES' }
  | { type: 'GENERATE_SNIPPET_NOTE'; fragment: LanguageFragment }
  | { type: 'GENERATE_CONTEXT_WINDOW'; fragment: LanguageFragment }
  | { type: 'OPEN_WEB_CAPTURE'; fragment: LanguageFragment }
  | { type: 'TAKE_PENDING_WEB_RESTORE' }
  | { type: 'FRAGMENTS_CHANGED' };
