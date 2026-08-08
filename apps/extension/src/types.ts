import type {
  CardIntent,
  LanguageFragment,
  SnippetChatTurn,
  SnippetTriageStatus,
  StoredTranscript,
} from '@semia/shared';

export type {
  CardIntent,
  FocusRef,
  LanguageCard,
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
  | { type: 'LIST_LANGUAGE_CARDS' }
  | {
      type: 'GET_LANGUAGE_CARD_DRAFT';
      sourceFragmentId: string;
    }
  | {
      type: 'SAVE_LANGUAGE_CARD_DRAFT';
      draft: import('@semia/shared').LanguageCardDraft;
    }
  | {
      type: 'CREATE_LANGUAGE_CARD_FROM_DRAFT';
      fragment: LanguageFragment;
      draft: import('@semia/shared').LanguageCardDraftContent;
    }
  | {
      type: 'UPDATE_LANGUAGE_CARD_CONTENT';
      cardId: string;
      content: import('@semia/shared').LanguageCardDraftContent;
    }
  | {
      type: 'CLEAR_LANGUAGE_CARD_DRAFT';
      sourceFragmentId: string;
    }
  | { type: 'GENERATE_SNIPPET_NOTE'; fragment: LanguageFragment }
  | { type: 'GENERATE_CONTEXT_WINDOW'; fragment: LanguageFragment }
  | {
      type: 'CREATE_LANGUAGE_CARD';
      fragment: LanguageFragment;
      focusText: string;
      intents: CardIntent[];
      learnerNote?: string;
      includeScenario?: boolean;
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
  | { type: 'RECORD_CARD_STILL_LEARNING'; cardId: string }
  | { type: 'MARK_CARD_MASTERED'; cardId: string }
  | { type: 'SET_CARD_MASTERED'; cardId: string }
  | { type: 'TAKE_PENDING_WEB_RESTORE' }
  | { type: 'WEB_RESTORE_RESULT'; fragmentId: string; ok: boolean }
  | {
      type: 'SNIPPET_CHAT';
      fragment?: LanguageFragment;
      history: SnippetChatTurn[];
      userMessage: string;
      globalThread?: boolean;
    }
  | {
      type: 'SUGGEST_LANGUAGE_CARD_FIELDS';
      fragment: LanguageFragment;
      focusText: string;
      fields: import('@semia/shared').LanguageCardSuggestableField[];
    }
  | {
      type: 'SUGGEST_FOCUS_KEYWORDS';
      fragment: LanguageFragment;
      userLevelMode?: import('@semia/shared').FocusKeywordMode;
    };
