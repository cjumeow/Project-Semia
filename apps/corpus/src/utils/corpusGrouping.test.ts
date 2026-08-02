import { sourceKey, youtubeVideoId } from '@semia/shared';
import { describe, expect, it } from 'vitest';
import type { CorpusSnippet, VideoMeta } from '../types/corpus';
import {
  findSnippet,
  findSourceGroup,
  groupBySource,
  inboxGroups,
  libraryGroups,
  webGroups,
  youtubeGroups,
} from './corpusGrouping';

function makeYoutubeSnippet(
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
      unitType: 'others',
    },
  };
}

function makeWebSnippet(
  overrides: Pick<CorpusSnippet, 'id' | 'selectedText' | 'capturedAt'> & {
    sourceUrl: string;
    start: number;
  },
): CorpusSnippet {
  return {
    id: overrides.id,
    selectedText: overrides.selectedText,
    contextText: overrides.selectedText,
    languageCode: 'en',
    sourceUrl: overrides.sourceUrl,
    sourceTitle: 'Example Article',
    capturedAt: overrides.capturedAt,
    anchor: {
      kind: 'web',
      locateQuality: 'precise',
      textQuote: { exact: overrides.selectedText },
      textPosition: { start: overrides.start, end: overrides.start + overrides.selectedText.length },
    },
    note: {
      originalSpeech: overrides.selectedText,
      naturalTranslation: '',
      dynamicContextBlock: '',
      backgroundNote: '',
      unitType: 'others',
    },
  };
}

const snippets: CorpusSnippet[] = [
  makeYoutubeSnippet({
    id: 's1',
    videoId: 'old',
    startSeconds: 90,
    capturedAt: '2026-07-01T10:00:00.000Z',
  }),
  makeYoutubeSnippet({
    id: 's2',
    videoId: 'old',
    startSeconds: 30,
    capturedAt: '2026-07-01T09:00:00.000Z',
  }),
  makeYoutubeSnippet({
    id: 's3',
    videoId: 'new',
    startSeconds: 10,
    capturedAt: '2026-07-20T08:00:00.000Z',
  }),
  makeWebSnippet({
    id: 'w1',
    selectedText: 'pivot strategy',
    sourceUrl: 'https://example.com/post',
    start: 120,
    capturedAt: '2026-07-21T08:00:00.000Z',
  }),
];

describe('groupBySource', () => {
  it('groups snippets under their source URL', () => {
    const groups = groupBySource(snippets);

    expect(groups).toHaveLength(3);
    expect(youtubeGroups(groups)).toHaveLength(2);
    expect(webGroups(groups)).toHaveLength(1);
  });

  it('sorts sources by most recent capture first', () => {
    const groups = groupBySource(snippets);

    expect(groups[0]!.meta.sourceKey).toBe('https://example.com/post');
    expect(groups[0]!.meta.kind).toBe('web');
  });

  it('sorts youtube snippets inside a source by playback position', () => {
    const groups = groupBySource(snippets);
    const old = groups.find(
      (group) => group.meta.kind === 'youtube' && group.meta.videoId === 'old',
    )!;

    expect(old.snippets.map((snippet) => snippet.id)).toEqual(['s2', 's1']);
  });

  it('falls back to a placeholder title when no metadata is known', () => {
    const groups = groupBySource(snippets);
    const youtube = youtubeGroups(groups).find(
      (group) =>
        group.meta.kind === 'youtube' && group.meta.videoId === 'new',
    )!;

    expect(youtube.meta.kind).toBe('youtube');
    if (youtube.meta.kind === 'youtube') {
      expect(youtube.meta.title).toBe('YouTube · new');
      expect(youtube.meta.channel).toBe('Unknown channel');
    }
  });

  it('prefers supplied metadata over the placeholder', () => {
    const videoMeta: Record<string, VideoMeta> = {
      new: { videoId: 'new', title: 'Real Title', channel: 'Real Channel' },
    };
    const groups = groupBySource(snippets, { videoMeta });
    const youtube = youtubeGroups(groups).find(
      (group) =>
        group.meta.kind === 'youtube' && group.meta.videoId === 'new',
    )!;

    expect(youtube.meta.kind).toBe('youtube');
    if (youtube.meta.kind === 'youtube') {
      expect(youtube.meta.title).toBe('Real Title');
    }
  });

  it('returns nothing for an empty library', () => {
    expect(groupBySource([])).toEqual([]);
  });
});

describe('findSnippet', () => {
  it('finds a snippet across every group', () => {
    const groups = groupBySource(snippets);
    const found = findSnippet(groups, 's1');

    expect(found).toBeDefined();
    expect(youtubeVideoId(found!)).toBe('old');
    expect(findSnippet(groups, 'missing')).toBeUndefined();
  });
});

describe('findSourceGroup', () => {
  it('finds a group by source key', () => {
    const groups = groupBySource(snippets);

    expect(
      findSourceGroup(groups, sourceKey(snippets[3]!))?.snippets,
    ).toHaveLength(1);
    expect(findSourceGroup(groups, 'missing')).toBeUndefined();
  });
});

describe('inboxGroups and libraryGroups', () => {
  it('splits pending and triaged snippets for the same source', () => {
    const mixed: CorpusSnippet[] = [
      {
        ...makeYoutubeSnippet({
          id: 'pending-1',
          videoId: 'mix',
          startSeconds: 10,
          capturedAt: '2026-08-01T00:00:00.000Z',
        }),
        triageStatus: 'pending',
      },
      {
        ...makeYoutubeSnippet({
          id: 'done-1',
          videoId: 'mix',
          startSeconds: 20,
          capturedAt: '2026-08-01T01:00:00.000Z',
        }),
        triageStatus: 'mastered',
      },
    ];
    const groups = groupBySource(mixed);

    expect(inboxGroups(groups)).toHaveLength(1);
    expect(inboxGroups(groups)[0]?.snippets.map((snippet) => snippet.id)).toEqual([
      'pending-1',
    ]);
    expect(libraryGroups(groups)).toHaveLength(1);
    expect(
      libraryGroups(groups)[0]?.snippets.map((snippet) => snippet.id),
    ).toEqual(['done-1']);
  });

  it('omits sources with no snippets in that pane', () => {
    const onlyPending = groupBySource([
      {
        ...makeWebSnippet({
          id: 'w-pending',
          selectedText: 'todo',
          sourceUrl: 'https://example.com/a',
          start: 0,
          capturedAt: '2026-08-01T00:00:00.000Z',
        }),
        triageStatus: 'pending',
      },
    ]);

    expect(inboxGroups(onlyPending)).toHaveLength(1);
    expect(libraryGroups(onlyPending)).toHaveLength(0);
  });
});
