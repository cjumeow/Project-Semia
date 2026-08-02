import type { LanguageFragment, SnippetNote } from '@semia/shared';
import { isContextWindowEnabled } from '@semia/shared';
import { generateContextWindow } from './generateContextWindow';
import { getSemiaSettings } from '../semiaSettings';
import { completeSnippetNote } from './completeSnippetNote';

async function attachContextWindowIfEnabled(
  fragment: LanguageFragment,
  note: SnippetNote,
): Promise<SnippetNote> {
  const settings = await getSemiaSettings();
  if (!isContextWindowEnabled(settings)) {
    return note;
  }

  try {
    const dynamicContextBlock = await generateContextWindow(fragment);
    return { ...note, dynamicContextBlock };
  } catch (err) {
    console.error(
      `[Semia] Failed to auto-generate context window for ${fragment.id}:`,
      err,
    );
    return note;
  }
}

/** Run post-snip enrichment: illustrative example (word) then context window (if enabled). */
export async function finalizeSnippetNote(
  fragment: LanguageFragment,
  note: SnippetNote,
): Promise<SnippetNote> {
  const withExample = await completeSnippetNote(fragment, note);
  return attachContextWindowIfEnabled(fragment, withExample);
}
