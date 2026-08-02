import type { LanguageFragment } from './types';
import { describe, expect, it } from 'vitest';
import {
  effectiveSnippetUnitType,
  normalizeSnippetNote,
  parseIllustrativeExampleXml,
  parseSnippetNoteXml,
  parseSnippetUnitType,
} from './parseSnippetNote';

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

describe('parseSnippetUnitType', () => {
  it('accepts word', () => {
    expect(parseSnippetUnitType('word')).toBe('word');
  });

  it('maps anything else to others', () => {
    expect(parseSnippetUnitType('phrase')).toBe('others');
    expect(parseSnippetUnitType('')).toBe('others');
  });
});

describe('parseSnippetNoteXml', () => {
  it('extracts each tag including unit_type word', () => {
    const note = parseSnippetNoteXml(validXml, fragment);

    expect(note).toMatchObject({
      originalSpeech: 'break a leg',
      naturalTranslation: '祝你好運',
      backgroundNote: 'Theatre idiom meaning good luck.',
      unitType: 'word',
    });
    expect(note.illustrativeExample).toBeUndefined();
  });

  it('defaults missing unit_type to others', () => {
    const note = parseSnippetNoteXml(
      `<original_speech>x</original_speech>
       <natural_translation>y</natural_translation>
       <background_note>z</background_note>`,
      fragment,
    );

    expect(note.unitType).toBe('others');
  });

  it('stamps generatedAt', () => {
    const note = parseSnippetNoteXml(validXml, fragment);
    expect(note.generatedAt).toBeDefined();
  });

  it('throws when the reply has no recognisable tags', () => {
    expect(() => parseSnippetNoteXml('nope', fragment)).toThrow(/invalid XML/i);
  });
});

describe('normalizeSnippetNote', () => {
  it('defaults legacy notes without unitType to others', () => {
    const normalized = normalizeSnippetNote({
      originalSpeech: 'a',
      naturalTranslation: 'b',
      dynamicContextBlock: '',
      backgroundNote: 'c',
      generatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(normalized.unitType).toBe('others');
  });

  it('migrates legacy example to illustrativeExample for word notes', () => {
    const normalized = normalizeSnippetNote({
      originalSpeech: 'a',
      naturalTranslation: 'b',
      dynamicContextBlock: '',
      backgroundNote: 'c',
      unitType: 'word',
      example: 'Break a leg tonight!',
    });

    expect(normalized.illustrativeExample).toBe('Break a leg tonight!');
  });

  it('infers word unitType when legacy example exists without unitType', () => {
    const normalized = normalizeSnippetNote({
      originalSpeech: 'a',
      naturalTranslation: 'b',
      dynamicContextBlock: '',
      backgroundNote: 'c',
      example: 'Break a leg tonight!',
    });

    expect(normalized.unitType).toBe('word');
    expect(normalized.illustrativeExample).toBe('Break a leg tonight!');
  });

  it('ignores legacy example when unitType is explicitly others', () => {
    const normalized = normalizeSnippetNote({
      originalSpeech: 'a',
      naturalTranslation: 'b',
      dynamicContextBlock: '',
      backgroundNote: 'c',
      unitType: 'others',
      example: 'should drop',
    });

    expect(normalized.illustrativeExample).toBeUndefined();
  });
});

describe('effectiveSnippetUnitType', () => {
  it('returns others when unitType is absent', () => {
    expect(
      effectiveSnippetUnitType({
        originalSpeech: '',
        naturalTranslation: '',
        dynamicContextBlock: '',
        backgroundNote: '',
      }),
    ).toBe('others');
  });
});

describe('parseIllustrativeExampleXml', () => {
  it('extracts illustrative_example tag', () => {
    expect(
      parseIllustrativeExampleXml(
        '<illustrative_example>Break a leg at your audition!</illustrative_example>',
      ),
    ).toBe('Break a leg at your audition!');
  });
});
