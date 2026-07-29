import { youtubeStartSeconds, youtubeVideoId } from '@semia/shared';
import type { CorpusSnippet, VideoGroup, VideoMeta } from '../types/corpus';

type GroupOptions = {
  /** Optional lookup when snippets don't carry title/channel yet. */
  videoMeta?: Record<string, VideoMeta>;
};

/** Group snippets by videoId and sort videos by most recent capture. */
export function groupSnippetsByVideo(
  snippets: CorpusSnippet[],
  options: GroupOptions = {},
): VideoGroup[] {
  const byVideo = new Map<string, CorpusSnippet[]>();

  for (const snippet of snippets) {
    if (snippet.anchor.kind !== 'youtube') continue;
    const videoId = youtubeVideoId(snippet);
    const list = byVideo.get(videoId) ?? [];
    list.push(snippet);
    byVideo.set(videoId, list);
  }

  const groups: VideoGroup[] = [];

  for (const [videoId, videoSnippets] of byVideo) {
    const sorted = [...videoSnippets].sort(
      (a, b) => youtubeStartSeconds(a) - youtubeStartSeconds(b),
    );
    const latestCapturedAt = sorted.reduce(
      (latest, s) => (s.capturedAt > latest ? s.capturedAt : latest),
      sorted[0]!.capturedAt,
    );

    const meta = options.videoMeta?.[videoId] ?? {
      videoId,
      title: `YouTube · ${videoId}`,
      channel: 'Unknown channel',
    };

    groups.push({ meta, snippets: sorted, latestCapturedAt });
  }

  return groups.sort(
    (a, b) =>
      new Date(b.latestCapturedAt).getTime() -
      new Date(a.latestCapturedAt).getTime(),
  );
}

export function findSnippet(
  groups: VideoGroup[],
  snippetId: string,
): CorpusSnippet | undefined {
  for (const group of groups) {
    const found = group.snippets.find((s) => s.id === snippetId);
    if (found) return found;
  }
  return undefined;
}

export function findVideoGroup(
  groups: VideoGroup[],
  videoId: string,
): VideoGroup | undefined {
  return groups.find((g) => g.meta.videoId === videoId);
}
