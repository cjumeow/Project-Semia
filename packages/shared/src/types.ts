export type TranscriptSegment = {
  text: string;
  start: number;
  duration: number;
};

export type StoredTranscript = {
  videoId: string;
  videoUrl: string;
  languageCode: string;
  capturedAt: string;
  source: 'ytInitialPlayerResponse' | 'interceptedTimedtextUrl' | 'unknown';
  segments: TranscriptSegment[];
};

export type WordRef = {
  cueIndex: number;
  wordIndex: number;
};

export type FocusRef = WordRef & {
  text: string;
};

export type SelectionRange = {
  start: WordRef;
  end: WordRef;
};

export type LanguageFragment = {
  id: string;
  videoId: string;
  videoUrl: string;
  languageCode: string;
  selectedText: string;
  selection: SelectionRange;
  focusWord: FocusRef;
  contextCues: TranscriptSegment[];
  contextCueIndices: [number, number];
  start: number;
  end: number;
  capturedAt: string;
};

export type CorpusNote = {
  markdown: string;
  updatedAt: string;
};

export type CorpusNotesMap = Record<string, CorpusNote>;
