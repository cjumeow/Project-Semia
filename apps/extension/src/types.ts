export type TranscriptSegment = { // one cue
  /** Plain text (already de-HTML'd). */
  text: string;
  /** Start time in seconds. */
  start: number;
  /** Duration in seconds. */
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

export type StoredTranscriptError = {
  videoId: string;
  videoUrl: string;
  capturedAt: string;
  source: 'ytInitialPlayerResponse' | 'interceptedTimedtextUrl' | 'unknown';
  error: string;
};

/** Position of a clickable word inside the full transcript. */
export type WordRef = {
  cueIndex: number;
  wordIndex: number;
};

/** Focus word: the word the user clicked to enter Capture mode (not selection start). */
export type FocusRef = WordRef & {
  text: string;
};

/** Two-click word selection range (inclusive). */
export type SelectionRange = {
  start: WordRef;
  end: WordRef;
};

export type LanguageFragment = {
  id: string;
  videoId: string;
  videoUrl: string;
  languageCode: string;
  /** Text from the two-click selection. */
  selectedText: string;
  selection: SelectionRange;
  /** Trigger word that opened Capture mode. */
  focusWord: FocusRef;
  /** Context cues shown in the sidebar (±2 around focus). */
  contextCues: TranscriptSegment[];
  /** Inclusive cue-index range of contextCues in the full transcript. */
  contextCueIndices: [number, number];
  /** Time bounds covering the selected cues. */
  start: number;
  end: number;
  capturedAt: string;
};

export type BackgroundMessage =
  | { type: 'SAVE_TRANSCRIPT'; transcript: StoredTranscript }
  | { type: 'SAVE_TRANSCRIPT_ERROR'; error: StoredTranscriptError };
