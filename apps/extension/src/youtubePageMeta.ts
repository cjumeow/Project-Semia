import {
  parseYoutubeDocumentTitle,
  pickRicherYoutubeTitle,
  pickYoutubeChannel,
} from '@semia/shared';

export type YoutubePageMeta = {
  title?: string;
  channel?: string;
};

function readMetaContent(doc: Document, selector: string): string | undefined {
  const element = doc.querySelector(selector);
  if (!(element instanceof HTMLMetaElement)) return undefined;
  const content = element.content.trim();
  return content || undefined;
}

function readTextContent(doc: Document, selector: string): string | undefined {
  const text = doc.querySelector(selector)?.textContent?.trim();
  return text || undefined;
}

function readVideoTitle(doc: Document): string | undefined {
  return pickRicherYoutubeTitle(
    readMetaContent(doc, 'meta[name="title"]'),
    readMetaContent(doc, 'meta[property="og:title"]'),
    readTextContent(doc, 'h1.ytd-watch-metadata yt-formatted-string'),
    readTextContent(doc, '#title h1 yt-formatted-string'),
    parseYoutubeDocumentTitle(doc.title),
  );
}

function readChannelName(doc: Document): string | undefined {
  return pickYoutubeChannel(
    readMetaContent(doc, 'meta[name="author"]'),
    readTextContent(doc, 'ytd-video-owner-renderer #channel-name a'),
    readTextContent(doc, 'ytd-channel-name a'),
    readTextContent(doc, '#owner #channel-name a'),
    readMetaContent(doc, 'meta[itemprop="author"]'),
  );
}

export function readYoutubePageMeta(doc: Document = document): YoutubePageMeta {
  return {
    title: readVideoTitle(doc),
    channel: readChannelName(doc),
  };
}

export function mergeYoutubePageMeta(
  ...sources: Array<YoutubePageMeta | undefined>
): YoutubePageMeta {
  return {
    title: pickRicherYoutubeTitle(...sources.map((source) => source?.title)),
    channel: pickYoutubeChannel(...sources.map((source) => source?.channel)),
  };
}

/** Only read the live watch page when it matches the target video. */
export function readYoutubePageMetaForVideo(
  videoId: string,
  activeVideoId: string | null,
  doc: Document = document,
): YoutubePageMeta | undefined {
  if (!activeVideoId || activeVideoId !== videoId) return undefined;
  return readYoutubePageMeta(doc);
}

export function buildYoutubeMetaForVideo(
  videoId: string,
  activeVideoId: string | null,
  bridgeMeta?: YoutubePageMeta,
  doc: Document = document,
): { meta: YoutubePageMeta; authoritative: boolean } {
  const onPage = activeVideoId === videoId;
  const pageMeta = readYoutubePageMetaForVideo(videoId, activeVideoId, doc);

  if (onPage) {
    return {
      meta: mergeYoutubePageMeta(bridgeMeta, pageMeta),
      authoritative: true,
    };
  }

  return {
    meta: bridgeMeta ?? {},
    authoritative: Boolean(bridgeMeta?.title || bridgeMeta?.channel),
  };
}

export function applyYoutubeMeta(
  transcript: { title?: string; channel?: string },
  pageMeta: YoutubePageMeta,
  authoritative: boolean,
): { title?: string; channel?: string } {
  if (authoritative) {
    return {
      title: pageMeta.title ?? transcript.title,
      channel: pageMeta.channel ?? transcript.channel,
    };
  }

  return {
    title: pickRicherYoutubeTitle(transcript.title, pageMeta.title),
    channel: pickYoutubeChannel(transcript.channel, pageMeta.channel),
  };
}
