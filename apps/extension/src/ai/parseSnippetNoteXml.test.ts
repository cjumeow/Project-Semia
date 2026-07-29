import type { LanguageFragment } from '@semia/shared';
import { describe, expect, it } from 'vitest';
import { parseSnippetNoteXml } from './parseSnippetNoteXml';

const fragment: LanguageFragment = {
  id: 'frag-1',
  selectedText: 'break a leg',
  contextText: '',
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
    contextCues: [],
    contextCueIndices: [3, 5],
    startSeconds: 20,
    endSeconds: 22,
  },
};

const validXml = `
<original_speech>break a leg</original_speech>
<natural_translation>祝你好運</natural_translation>
<background_note>Theatre idiom meaning good luck.</background_note>
`;

describe('parseSnippetNoteXml', () => {
  it('extracts each tag into the note', () => {
    const note = parseSnippetNoteXml(validXml, fragment);

    expect(note.originalSpeech).toBe('break a leg');
    expect(note.naturalTranslation).toBe('祝你好運');
    expect(note.backgroundNote).toBe('Theatre idiom meaning good luck.');
  });

  it('stamps generatedAt so the UI can tell real notes from placeholders', () => {
    const note = parseSnippetNoteXml(validXml, fragment);

    expect(note.generatedAt).toBeDefined();
    expect(Number.isNaN(Date.parse(note.generatedAt!))).toBe(false);
  });

  it('strips a markdown code fence wrapped around the whole reply', () => {
    const note = parseSnippetNoteXml(
      '```xml\n' + validXml + '\n```',
      fragment,
    );

    expect(note.naturalTranslation).toBe('祝你好運');
  });

  it('strips a code fence buried in surrounding prose', () => {
    const note = parseSnippetNoteXml(
      'Sure, here you go:\n```\n' + validXml + '\n```\nHope that helps!',
      fragment,
    );

    expect(note.naturalTranslation).toBe('祝你好運');
  });

  it('falls back to the selected text when original_speech is missing', () => {
    const note = parseSnippetNoteXml(
      '<natural_translation>祝你好運</natural_translation>',
      fragment,
    );

    expect(note.originalSpeech).toBe('break a leg');
  });

  it('leaves fields the prompt does not produce empty', () => {
    const note = parseSnippetNoteXml(validXml, fragment);

    expect(note.dynamicContextBlock).toBe('');
    expect(note.example).toBe('');
  });

  it('throws when the reply has no recognisable tags', () => {
    expect(() => parseSnippetNoteXml('I cannot help with that.', fragment)).toThrow(
      /invalid XML/i,
    );
  });
});
