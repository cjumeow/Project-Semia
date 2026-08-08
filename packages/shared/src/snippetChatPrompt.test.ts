import { describe, expect, it } from 'vitest';
import {
  buildActiveCapturePromptBlock,
  didSnippetChatContextChange,
  formatSnippetChatContextSwitchNotice,
} from './snippetChatPrompt';

const fragment = {
  id: 'frag-1',
  selectedText: 'naval vessels',
  sourceTitle: 'Navy documentary',
  sourceUrl: 'https://example.com',
  contextText: 'context',
  languageCode: 'en',
  capturedAt: '2026-01-01T00:00:00.000Z',
  anchor: {
    kind: 'web' as const,
    textQuote: { exact: 'naval' },
    textPosition: { start: 0, end: 5 },
    locateQuality: 'precise' as const,
  },
};

describe('didSnippetChatContextChange', () => {
  it('returns false when fragment id is unchanged', () => {
    expect(didSnippetChatContextChange('frag-1', 'frag-1')).toBe(false);
    expect(didSnippetChatContextChange(null, null)).toBe(false);
  });

  it('returns true when switching to a different capture', () => {
    expect(didSnippetChatContextChange('frag-1', 'frag-2')).toBe(true);
  });

  it('returns false on first capture grounding', () => {
    expect(didSnippetChatContextChange(undefined, 'frag-2')).toBe(false);
    expect(didSnippetChatContextChange(null, 'frag-2')).toBe(false);
  });
});

describe('formatSnippetChatContextSwitchNotice', () => {
  it('names the new capture in plain English', () => {
    expect(formatSnippetChatContextSwitchNotice(fragment)).toBe(
      'Context switched to "naval vessels". I will answer using only this capture from now on.',
    );
  });
});

describe('buildActiveCapturePromptBlock', () => {
  it('includes capture identity for model grounding', () => {
    const block = buildActiveCapturePromptBlock(fragment);
    expect(block).toContain('ACTIVE CAPTURE');
    expect(block).toContain('frag-1');
    expect(block).toContain('naval vessels');
  });
});
