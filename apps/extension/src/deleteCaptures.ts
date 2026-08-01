import {
  removeFragmentById,
  removeFragmentsBySourceUrl,
} from '@semia/shared';
import { deleteCorpusNotes } from './corpusNotesStorage';
import { listFragments, replaceFragments } from './fragmentsStorage';
import { deleteSnippetNotes } from './snippetNotesStorage';

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

  await replaceFragments(remaining);
  await purgeFragmentData(removedIds);
}

export async function deleteSource(sourceUrl: string): Promise<void> {
  const fragments = await listFragments();
  const { remaining, removedIds } = removeFragmentsBySourceUrl(
    fragments,
    sourceUrl,
  );
  if (removedIds.length === 0) return;

  await replaceFragments(remaining);
  await purgeFragmentData(removedIds);
}
