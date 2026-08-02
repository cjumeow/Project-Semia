import { describe, expect, it } from 'vitest';
import { buildIllustrativeExamplePrompt } from './buildIllustrativeExamplePrompt';
import type { LanguageFragment } from '@semia/shared';

const fragment: LanguageFragment = {
  id: 'frag-1',
  selectedText: 'destroy',
  contextText: 'They are threatening to destroy us.',
  languageCode: 'en',
  sourceUrl: 'https://www.youtube.com/watch?v=demo',
  sourceTitle: 'Demo video',
  capturedAt: '2026-08-02T00:00:00.000Z',
  anchor: {
    kind: 'youtube',
    videoId: 'demo',
    selection: {
      start: { cueIndex: 0, wordIndex: 4 },
      end: { cueIndex: 0, wordIndex: 4 },
    },
    focusWord: { cueIndex: 0, wordIndex: 4, text: 'destroy' },
    contextCues: [],
    contextCueIndices: [0, 0],
    startSeconds: 4,
    endSeconds: 4,
  },
};

describe('buildIllustrativeExamplePrompt', () => {
  it('requires a new sentence grounded in capture context, not copied transcript', () => {
    const { system } = buildIllustrativeExamplePrompt({
      fragment,
      nativeLanguage: 'zh-TW',
    });

    expect(system).toContain('destroy');
    expect(system).toMatch(/newly invented|do NOT copy/i);
    expect(system).toMatch(/situational usage/i);
    expect(system).toContain('illustrative_example');
  });

  it('includes capture metadata in the user block', () => {
    const { user } = buildIllustrativeExamplePrompt({
      fragment,
      nativeLanguage: 'zh-TW',
    });

    expect(user).toContain('destroy');
    expect(user).toContain('Focus word: destroy');
  });
});
