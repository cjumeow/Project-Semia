import {
  setSnippetTriageStatus,
  type LanguageFragment,
  type SnippetTriageStatus,
} from '@semia/shared';

export type TriageStatusUpdate = Exclude<SnippetTriageStatus, 'pending'>;

export type ApplySnippetTriageStatusResult =
  | { ok: true; fragments: LanguageFragment[] }
  | { ok: false; error: string };

export function applySnippetTriageStatus(
  fragments: LanguageFragment[],
  fragmentId: string,
  status: SnippetTriageStatus,
): ApplySnippetTriageStatusResult {
  if (status !== 'review' && status !== 'mastered') {
    return { ok: false, error: 'Invalid triage status.' };
  }

  if (!fragments.some((fragment) => fragment.id === fragmentId)) {
    return { ok: false, error: 'Fragment not found.' };
  }

  return {
    ok: true,
    fragments: setSnippetTriageStatus(fragments, fragmentId, status),
  };
}
