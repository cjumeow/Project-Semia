import { finalizeSnippetNote } from './ai/finalizeSnippetNote';
import { generateSnippetNote } from './ai/generateSnippetNote';
import type { LanguageFragment } from './types';
import { getSnippetNote, saveSnippetNote } from './snippetNotesStorage';

const inFlight = new Map<string, Promise<void>>();

export async function ensureSnippetNote(
  fragment: LanguageFragment,
): Promise<void> {
  const existing = await getSnippetNote(fragment.id);
  if (existing?.generatedAt) {
    return;
  }

  const pending = inFlight.get(fragment.id);
  if (pending) {
    await pending;
    return;
  }

  const job = (async (): Promise<void> => {
    try {
      const note = await finalizeSnippetNote(
        fragment,
        await generateSnippetNote(fragment),
      );
      await saveSnippetNote(fragment.id, note);
    } finally {
      inFlight.delete(fragment.id);
    }
  })();

  inFlight.set(fragment.id, job);
  await job;
}

export function isSnippetNoteInFlight(fragmentId: string): boolean {
  return inFlight.has(fragmentId);
}
