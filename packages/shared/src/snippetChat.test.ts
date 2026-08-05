import { describe, expect, it } from 'vitest';
import {
  SNIPPET_CHAT_GENERAL_THREAD_KEY,
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
