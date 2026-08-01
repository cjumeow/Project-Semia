import { describe, expect, it } from 'vitest';
import type { LanguageFragment } from './types';
import {
  removeFragmentById,
  removeFragmentsBySourceUrl,
} from './removeFragments';

const youtubeFragment = (
  id: string,
  videoUrl: string,
): LanguageFragment => ({
  id,
  selectedText: id,
  contextText: id,
  languageCode: 'en',
  sourceUrl: videoUrl,
  sourceTitle: 'Video',
  capturedAt: '2026-07-30T00:00:00.000Z',
  triageStatus: 'pending',
  anchor: {
    kind: 'youtube',
    videoId: 'abc',
    selection: { start: { cueIndex: 0, wordIndex: 0 }, end: { cueIndex: 0, wordIndex: 0 } },
    focusWord: { cueIndex: 0, wordIndex: 0, text: 'word' },
    contextCues: [],
    contextCueIndices: [0, 0],
    startSeconds: 0,
    endSeconds: 1,
  },
});

describe('removeFragmentById', () => {
  it('removes only the matching fragment', () => {
    const fragments = [
      youtubeFragment('a', 'https://www.youtube.com/watch?v=1'),
      youtubeFragment('b', 'https://www.youtube.com/watch?v=1'),
    ];

    const result = removeFragmentById(fragments, 'a');

    expect(result.removedIds).toEqual(['a']);
    expect(result.remaining.map((fragment) => fragment.id)).toEqual(['b']);
  });
});

describe('removeFragmentsBySourceUrl', () => {
  it('removes every fragment from the same source URL', () => {
    const urlA = 'https://www.youtube.com/watch?v=1';
    const urlB = 'https://www.youtube.com/watch?v=2';
    const fragments = [
      youtubeFragment('a', urlA),
      youtubeFragment('b', urlA),
      youtubeFragment('c', urlB),
    ];

    const result = removeFragmentsBySourceUrl(fragments, urlA);

    expect(result.removedIds).toEqual(['a', 'b']);
    expect(result.remaining.map((fragment) => fragment.id)).toEqual(['c']);
  });
});
