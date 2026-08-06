import { describe, expect, it } from 'vitest';
import type { CorpusSnippet } from '../types/corpus';
import {
  pruneHiddenAfterExitIds,
  visibleTriageSnippets,
} from './selectionListTriage';

function snippet(id: string): CorpusSnippet {
  return {
    id,
    selectedText: id,
    contextText: id,
    languageCode: 'en',
    sourceUrl: 'https://example.com',
    sourceTitle: 'Source',
    capturedAt: '2026-01-01T00:00:00.000Z',
    anchor: {
      kind: 'web',
      locateQuality: 'precise',
      textQuote: { exact: id },
      textPosition: { start: 0, end: id.length },
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

describe('visibleTriageSnippets', () => {
  it('keeps hidden rows out of the list while props still include them', () => {
    const snippets = [snippet('a'), snippet('b'), snippet('c')];
    const hidden = new Set(['a']);

    expect(visibleTriageSnippets(snippets, hidden).map((row) => row.id)).toEqual([
      'b',
      'c',
    ]);
  });

  it('shows all rows when nothing is hidden after exit', () => {
    const snippets = [snippet('a'), snippet('b')];

    expect(visibleTriageSnippets(snippets, new Set()).map((row) => row.id)).toEqual(
      ['a', 'b'],
    );
  });
});

describe('pruneHiddenAfterExitIds', () => {
  it('drops ids that are no longer in props after refresh', () => {
    const hidden = new Set(['a', 'b']);
    const remaining = new Set(['b', 'c']);

    expect(pruneHiddenAfterExitIds(hidden, remaining)).toEqual(new Set(['b']));
  });
});
