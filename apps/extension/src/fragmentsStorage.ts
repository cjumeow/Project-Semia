import {
  FRAGMENTS_STORAGE_KEY,
  type LanguageFragment,
} from '@semia/shared';

function isLanguageFragment(value: unknown): value is LanguageFragment {
  if (!value || typeof value !== 'object') return false;
  const fragment = value as Partial<LanguageFragment>;
  return (
    typeof fragment.id === 'string' &&
    typeof fragment.videoId === 'string' &&
    typeof fragment.selectedText === 'string'
  );
}

export function normalizeFragments(value: unknown): LanguageFragment[] {
  if (Array.isArray(value)) {
    return value.filter(isLanguageFragment);
  }

  if (value && typeof value === 'object') {
    return Object.values(value).filter(isLanguageFragment);
  }

  return [];
}

export async function listFragments(): Promise<LanguageFragment[]> {
  const result = await chrome.storage.local.get(FRAGMENTS_STORAGE_KEY);
  return normalizeFragments(result[FRAGMENTS_STORAGE_KEY]);
}
