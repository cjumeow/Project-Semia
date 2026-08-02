import type { LanguageFragment, SnippetNote } from '@semia/shared';
import { generateIllustrativeExample } from './generateIllustrativeExample';

/** Attach an auto-generated illustrative example when the capture is word-level. */
export async function completeSnippetNote(
  fragment: LanguageFragment,
  note: SnippetNote,
): Promise<SnippetNote> {
  if (note.unitType !== 'word') {
    return note;
  }

  try {
    const illustrativeExample = await generateIllustrativeExample(fragment);
    return { ...note, illustrativeExample };
  } catch (err) {
    console.error(
      `[Semia] Failed to auto-generate illustrative example for ${fragment.id}:`,
      err,
    );
    return note;
  }
}
