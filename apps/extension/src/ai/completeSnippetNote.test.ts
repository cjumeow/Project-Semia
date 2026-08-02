import { describe, expect, it, vi } from 'vitest';
import type { LanguageFragment, SnippetNote } from '@semia/shared';
import { completeSnippetNote } from './completeSnippetNote';

vi.mock('./generateIllustrativeExample', () => ({
  generateIllustrativeExample: vi.fn(),
}));

import { generateIllustrativeExample } from './generateIllustrativeExample';

const fragment = {
  id: 'frag-1',
  selectedText: 'destroy',
} as LanguageFragment;

const baseNote: SnippetNote = {
  originalSpeech: 'destroy',
  naturalTranslation: '毀滅',
  dynamicContextBlock: '',
  backgroundNote: 'Note',
  unitType: 'word',
  generatedAt: '2026-08-02T00:00:00.000Z',
};

describe('completeSnippetNote', () => {
  it('auto-attaches illustrative example for word notes', async () => {
    vi.mocked(generateIllustrativeExample).mockResolvedValue(
      'The storm could destroy the crops.\n---\n暴風雨可能會摧毀莊稼。',
    );

    const note = await completeSnippetNote(fragment, baseNote);

    expect(generateIllustrativeExample).toHaveBeenCalledWith(fragment);
    expect(note.illustrativeExample).toContain('destroy the crops');
  });

  it('skips illustrative generation for non-word notes', async () => {
    vi.mocked(generateIllustrativeExample).mockClear();

    const note = await completeSnippetNote(fragment, {
      ...baseNote,
      unitType: 'others',
    });

    expect(generateIllustrativeExample).not.toHaveBeenCalled();
    expect(note.illustrativeExample).toBeUndefined();
  });

  it('returns the base note when illustrative generation fails', async () => {
    vi.mocked(generateIllustrativeExample).mockRejectedValue(
      new Error('AI failed'),
    );

    const note = await completeSnippetNote(fragment, baseNote);

    expect(note).toEqual(baseNote);
  });
});
