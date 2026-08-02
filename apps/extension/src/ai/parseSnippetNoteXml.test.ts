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
<unit_type>word</unit_type>
`;

describe('parseSnippetNoteXml (extension re-export)', () => {
  it('extracts each tag into the note', () => {
    const note = parseSnippetNoteXml(validXml, fragment);

    expect(note.originalSpeech).toBe('break a leg');
    expect(note.naturalTranslation).toBe('祝你好運');
    expect(note.backgroundNote).toBe('Theatre idiom meaning good luck.');
    expect(note.unitType).toBe('word');
  });

  it('stamps generatedAt so the UI can tell real notes from placeholders', () => {
    const note = parseSnippetNoteXml(validXml, fragment);

    expect(note.generatedAt).toBeDefined();
    expect(Number.isNaN(Date.parse(note.generatedAt!))).toBe(false);
  });

  it('defaults unitType to others when tag is missing', () => {
    const note = parseSnippetNoteXml(
      `<original_speech>x</original_speech>
       <natural_translation>y</natural_translation>
       <background_note>z</background_note>`,
      fragment,
    );

    expect(note.unitType).toBe('others');
  });

  it('throws when the reply has no recognisable tags', () => {
    expect(() => parseSnippetNoteXml('I cannot help with that.', fragment)).toThrow(
      /invalid XML/i,
    );
  });
});
