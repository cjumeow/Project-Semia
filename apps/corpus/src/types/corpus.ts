import type { LanguageFragment, SnippetNote } from '@semia/shared';

/** Display metadata for a captured YouTube video. */
export type VideoMeta = {
  videoId: string;
  title: string;
  channel: string;
};

export type { SnippetNote } from '@semia/shared';

/** A captured snippet with its associated note. */
export type CorpusSnippet = LanguageFragment & {
  note: SnippetNote;
};

export type YouTubeSourceMeta = {
  kind: 'youtube';
  sourceKey: string;
  sourceUrl: string;
  videoId: string;
  title: string;
  channel: string;
};

export type WebSourceMeta = {
  kind: 'web';
  sourceKey: string;
  sourceUrl: string;
  title: string;
  hostname: string;
};

export type SourceMeta = YouTubeSourceMeta | WebSourceMeta;

/** Snippets grouped under one source, ready for sidebar rendering. */
export type SourceGroup = {
  meta: SourceMeta;
  snippets: CorpusSnippet[];
  /** ISO timestamp of the most recent capture in this group. */
  latestCapturedAt: string;
};

/** @deprecated Use SourceGroup */
export type VideoGroup = SourceGroup;

/** Top-level selection state for the three-column layout. */
export type CorpusPane = 'inbox' | 'library';

export type CorpusSelection = {
  pane: CorpusPane;
  sourceKey: string | null;
  snippetId: string | null;
};

export function isGeneratedNote(note: SnippetNote): boolean {
  return Boolean(note.generatedAt);
}
