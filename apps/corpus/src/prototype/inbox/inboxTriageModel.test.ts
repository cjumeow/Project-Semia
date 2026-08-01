import { describe, expect, it } from 'vitest';
import {
  createInitialPrototypeSnippets,
  inboxSources,
  librarySources,
  setSnippetStatus,
  simulateCapture,
  snippetsForPane,
} from './inboxTriageModel';

describe('inboxTriageModel', () => {
  it('lists inbox sources only when they have pending snippets', () => {
    const snippets = createInitialPrototypeSnippets();
    expect(inboxSources(snippets).map((source) => source.sourceKey)).toEqual([
      'web:git-flight-rules',
    ]);
    expect(librarySources(snippets).map((source) => source.sourceKey)).toEqual([
      'youtube:startup-pitch',
      'youtube:immersion-tips',
    ]);
  });

  it('shows different snippet subsets per pane for the same source', () => {
    let snippets = createInitialPrototypeSnippets();
    snippets = simulateCapture(snippets, 'youtube:immersion-tips', 'shadowing');

    expect(snippetsForPane(snippets, 'youtube:immersion-tips', 'library')).toHaveLength(
      3,
    );
    expect(snippetsForPane(snippets, 'youtube:immersion-tips', 'inbox')).toHaveLength(
      1,
    );
    expect(inboxSources(snippets).map((source) => source.sourceKey)).toContain(
      'youtube:immersion-tips',
    );
    expect(librarySources(snippets).map((source) => source.sourceKey)).toContain(
      'youtube:immersion-tips',
    );
  });

  it('removes a source from inbox when its last pending snippet is triaged', () => {
    let snippets = createInitialPrototypeSnippets();
    snippets = setSnippetStatus(snippets, 'b1', 'review');
    snippets = setSnippetStatus(snippets, 'b2', 'mastered');

    expect(inboxSources(snippets)).toHaveLength(0);
    expect(librarySources(snippets).map((source) => source.sourceKey)).toContain(
      'web:git-flight-rules',
    );
  });
});
