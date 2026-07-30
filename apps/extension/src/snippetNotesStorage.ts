import {
  SNIPPET_NOTES_STORAGE_KEY,
  type SnippetNote,
  type SnippetNotesMap,
} from '@semia/shared';

export async function getSnippetNotes(): Promise<SnippetNotesMap> {
  const result = await chrome.storage.local.get(SNIPPET_NOTES_STORAGE_KEY);
  return (result[SNIPPET_NOTES_STORAGE_KEY] ?? {}) as SnippetNotesMap;
}

export async function getSnippetNote(
  fragmentId: string,
): Promise<SnippetNote | null> {
  const notes = await getSnippetNotes();
  return notes[fragmentId] ?? null;
}

export async function saveSnippetNote(
  fragmentId: string,
  note: SnippetNote,
): Promise<void> {
  const notes = await getSnippetNotes();
  notes[fragmentId] = note;
  await chrome.storage.local.set({
    [SNIPPET_NOTES_STORAGE_KEY]: notes,
  });
}

export async function deleteSnippetNotes(fragmentIds: string[]): Promise<void> {
  if (fragmentIds.length === 0) return;

  const notes = await getSnippetNotes();
  let changed = false;

  for (const fragmentId of fragmentIds) {
    if (notes[fragmentId]) {
      delete notes[fragmentId];
      changed = true;
    }
  }

  if (changed) {
    await chrome.storage.local.set({
      [SNIPPET_NOTES_STORAGE_KEY]: notes,
    });
  }
}
