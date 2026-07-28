import type { LanguageFragment } from '@semia/shared';

function isLanguageFragment(value: unknown): value is LanguageFragment {
  if (!value || typeof value !== 'object') return false;
  const fragment = value as Partial<LanguageFragment>;
  return (
    typeof fragment.id === 'string' &&
    typeof fragment.videoId === 'string' &&
    typeof fragment.selectedText === 'string'
  );
}

/** Accept array or legacy object-map storage shapes. */
export function normalizeFragments(value: unknown): LanguageFragment[] {
  if (Array.isArray(value)) {
    return value.filter(isLanguageFragment);
  }

  if (value && typeof value === 'object') {
    return Object.values(value).filter(isLanguageFragment);
  }

  return [];
}
