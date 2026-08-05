import { describe, expect, it } from 'vitest';
import {
  SNIPPET_CHAT_GENERAL_THREAD_KEY,
  SnippetChatAbortedError,
  finalizeStreamingAssistantMessages,
  isSnippetChatAbortedError,
  resolveSnippetChatThreadKey,
  snippetChatContextLabel,
} from './snippetChat';

describe('resolveSnippetChatThreadKey', () => {
  it('uses general key when fragment id is absent', () => {
    expect(resolveSnippetChatThreadKey(null)).toBe(
      SNIPPET_CHAT_GENERAL_THREAD_KEY,
    );
    expect(resolveSnippetChatThreadKey(undefined)).toBe(
      SNIPPET_CHAT_GENERAL_THREAD_KEY,
    );
    expect(resolveSnippetChatThreadKey('')).toBe(
      SNIPPET_CHAT_GENERAL_THREAD_KEY,
    );
  });

  it('uses fragment id when present', () => {
    expect(resolveSnippetChatThreadKey('frag-1')).toBe('frag-1');
    expect(resolveSnippetChatThreadKey('  frag-2  ')).toBe('frag-2');
  });
});

describe('snippetChatContextLabel', () => {
  it('returns General chat when no selection text', () => {
    expect(snippetChatContextLabel(null)).toBe('General chat');
    expect(snippetChatContextLabel('')).toBe('General chat');
  });

  it('returns selected text when present', () => {
    expect(snippetChatContextLabel('naval vessels')).toBe('naval vessels');
  });
});

describe('isSnippetChatAbortedError', () => {
  it('detects snippet chat abort errors', () => {
    expect(isSnippetChatAbortedError(new SnippetChatAbortedError())).toBe(true);
    expect(isSnippetChatAbortedError(new Error('Snippet chat aborted'))).toBe(
      false,
    );
  });
});

describe('finalizeStreamingAssistantMessages', () => {
  it('clears streaming on in-flight assistant messages only', () => {
    expect(
      finalizeStreamingAssistantMessages([
        { role: 'user', content: 'hi' },
        { role: 'assistant', content: 'hel', streaming: true },
        { role: 'assistant', content: 'done', streaming: false },
      ]),
    ).toEqual([
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: 'hel', streaming: false },
      { role: 'assistant', content: 'done', streaming: false },
    ]);
  });
});
