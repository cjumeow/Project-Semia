import {
  FRAGMENTS_STORAGE_KEY,
  migrateFragment,
  normalizeFragments,
  type LanguageFragment,
} from '@semia/shared';
import {
  applySnippetTriageStatus,
  type TriageStatusUpdate,
} from './updateSnippetTriageStatus';
import { applyStillLearning } from './applyStillLearning';

export { normalizeFragments };

export async function listFragments(): Promise<LanguageFragment[]> {
  const result = await chrome.storage.local.get(FRAGMENTS_STORAGE_KEY);
  return normalizeFragments(result[FRAGMENTS_STORAGE_KEY]);
}

/** Background-only: append a captured fragment. */
export async function appendFragment(fragment: LanguageFragment): Promise<void> {
  const migrated = migrateFragment(fragment);
  if (!migrated) {
    throw new Error('Invalid fragment.');
  }

  const list = await listFragments();
  list.push({
    ...migrated,
    triageStatus: migrated.triageStatus ?? 'pending',
  });
  await chrome.storage.local.set({ [FRAGMENTS_STORAGE_KEY]: list });
}

/** Background-only: replace the full fragment list. */
export async function replaceFragments(
  fragments: LanguageFragment[],
): Promise<void> {
  await chrome.storage.local.set({ [FRAGMENTS_STORAGE_KEY]: fragments });
}

export async function setSnippetTriageStatus(
  fragmentId: string,
  status: TriageStatusUpdate,
): Promise<void> {
  const list = await listFragments();
  const result = applySnippetTriageStatus(list, fragmentId, status);
  if (!result.ok) {
    throw new Error(result.error);
  }

  await replaceFragments(result.fragments);
}

export async function recordStillLearning(fragmentId: string): Promise<void> {
  const list = await listFragments();
  const result = applyStillLearning(list, fragmentId, new Date().toISOString());
  if (!result.ok) {
    throw new Error(result.error);
  }

  await replaceFragments(result.fragments);
}
