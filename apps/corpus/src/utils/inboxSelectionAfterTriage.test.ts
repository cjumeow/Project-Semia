import { describe, expect, it } from 'vitest';
import type { CorpusSelection, CorpusSnippet, SourceGroup } from '../types/corpus';
import {
  inboxSelectionAfterTriage,
  resolveInboxSelectedSnippet,
} from './inboxSelectionAfterTriage';

function snippet(id: string, videoId: string): CorpusSnippet {
  return {
    id,
    selectedText: id,
    contextText: id,
    languageCode: 'en',
    sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
    sourceTitle: `YouTube · ${videoId}`,
    capturedAt: '2026-01-01T00:00:00.000Z',
    anchor: {
      kind: 'youtube',
      videoId,
      selection: {
        start: { cueIndex: 0, wordIndex: 0 },
        end: { cueIndex: 0, wordIndex: 1 },
      },
      focusWord: { cueIndex: 0, wordIndex: 0, text: 'word' },
      contextCues: [],
      contextCueIndices: [0, 0],
      startSeconds: 0,
      endSeconds: 2,
    },
    note: {
      originalSpeech: id,
      naturalTranslation: '',
      dynamicContextBlock: '',
      backgroundNote: '',
      unitType: 'others',
    },
  };
}

const inboxGroups: SourceGroup[] = [
  {
    meta: {
      kind: 'youtube',
      sourceKey: 'youtube:vid-a',
      sourceUrl: 'https://www.youtube.com/watch?v=vid-a',
      videoId: 'vid-a',
      title: 'Video A',
      channel: 'Channel',
    },
    snippets: [],
    latestCapturedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    meta: {
      kind: 'youtube',
      sourceKey: 'youtube:vid-b',
      sourceUrl: 'https://www.youtube.com/watch?v=vid-b',
      videoId: 'vid-b',
      title: 'Video B',
      channel: 'Channel',
    },
    snippets: [],
    latestCapturedAt: '2026-01-01T00:00:00.000Z',
  },
];

const inboxSelection: CorpusSelection = {
  pane: 'inbox',
  sourceKey: 'youtube:vid-a',
  snippetId: 'a',
  cardId: null,
};

describe('inboxSelectionAfterTriage', () => {
  it('advances to the next pending snippet in the same source', () => {
    const pending = [snippet('a', 'vid-a'), snippet('b', 'vid-a'), snippet('c', 'vid-b')];

    expect(
      inboxSelectionAfterTriage('a', inboxSelection, pending, inboxGroups),
    ).toEqual({
      pane: 'inbox',
      sourceKey: 'youtube:vid-a',
      snippetId: 'b',
      cardId: null,
    });
  });

  it('does not change selection when triaging a non-selected snippet', () => {
    const pending = [snippet('a', 'vid-a'), snippet('b', 'vid-a')];

    expect(
      inboxSelectionAfterTriage('b', inboxSelection, pending, inboxGroups),
    ).toBeNull();
  });

  it('clears snippet selection when the inbox becomes empty', () => {
    expect(
      inboxSelectionAfterTriage('a', inboxSelection, [snippet('a', 'vid-a')], inboxGroups),
    ).toEqual({
      pane: 'inbox',
      sourceKey: 'youtube:vid-a',
      snippetId: null,
      cardId: null,
    });
  });
});

describe('resolveInboxSelectedSnippet', () => {
  it('falls back to the first pending snippet when selection is stale', () => {
    const pending = [snippet('b', 'vid-a'), snippet('c', 'vid-b')];

    expect(resolveInboxSelectedSnippet('a', pending)?.id).toBe('b');
  });
});
