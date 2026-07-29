import type { LanguageFragment } from '@semia/shared';
import type { CorpusSnippet, SnippetNote } from '../types/corpus';

function normalizeSnippetNote(note: SnippetNote): SnippetNote {
  return {
    ...note,
    dynamicContextBlock: note.dynamicContextBlock ?? '',
    example: note.example ?? '',
  };
}

/** Placeholder note until AI generation. */
export function placeholderNote(fragment: LanguageFragment): SnippetNote {
  const context = fragment.contextCues
    .map((cue) => cue.text.trim())
    .filter(Boolean)
    .join(' ');

  return {
    originalSpeech: fragment.selectedText,
    naturalTranslation: '—',
    dynamicContextBlock: '',
    backgroundNote: context
      ? `Captured context: ${context}\n\n(Note not generated yet.)`
      : '(Note not generated yet.)',
    example: '',
  };
}

export function fragmentToSnippet(
  fragment: LanguageFragment,
  savedNote?: SnippetNote,
): CorpusSnippet {
  return {
    ...fragment,
    note: savedNote ? normalizeSnippetNote(savedNote) : placeholderNote(fragment),
  };
}
