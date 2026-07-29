import type { LanguageFragment } from '@semia/shared';
import { describe, expect, it } from 'vitest';
import type { SnippetNote } from '../types/corpus';
import { fragmentToSnippet, placeholderNote } from './fragmentToSnippet';

const fragment: LanguageFragment = {
  id: 'frag-1',
  selectedText: 'break a leg',
  contextText: 'Good luck out there. Break a leg!',
  languageCode: 'en',
  sourceUrl: 'https://www.youtube.com/watch?v=abc123',
  sourceTitle: 'YouTube · abc123',
  capturedAt: '2026-07-29T00:00:00.000Z',
  anchor: {
    kind: 'youtube',
    videoId: 'abc123',
    selection: {
      start: { cueIndex: 4, wordIndex: 0 },
      end: { cueIndex: 4, wordIndex: 2 },
    },
    focusWord: { cueIndex: 4, wordIndex: 0, text: 'break' },
    contextCues: [
      { text: 'Good luck out there.', start: 15, duration: 3 },
      { text: 'Break a leg!', start: 18, duration: 2 },
    ],
    contextCueIndices: [3, 5],
    startSeconds: 18,
    endSeconds: 20,
  },
};

describe('placeholderNote', () => {
  it('shows the captured context while the AI note is missing', () => {
    const note = placeholderNote(fragment);

    expect(note.originalSpeech).toBe('break a leg');
    expect(note.backgroundNote).toContain('Good luck out there. Break a leg!');
    expect(note.backgroundNote).toContain('not generated yet');
  });

  it('still reads sensibly when no context was captured', () => {
    const note = placeholderNote({ ...fragment, contextText: '' });

    expect(note.backgroundNote).toBe('(Note not generated yet.)');
  });

  it('has no generatedAt so the UI treats it as a placeholder', () => {
    expect(placeholderNote(fragment).generatedAt).toBeUndefined();
  });
});

describe('fragmentToSnippet', () => {
  it('uses a placeholder note when nothing is saved', () => {
    const snippet = fragmentToSnippet(fragment);

    expect(snippet.id).toBe('frag-1');
    expect(snippet.note.generatedAt).toBeUndefined();
  });

  it('prefers the saved note when one exists', () => {
    const saved: SnippetNote = {
      originalSpeech: 'break a leg',
      naturalTranslation: '祝你好運',
      dynamicContextBlock: 'context',
      backgroundNote: 'Theatre idiom.',
      example: 'Break a leg tonight!',
      generatedAt: '2026-07-29T01:00:00.000Z',
    };

    expect(fragmentToSnippet(fragment, saved).note).toEqual(saved);
  });

  it('backfills fields added after older notes were stored', () => {
    const legacyNote = {
      originalSpeech: 'break a leg',
      naturalTranslation: '祝你好運',
      backgroundNote: 'Theatre idiom.',
      generatedAt: '2026-07-29T01:00:00.000Z',
    } as SnippetNote;

    const { note } = fragmentToSnippet(fragment, legacyNote);

    expect(note.dynamicContextBlock).toBe('');
    expect(note.example).toBe('');
  });
});
