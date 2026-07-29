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
