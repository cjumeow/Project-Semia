import {
  CORPUS_NOTES_STORAGE_KEY,
  type CorpusNotesMap,
} from '@semia/shared';

export async function getCorpusNotes(): Promise<CorpusNotesMap> {
  const result = await chrome.storage.local.get(CORPUS_NOTES_STORAGE_KEY);
  return (result[CORPUS_NOTES_STORAGE_KEY] ?? {}) as CorpusNotesMap;
}

/** Background-only: save user markdown for a fragment. */
export async function saveCorpusNote(
  fragmentId: string,
  markdown: string,
): Promise<void> {
  const notes = await getCorpusNotes();
  notes[fragmentId] = {
    markdown,
    updatedAt: new Date().toISOString(),
  };
  await chrome.storage.local.set({ [CORPUS_NOTES_STORAGE_KEY]: notes });
}

/** Background-only: remove notes for deleted fragments. */
export async function deleteCorpusNotes(
  fragmentIds: string[],
): Promise<void> {
  if (fragmentIds.length === 0) return;

  const notes = await getCorpusNotes();
  let changed = false;

  for (const fragmentId of fragmentIds) {
    if (notes[fragmentId]) {
      delete notes[fragmentId];
      changed = true;
    }
  }

  if (changed) {
    await chrome.storage.local.set({ [CORPUS_NOTES_STORAGE_KEY]: notes });
  }
}
