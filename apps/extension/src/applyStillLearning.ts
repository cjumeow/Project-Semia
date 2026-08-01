import { stillLearning, type LanguageFragment } from '@semia/shared';

export type ApplyStillLearningResult =
  | { ok: true; fragments: LanguageFragment[] }
  | { ok: false; error: string };

export function applyStillLearning(
  fragments: LanguageFragment[],
  fragmentId: string,
  now: string,
): ApplyStillLearningResult {
  const target = fragments.find((fragment) => fragment.id === fragmentId);
  if (!target) {
    return { ok: false, error: 'Fragment not found.' };
  }

  if ((target.triageStatus ?? 'pending') !== 'review') {
    return { ok: false, error: 'Fragment is not in review.' };
  }

  return {
    ok: true,
    fragments: stillLearning(fragments, fragmentId, now),
  };
}
