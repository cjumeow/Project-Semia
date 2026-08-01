import { describe, expect, it } from 'vitest';
import type { LanguageFragment, SnippetTriageStatus } from './types';
import {
  allPendingSnippets,
  inboxSources,
  librarySources,
  pendingCountForSource,
  setSnippetTriageStatus,
  snippetsForPane,
} from './inboxTriage';

const gitUrl = 'https://github.com/phodal/flight-rules';
const pitchUrl = 'https://www.youtube.com/watch?v=startup-pitch';
const immersionUrl = 'https://www.youtube.com/watch?v=immersion-tips';

const webAnchor = {
  kind: 'web' as const,
  textQuote: { exact: 'word' },
  textPosition: { start: 0, end: 4 },
  locateQuality: 'precise' as const,
};

const youtubeAnchor = {
  kind: 'youtube' as const,
  videoId: 'vid1',
  selection: {
    start: { cueIndex: 0, wordIndex: 0 },
    end: { cueIndex: 0, wordIndex: 0 },
  },
  focusWord: { cueIndex: 0, wordIndex: 0, text: 'word' },
  contextCues: [],
  contextCueIndices: [0, 0] as [number, number],
  startSeconds: 0,
  endSeconds: 1,
};

function fragment(
  id: string,
  opts: {
    sourceUrl: string;
    sourceTitle: string;
    triageStatus: SnippetTriageStatus;
    capturedAt?: string;
    anchor?: LanguageFragment['anchor'];
  },
): LanguageFragment {
  return {
    id,
    selectedText: id,
    contextText: 'context',
    languageCode: 'en',
    sourceUrl: opts.sourceUrl,
    sourceTitle: opts.sourceTitle,
    capturedAt: opts.capturedAt ?? '2026-01-01T00:00:00.000Z',
    triageStatus: opts.triageStatus,
    anchor: opts.anchor ?? webAnchor,
  };
}

function createFixtureFragments(): LanguageFragment[] {
  return [
    fragment('a1', {
      sourceUrl: pitchUrl,
      sourceTitle: 'How to pitch your startup',
      triageStatus: 'mastered',
      anchor: youtubeAnchor,
    }),
    fragment('a2', {
      sourceUrl: pitchUrl,
      sourceTitle: 'How to pitch your startup',
      triageStatus: 'mastered',
      anchor: youtubeAnchor,
    }),
    fragment('a3', {
      sourceUrl: pitchUrl,
      sourceTitle: 'How to pitch your startup',
      triageStatus: 'review',
      anchor: youtubeAnchor,
    }),
    fragment('b1', {
      sourceUrl: gitUrl,
      sourceTitle: 'Git flight rules',
      triageStatus: 'pending',
    }),
    fragment('b2', {
      sourceUrl: gitUrl,
      sourceTitle: 'Git flight rules',
      triageStatus: 'pending',
    }),
    fragment('c1', {
      sourceUrl: immersionUrl,
      sourceTitle: 'Immersion learning tips',
      triageStatus: 'mastered',
      anchor: youtubeAnchor,
    }),
    fragment('c2', {
      sourceUrl: immersionUrl,
      sourceTitle: 'Immersion learning tips',
      triageStatus: 'review',
      anchor: youtubeAnchor,
    }),
    fragment('c3', {
      sourceUrl: immersionUrl,
      sourceTitle: 'Immersion learning tips',
      triageStatus: 'mastered',
      anchor: youtubeAnchor,
    }),
  ];
}

describe('inboxTriage', () => {
  it('lists inbox sources only when they have pending snippets', () => {
    const fragments = createFixtureFragments();

    expect(inboxSources(fragments).map((source) => source.sourceKey)).toEqual([
      gitUrl,
    ]);
    expect(librarySources(fragments).map((source) => source.sourceKey)).toEqual(
      [pitchUrl, immersionUrl],
    );
  });

  it('shows different snippet subsets per pane for the same source', () => {
    let fragments = createFixtureFragments();
    fragments = [
      ...fragments,
      fragment('c4', {
        sourceUrl: immersionUrl,
        sourceTitle: 'Immersion learning tips',
        triageStatus: 'pending',
        capturedAt: '2026-02-01T00:00:00.000Z',
        anchor: youtubeAnchor,
      }),
    ];

    expect(
      snippetsForPane(fragments, immersionUrl, 'library'),
    ).toHaveLength(3);
    expect(snippetsForPane(fragments, immersionUrl, 'inbox')).toHaveLength(1);
    expect(inboxSources(fragments).map((source) => source.sourceKey)).toContain(
      immersionUrl,
    );
    expect(
      librarySources(fragments).map((source) => source.sourceKey),
    ).toContain(immersionUrl);
  });

  it('removes a source from inbox when its last pending snippet is triaged', () => {
    let fragments = createFixtureFragments();
    fragments = setSnippetTriageStatus(fragments, 'b1', 'review');
    fragments = setSnippetTriageStatus(fragments, 'b2', 'mastered');

    expect(inboxSources(fragments)).toHaveLength(0);
    expect(
      librarySources(fragments).map((source) => source.sourceKey),
    ).toContain(gitUrl);
  });

  it('counts pending snippets per source', () => {
    const fragments = createFixtureFragments();

    expect(pendingCountForSource(fragments, gitUrl)).toBe(2);
    expect(
      pendingCountForSource(fragments, 'https://www.youtube.com/watch?v=startup-pitch'),
    ).toBe(0);
  });

  it('treats missing triageStatus as pending', () => {
    const fragments = [
      fragment('explicit', {
        sourceUrl: 'https://example.com/a',
        sourceTitle: 'Alpha',
        triageStatus: 'pending',
      }),
      {
        ...fragment('implicit', {
          sourceUrl: 'https://example.com/b',
          sourceTitle: 'Beta',
          triageStatus: 'pending',
        }),
        triageStatus: undefined,
      },
    ];

    expect(inboxSources(fragments)).toHaveLength(2);
    expect(allPendingSnippets(fragments).map((snippet) => snippet.id)).toEqual([
      'explicit',
      'implicit',
    ]);
  });

  it('returns all pending snippets sorted newest first, then by source title', () => {
    const fragments = [
      fragment('old', {
        sourceUrl: 'https://example.com/z',
        sourceTitle: 'Zebra page',
        triageStatus: 'pending',
        capturedAt: '2026-01-01T00:00:00.000Z',
      }),
      fragment('new', {
        sourceUrl: 'https://example.com/a',
        sourceTitle: 'Alpha page',
        triageStatus: 'pending',
        capturedAt: '2026-02-01T00:00:00.000Z',
      }),
      fragment('same-day', {
        sourceUrl: 'https://example.com/m',
        sourceTitle: 'Middle page',
        triageStatus: 'pending',
        capturedAt: '2026-02-01T00:00:00.000Z',
      }),
      fragment('triaged', {
        sourceUrl: 'https://example.com/x',
        sourceTitle: 'Done page',
        triageStatus: 'review',
        capturedAt: '2026-03-01T00:00:00.000Z',
      }),
    ];

    expect(allPendingSnippets(fragments).map((snippet) => snippet.id)).toEqual([
      'new',
      'same-day',
      'old',
    ]);
  });
});
