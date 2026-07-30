import type { LanguageFragment } from './types';

export type RemoveFragmentsResult = {
  remaining: LanguageFragment[];
  removedIds: string[];
};

/** Drop one fragment by id. */
export function removeFragmentById(
  fragments: LanguageFragment[],
  fragmentId: string,
): RemoveFragmentsResult {
  const removedIds: string[] = [];
  const remaining = fragments.filter((fragment) => {
    if (fragment.id === fragmentId) {
      removedIds.push(fragment.id);
      return false;
    }
    return true;
  });
  return { remaining, removedIds };
}

/** Drop every fragment from the same source URL (one YouTube video or web page). */
export function removeFragmentsBySourceUrl(
  fragments: LanguageFragment[],
  sourceUrl: string,
): RemoveFragmentsResult {
  const removedIds: string[] = [];
  const remaining = fragments.filter((fragment) => {
    if (fragment.sourceUrl === sourceUrl) {
      removedIds.push(fragment.id);
      return false;
    }
    return true;
  });
  return { remaining, removedIds };
}
