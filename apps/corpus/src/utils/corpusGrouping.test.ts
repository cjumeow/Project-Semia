import { youtubeVideoId } from '@semia/shared';
import { describe, expect, it } from 'vitest';
import type { CorpusSnippet, VideoMeta } from '../types/corpus';
import { findSnippet, findVideoGroup, groupSnippetsByVideo } from './corpusGrouping';

function makeSnippet(
  overrides: {
    id: string;
    videoId: string;
    startSeconds: number;
    capturedAt: string;
  },
): CorpusSnippet {
  const { id, videoId, startSeconds, capturedAt } = overrides;

  return {
    id,
    selectedText: `text ${id}`,
    contextText: `text ${id}`,
    languageCode: 'en',
    sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
    sourceTitle: `YouTube · ${videoId}`,
    capturedAt,
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
      startSeconds,
      endSeconds: startSeconds + 2,
    },
    note: {
      originalSpeech: `text ${id}`,
      naturalTranslation: '',
      dynamicContextBlock: '',
      backgroundNote: '',
      example: '',
    },
  };
}

const snippets: CorpusSnippet[] = [
  // Video "old" was captured first, but its snippets are out of playback order.
  makeSnippet({
    id: 's1',
    videoId: 'old',
    startSeconds: 90,
    capturedAt: '2026-07-01T10:00:00.000Z',
  }),
  makeSnippet({
    id: 's2',
    videoId: 'old',
    startSeconds: 30,
    capturedAt: '2026-07-01T09:00:00.000Z',
  }),
  makeSnippet({
    id: 's3',
    videoId: 'new',
    startSeconds: 10,
    capturedAt: '2026-07-20T08:00:00.000Z',
  }),
];

describe('groupSnippetsByVideo', () => {
  it('groups snippets under their video', () => {
    const groups = groupSnippetsByVideo(snippets);

    expect(groups).toHaveLength(2);
    expect(groups.map((g) => g.meta.videoId)).toEqual(['new', 'old']);
  });

  it('sorts videos by most recent capture first', () => {
    const groups = groupSnippetsByVideo(snippets);

    expect(groups[0]!.meta.videoId).toBe('new');
    expect(groups[1]!.latestCapturedAt).toBe('2026-07-01T10:00:00.000Z');
  });

  it('sorts snippets inside a video by playback position', () => {
    const groups = groupSnippetsByVideo(snippets);
    const old = groups.find((g) => g.meta.videoId === 'old')!;

    expect(old.snippets.map((s) => s.id)).toEqual(['s2', 's1']);
  });

  it('falls back to a placeholder title when no metadata is known', () => {
    const groups = groupSnippetsByVideo(snippets);
    const meta = groups[0]!.meta;

    expect(meta.title).toBe('YouTube · new');
    expect(meta.channel).toBe('Unknown channel');
  });

  it('prefers supplied metadata over the placeholder', () => {
    const videoMeta: Record<string, VideoMeta> = {
      new: { videoId: 'new', title: 'Real Title', channel: 'Real Channel' },
    };
    const groups = groupSnippetsByVideo(snippets, { videoMeta });

    expect(groups[0]!.meta.title).toBe('Real Title');
  });

  it('returns nothing for an empty library', () => {
    expect(groupSnippetsByVideo([])).toEqual([]);
  });
});

describe('findSnippet', () => {
  it('finds a snippet across every group', () => {
    const groups = groupSnippetsByVideo(snippets);
    const found = findSnippet(groups, 's1');

    expect(found).toBeDefined();
    expect(youtubeVideoId(found!)).toBe('old');
    expect(findSnippet(groups, 'missing')).toBeUndefined();
  });
});

describe('findVideoGroup', () => {
  it('finds a group by video id', () => {
    const groups = groupSnippetsByVideo(snippets);

    expect(findVideoGroup(groups, 'new')?.snippets).toHaveLength(1);
    expect(findVideoGroup(groups, 'missing')).toBeUndefined();
  });
});
