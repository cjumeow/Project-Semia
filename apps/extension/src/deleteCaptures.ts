import {
  CORPUS_NOTES_STORAGE_KEY,
  FRAGMENTS_STORAGE_KEY,
  removeFragmentById,
  removeFragmentsBySourceUrl,
  type CorpusNotesMap,
  type LanguageFragment,
} from '@semia/shared';
import { listFragments } from './fragmentsStorage';
import { deleteSnippetNotes } from './snippetNotesStorage';

async function saveFragments(fragments: LanguageFragment[]): Promise<void> {
  await chrome.storage.local.set({ [FRAGMENTS_STORAGE_KEY]: fragments });
}

async function deleteCorpusNotes(fragmentIds: string[]): Promise<void> {
  if (fragmentIds.length === 0) return;

  const result = await chrome.storage.local.get(CORPUS_NOTES_STORAGE_KEY);
  const notes = (result[CORPUS_NOTES_STORAGE_KEY] ?? {}) as CorpusNotesMap;
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

async function purgeFragmentData(fragmentIds: string[]): Promise<void> {
  await Promise.all([
    deleteSnippetNotes(fragmentIds),
    deleteCorpusNotes(fragmentIds),
  ]);
}

export async function deleteFragment(fragmentId: string): Promise<void> {
  const fragments = await listFragments();
  const { remaining, removedIds } = removeFragmentById(fragments, fragmentId);
  if (removedIds.length === 0) return;

  await saveFragments(remaining);
  await purgeFragmentData(removedIds);
}

export async function deleteSource(sourceUrl: string): Promise<void> {
  const fragments = await listFragments();
  const { remaining, removedIds } = removeFragmentsBySourceUrl(
    fragments,
    sourceUrl,
  );
  if (removedIds.length === 0) return;

  await saveFragments(remaining);
  await purgeFragmentData(removedIds);
}
