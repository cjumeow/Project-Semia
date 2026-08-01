import type { CorpusSnippet } from '../../types/corpus';

const note = {
  originalSpeech: 'We look forward to hearing from you.',
  naturalTranslation: '我們期待收到你的回音。',
  dynamicContextBlock:
    'We look forward to hearing from you.\n---\n我們期待收到你的回音。',
  backgroundNote:
    '「look forward to」後面接動名詞或動名詞，表示期待某事發生。',
  example: 'I look forward to meeting you.',
  generatedAt: '2026-08-01T10:05:00.000Z',
};

export function createLibraryPromoteMockSnippets(): CorpusSnippet[] {
  return [
    {
      id: 'r1',
      selectedText: 'look forward to',
      contextText: 'We look forward to hearing from you.',
      languageCode: 'en',
      sourceUrl: 'https://www.youtube.com/watch?v=demo',
      sourceTitle: 'Immersion learning tips',
      capturedAt: '2026-08-01T10:00:00.000Z',
      triageStatus: 'review',
      anchor: {
        kind: 'youtube',
        videoId: 'demo',
        selection: {
          start: { cueIndex: 0, wordIndex: 0 },
          end: { cueIndex: 0, wordIndex: 2 },
        },
        focusWord: { cueIndex: 0, wordIndex: 0, text: 'look' },
        contextCues: [],
        contextCueIndices: [0, 0],
        startSeconds: 198,
        endSeconds: 200,
      },
      note,
    },
    {
      id: 'r2',
      selectedText: 'spaced repetition',
      contextText: 'Spaced repetition helps retention.',
      languageCode: 'en',
      sourceUrl: 'https://www.youtube.com/watch?v=demo',
      sourceTitle: 'Immersion learning tips',
      capturedAt: '2026-08-01T09:00:00.000Z',
      triageStatus: 'review',
      anchor: {
        kind: 'youtube',
        videoId: 'demo',
        selection: {
          start: { cueIndex: 1, wordIndex: 0 },
          end: { cueIndex: 1, wordIndex: 1 },
        },
        focusWord: { cueIndex: 1, wordIndex: 0, text: 'spaced' },
        contextCues: [],
        contextCueIndices: [0, 0],
        startSeconds: 318,
        endSeconds: 320,
      },
      note,
    },
    {
      id: 'm1',
      selectedText: 'comprehensible input',
      contextText: 'Comprehensible input is key.',
      languageCode: 'en',
      sourceUrl: 'https://www.youtube.com/watch?v=demo',
      sourceTitle: 'Immersion learning tips',
      capturedAt: '2026-07-28T08:00:00.000Z',
      triageStatus: 'mastered',
      anchor: {
        kind: 'youtube',
        videoId: 'demo',
        selection: {
          start: { cueIndex: 2, wordIndex: 0 },
          end: { cueIndex: 2, wordIndex: 1 },
        },
        focusWord: { cueIndex: 2, wordIndex: 0, text: 'comprehensible' },
        contextCues: [],
        contextCueIndices: [0, 0],
        startSeconds: 42,
        endSeconds: 44,
      },
      note,
    },
    {
      id: 'r3',
      selectedText: 'rebase onto',
      contextText: 'Git rebase onto another branch.',
      languageCode: 'en',
      sourceUrl: 'https://github.com/example/flight-rules',
      sourceTitle: 'Git flight rules',
      capturedAt: '2026-08-01T11:00:00.000Z',
      triageStatus: 'review',
      anchor: {
        kind: 'web',
        locateQuality: 'precise',
        textQuote: { exact: 'rebase onto' },
        textPosition: { start: 120, end: 131 },
      },
      note,
    },
  ];
}

export function describePromoteState(snippets: CorpusSnippet[]): string {
  const review = snippets.filter((snippet) => snippet.triageStatus === 'review');
  const mastered = snippets.filter(
    (snippet) => snippet.triageStatus === 'mastered',
  );
  return `Review: ${review.map((s) => s.selectedText).join(', ') || '(none)'} · Mastered: ${mastered.map((s) => s.selectedText).join(', ') || '(none)'}`;
}
