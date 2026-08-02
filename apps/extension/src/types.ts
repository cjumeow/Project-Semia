import type { LanguageFragment, SnippetTriageStatus, StoredTranscript } from '@semia/shared';

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
  | { type: 'SAVE_FRAGMENT'; fragment: LanguageFragment }
  | { type: 'SAVE_CORPUS_NOTE'; fragmentId: string; markdown: string }
  | { type: 'SAVE_TRANSCRIPT'; transcript: StoredTranscript }
  | { type: 'SAVE_TRANSCRIPT_ERROR'; error: StoredTranscriptError }
  | { type: 'OPEN_SEMIA' }
  | { type: 'LIST_FRAGMENTS' }
  | { type: 'LIST_TRANSCRIPTS' }
  | { type: 'LIST_SNIPPET_NOTES' }
  | { type: 'GENERATE_SNIPPET_NOTE'; fragment: LanguageFragment }
  | { type: 'GENERATE_CONTEXT_WINDOW'; fragment: LanguageFragment }
  | { type: 'GENERATE_ILLUSTRATIVE_EXAMPLE'; fragment: LanguageFragment }
  | {
      type: 'SAVE_ILLUSTRATIVE_EXAMPLE';
      fragmentId: string;
      illustrativeExample: string;
    }
  | { type: 'OPEN_WEB_CAPTURE'; fragment: LanguageFragment }
  | { type: 'DELETE_FRAGMENT'; fragmentId: string }
  | { type: 'DELETE_SOURCE'; sourceUrl: string }
  | {
      type: 'SET_SNIPPET_TRIAGE_STATUS';
      fragmentId: string;
      status: Exclude<SnippetTriageStatus, 'pending'>;
    }
  | { type: 'RECORD_STILL_LEARNING'; fragmentId: string }
  | { type: 'TAKE_PENDING_WEB_RESTORE' }
  | { type: 'WEB_RESTORE_RESULT'; fragmentId: string; ok: boolean };
