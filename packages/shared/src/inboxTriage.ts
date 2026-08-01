import type { LanguageFragment, SnippetTriageStatus } from './types';
import { sourceKey } from './webFragment';

export type TriagePane = 'inbox' | 'library';

export type TriageSourceMeta = {
  sourceKey: string;
  sourceKind: 'youtube' | 'web';
  title: string;
  subtitle: string;
};

function effectiveTriageStatus(
  fragment: LanguageFragment,
): SnippetTriageStatus {
  return fragment.triageStatus ?? 'pending';
}

function sourceSubtitle(fragment: LanguageFragment): string {
  try {
    return new URL(fragment.sourceUrl).hostname;
  } catch {
    return fragment.sourceUrl;
  }
}

export function sourceMetaFromFragment(
  fragment: LanguageFragment,
): TriageSourceMeta {
  return {
    sourceKey: sourceKey(fragment),
    sourceKind: fragment.anchor.kind,
    title: fragment.sourceTitle,
    subtitle: sourceSubtitle(fragment),
  };
}

export function inboxSources(fragments: LanguageFragment[]): TriageSourceMeta[] {
  const byKey = new Map<string, TriageSourceMeta>();
  for (const fragment of fragments) {
    if (effectiveTriageStatus(fragment) !== 'pending') continue;
    const key = sourceKey(fragment);
    if (!byKey.has(key)) {
      byKey.set(key, sourceMetaFromFragment(fragment));
    }
  }
  return [...byKey.values()];
}

export function librarySources(
  fragments: LanguageFragment[],
): TriageSourceMeta[] {
  const byKey = new Map<string, TriageSourceMeta>();
  for (const fragment of fragments) {
    if (effectiveTriageStatus(fragment) === 'pending') continue;
    const key = sourceKey(fragment);
    if (!byKey.has(key)) {
      byKey.set(key, sourceMetaFromFragment(fragment));
    }
  }
  return [...byKey.values()];
}

export function pendingCountForSource(
  fragments: LanguageFragment[],
  key: string,
): number {
  return fragments.filter(
    (fragment) =>
      sourceKey(fragment) === key && effectiveTriageStatus(fragment) === 'pending',
  ).length;
}

export function snippetsForPane(
  fragments: LanguageFragment[],
  key: string,
  pane: TriagePane,
): LanguageFragment[] {
  return fragments.filter((fragment) => {
    if (sourceKey(fragment) !== key) return false;
    return pane === 'inbox'
      ? effectiveTriageStatus(fragment) === 'pending'
      : effectiveTriageStatus(fragment) !== 'pending';
  });
}

export function allPendingSnippets(
  fragments: LanguageFragment[],
): LanguageFragment[] {
  return fragments
    .filter((fragment) => effectiveTriageStatus(fragment) === 'pending')
    .sort((a, b) => {
      const byDate = b.capturedAt.localeCompare(a.capturedAt);
      if (byDate !== 0) return byDate;
      return a.sourceTitle.localeCompare(b.sourceTitle);
    });
}

export function setSnippetTriageStatus(
  fragments: LanguageFragment[],
  snippetId: string,
  status: Exclude<SnippetTriageStatus, 'pending'>,
): LanguageFragment[] {
  return fragments.map((fragment) =>
    fragment.id === snippetId
      ? { ...fragment, triageStatus: status }
      : fragment,
  );
}
