import {
  FRAGMENTS_STORAGE_KEY,
  normalizeFragments,
  type LanguageFragment,
} from '@semia/shared';

export { normalizeFragments };

export async function listFragments(): Promise<LanguageFragment[]> {
  const result = await chrome.storage.local.get(FRAGMENTS_STORAGE_KEY);
  return normalizeFragments(result[FRAGMENTS_STORAGE_KEY]);
}

/** Background-only: append a captured fragment. */
export async function appendFragment(fragment: LanguageFragment): Promise<void> {
  const list = await listFragments();
  list.push(fragment);
  await chrome.storage.local.set({ [FRAGMENTS_STORAGE_KEY]: list });
}

/** Background-only: replace the full fragment list. */
export async function replaceFragments(
  fragments: LanguageFragment[],
): Promise<void> {
  await chrome.storage.local.set({ [FRAGMENTS_STORAGE_KEY]: fragments });
}
