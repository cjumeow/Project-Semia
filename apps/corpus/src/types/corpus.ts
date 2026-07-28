import type { LanguageFragment } from '@semia/shared';

/** Display metadata for a captured YouTube video. */
export type VideoMeta = {
  videoId: string;
  title: string;
  channel: string;
};

/** Structured note content shown on the right-hand card. */
export type SnippetNote = {
  originalSpeech: string;
  naturalTranslation: string;
  backgroundNote: string;
  example: string;
};

/** A captured snippet with its associated note. */
export type CorpusSnippet = LanguageFragment & {
  note: SnippetNote;
};

/** Snippets grouped under one video, ready for sidebar rendering. */
export type VideoGroup = {
  meta: VideoMeta;
  snippets: CorpusSnippet[];
  /** ISO timestamp of the most recent capture in this group. */
  latestCapturedAt: string;
};

/** Top-level selection state for the three-column layout. */
export type CorpusSelection = {
  videoId: string | null;
  snippetId: string | null;
};
