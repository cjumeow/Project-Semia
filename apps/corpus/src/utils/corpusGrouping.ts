import { sourceKey, youtubeStartSeconds } from '@semia/shared';
import type { CorpusSnippet, SourceGroup, VideoMeta } from '../types/corpus';

type GroupOptions = {
  /** Optional lookup when snippets don't carry title/channel yet. */
  videoMeta?: Record<string, VideoMeta>;
};

function buildSourceMeta(
  snippet: CorpusSnippet,
  videoMeta?: Record<string, VideoMeta>,
): SourceGroup['meta'] {
  if (snippet.anchor.kind === 'youtube') {
    const videoId = snippet.anchor.videoId;
    const meta = videoMeta?.[videoId];
    return {
      kind: 'youtube',
      sourceKey: sourceKey(snippet),
      sourceUrl: snippet.sourceUrl,
      videoId,
      title: meta?.title ?? snippet.sourceTitle,
      channel: meta?.channel ?? 'Unknown channel',
    };
  }

  let hostname = snippet.sourceUrl;
  try {
    hostname = new URL(snippet.sourceUrl).hostname;
  } catch {
    // Keep the raw URL when parsing fails.
  }

  return {
    kind: 'web',
    sourceKey: sourceKey(snippet),
    sourceUrl: snippet.sourceUrl,
    title: snippet.sourceTitle,
    hostname,
  };
}

function compareSnippets(a: CorpusSnippet, b: CorpusSnippet): number {
  if (a.anchor.kind === 'youtube' && b.anchor.kind === 'youtube') {
    return a.anchor.startSeconds - b.anchor.startSeconds;
  }
  if (a.anchor.kind === 'web' && b.anchor.kind === 'web') {
    return a.anchor.textPosition.start - b.anchor.textPosition.start;
  }
  return a.capturedAt.localeCompare(b.capturedAt);
}

/** Group snippets by source URL and sort sources by most recent capture. */
export function groupBySource(
  snippets: CorpusSnippet[],
  options: GroupOptions = {},
): SourceGroup[] {
  const bySource = new Map<string, CorpusSnippet[]>();

  for (const snippet of snippets) {
    const key = sourceKey(snippet);
    const list = bySource.get(key) ?? [];
    list.push(snippet);
    bySource.set(key, list);
  }

  const groups: SourceGroup[] = [];

  for (const [, sourceSnippets] of bySource) {
    const sorted = [...sourceSnippets].sort(compareSnippets);
    const latestCapturedAt = sorted.reduce(
      (latest, snippet) =>
        snippet.capturedAt > latest ? snippet.capturedAt : latest,
      sorted[0]!.capturedAt,
    );

    groups.push({
      meta: buildSourceMeta(sorted[0]!, options.videoMeta),
      snippets: sorted,
      latestCapturedAt,
    });
  }

  return groups.sort(
    (a, b) =>
      new Date(b.latestCapturedAt).getTime() -
      new Date(a.latestCapturedAt).getTime(),
  );
}

/** @deprecated Use groupBySource */
export const groupSnippetsByVideo = groupBySource;

export function findSnippet(
  groups: SourceGroup[],
  snippetId: string,
): CorpusSnippet | undefined {
  for (const group of groups) {
    const found = group.snippets.find((snippet) => snippet.id === snippetId);
    if (found) return found;
  }
  return undefined;
}

export function findSourceGroup(
  groups: SourceGroup[],
  sourceKeyValue: string,
): SourceGroup | undefined {
  return groups.find((group) => group.meta.sourceKey === sourceKeyValue);
}

/** @deprecated Use findSourceGroup */
export const findVideoGroup = findSourceGroup;

export function youtubeGroups(groups: SourceGroup[]): SourceGroup[] {
  return groups.filter((group) => group.meta.kind === 'youtube');
}

export function webGroups(groups: SourceGroup[]): SourceGroup[] {
  return groups.filter((group) => group.meta.kind === 'web');
}

export function snippetSeekSeconds(snippet: CorpusSnippet): number | undefined {
  if (snippet.anchor.kind !== 'youtube') return undefined;
  return youtubeStartSeconds(snippet);
}
