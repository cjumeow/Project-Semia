import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { LanguageFragment, SnippetNote } from '@semia/shared';
import { finalizeSnippetNote } from './finalizeSnippetNote';

vi.mock('./completeSnippetNote', () => ({
  completeSnippetNote: vi.fn(),
}));

vi.mock('./generateContextWindow', () => ({
  generateContextWindow: vi.fn(),
}));

vi.mock('../semiaSettings', () => ({
  getSemiaSettings: vi.fn(),
}));

import { completeSnippetNote } from './completeSnippetNote';
import { generateContextWindow } from './generateContextWindow';
import { getSemiaSettings } from '../semiaSettings';

const fragment = { id: 'frag-1', selectedText: 'word' } as LanguageFragment;

const baseNote: SnippetNote = {
  originalSpeech: 'word',
  naturalTranslation: '詞',
  dynamicContextBlock: '',
  backgroundNote: 'Note',
  unitType: 'others',
  generatedAt: '2026-08-02T00:00:00.000Z',
};

describe('finalizeSnippetNote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(completeSnippetNote).mockImplementation(async (_fragment, note) => note);
    vi.mocked(getSemiaSettings).mockResolvedValue({ contextWindowEnabled: true });
    vi.mocked(generateContextWindow).mockResolvedValue(
      'Surrounding line.\n---\n周邊句子。',
    );
  });

  it('auto-attaches context window when setting is enabled', async () => {
    const note = await finalizeSnippetNote(fragment, baseNote);

    expect(generateContextWindow).toHaveBeenCalledWith(fragment);
    expect(note.dynamicContextBlock).toContain('Surrounding line');
  });

  it('skips context window when setting is disabled', async () => {
    vi.mocked(getSemiaSettings).mockResolvedValue({ contextWindowEnabled: false });

    const note = await finalizeSnippetNote(fragment, baseNote);

    expect(generateContextWindow).not.toHaveBeenCalled();
    expect(note.dynamicContextBlock).toBe('');
  });

  it('returns note without context when generation fails', async () => {
    vi.mocked(generateContextWindow).mockRejectedValue(new Error('AI failed'));

    const note = await finalizeSnippetNote(fragment, baseNote);

    expect(note.dynamicContextBlock).toBe('');
  });
});
