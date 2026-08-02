import { normalizeSnippetNote } from '@semia/shared';
import type { LanguageFragment } from '@semia/shared';
import type { CorpusSnippet, SnippetNote } from '../types/corpus';

/** Placeholder note until AI generation. */
export function placeholderNote(fragment: LanguageFragment): SnippetNote {
  const context = fragment.contextText.trim();

  return {
    originalSpeech: fragment.selectedText,
    naturalTranslation: '—',
    dynamicContextBlock: '',
    backgroundNote: context
      ? `Captured context: ${context}\n\n(Note not generated yet.)`
      : '(Note not generated yet.)',
    unitType: 'others',
  };
}

export function fragmentToSnippet(
  fragment: LanguageFragment,
  savedNote?: SnippetNote,
): CorpusSnippet {
  return {
    ...fragment,
    note: savedNote
      ? normalizeSnippetNote(savedNote)
      : placeholderNote(fragment),
  };
}
