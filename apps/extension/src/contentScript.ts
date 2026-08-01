import type { StoredTranscript } from './types';
import {
  fetchTranscriptSegments,
  toJson3Url,
} from './youtubeTranscript';
import { getTranscript, TRANSCRIPTS_STORAGE_KEY } from './storage';
import { getVideoIdFromUrl, navigateCue } from './playerSync';
import { createCaptionOverlay } from './captionOverlay';
import { createCaptureSidebar } from './sidebarPanel';
import {
  applyYoutubeMeta,
  buildYoutubeMetaForVideo,
  type YoutubePageMeta,
} from './youtubePageMeta';

const BRIDGE_SOURCE = 'YT_TRANSCRIPT_CAPTURE_BRIDGE';
let lastCapturedVideoId: string | null = null;

type BridgeMessage = {
  source: typeof BRIDGE_SOURCE;
  type: 'TIMEDTEXT_URL';
  url: string;
  title?: string;
  channel?: string;
};

const sidebar = createCaptureSidebar();
const captionOverlay = createCaptionOverlay({
  onWordClick: (ref) => sidebar.beginCaptureFromOverlay(ref),
});
let currentVideoId: string | null = getVideoIdFromUrl();
let currentTranscript: StoredTranscript | null = null;

function syncTranscriptToUi(transcript: StoredTranscript | null): void {
  currentTranscript = transcript;
  sidebar.setTranscript(transcript);
  captionOverlay.setTranscript(transcript);
}

async function sendTranscriptToBackground(
  transcript: StoredTranscript,
): Promise<void> {
  await chrome.runtime.sendMessage({ type: 'SAVE_TRANSCRIPT', transcript });
}

function buildPageMeta(
  videoId: string,
  bridgeMeta?: YoutubePageMeta,
): { meta: YoutubePageMeta; authoritative: boolean } {
  return buildYoutubeMetaForVideo(
    videoId,
    getVideoIdFromUrl() ?? currentVideoId,
    bridgeMeta,
  );
}

function applyPageMeta(
  transcript: StoredTranscript,
  pageMeta: YoutubePageMeta,
  authoritative: boolean,
): StoredTranscript {
  const next = applyYoutubeMeta(transcript, pageMeta, authoritative);
  return {
    ...transcript,
    title: next.title,
    channel: next.channel,
  };
}

async function refreshStoredVideoMeta(
  videoId: string,
  bridgeMeta?: YoutubePageMeta,
): Promise<void> {
  const existing = await getTranscript(videoId);
  if (!existing) return;

  const activeVideoId = getVideoIdFromUrl() ?? currentVideoId;
  if (activeVideoId !== videoId) return;

  const { meta, authoritative } = buildPageMeta(videoId, bridgeMeta);
  if (!meta.title && !meta.channel) return;

  const updated = applyPageMeta(existing, meta, authoritative);
  if (
    updated.title === existing.title &&
    updated.channel === existing.channel
  ) {
    return;
  }

  await sendTranscriptToBackground(updated);

  if (videoId === activeVideoId) {
    syncTranscriptToUi(updated);
  }
}

async function loadTranscriptForVideo(videoId: string | null): Promise<void> {
  if (!videoId) {
    syncTranscriptToUi(null);
    return;
  }
  const stored = await getTranscript(videoId);
  syncTranscriptToUi(stored);
}

async function handleInterceptedURL(
  timedtextUrl: string,
  bridgeMeta?: YoutubePageMeta,
): Promise<void> {
  try {
    const urlObj = new URL(timedtextUrl);
    const videoId = urlObj.searchParams.get('v');
    const lang = urlObj.searchParams.get('lang') ?? 'unknown';
    if (!videoId) return;

    const pageMetaResult = buildPageMeta(videoId, bridgeMeta);
    const { meta: pageMeta, authoritative } = pageMetaResult;
    const existing = await getTranscript(videoId);

    if (existing?.segments.length) {
      if (lastCapturedVideoId === videoId) return;
      lastCapturedVideoId = videoId;

      if (authoritative && (pageMeta.title || pageMeta.channel)) {
        const updated = applyPageMeta(existing, pageMeta, true);
        if (
          updated.title !== existing.title ||
          updated.channel !== existing.channel
        ) {
          await sendTranscriptToBackground(updated);
          if (videoId === (getVideoIdFromUrl() ?? currentVideoId)) {
            currentVideoId = videoId;
            syncTranscriptToUi(updated);
          }
        }
      }
      return;
    }

    if (lastCapturedVideoId === videoId) {
      return;
    }
    lastCapturedVideoId = videoId;

    const json3Url = toJson3Url(timedtextUrl);
    const segments = await fetchTranscriptSegments(json3Url);

    const stored: StoredTranscript = {
      videoId,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      languageCode: lang,
      capturedAt: new Date().toISOString(),
      source: 'interceptedTimedtextUrl',
      segments,
      title: pageMeta.title,
      channel: pageMeta.channel,
    };
    await sendTranscriptToBackground(stored);
    console.debug('Transcript captured and sent to background:', stored);

    if (videoId === (getVideoIdFromUrl() ?? currentVideoId)) {
      currentVideoId = videoId;
      syncTranscriptToUi(stored);
    }
  } catch (err) {
    lastCapturedVideoId = null;
    console.error('Error capturing transcript:', err);
  }
}

function installPageWorldListener(): void {
  window.addEventListener('message', (event: MessageEvent) => {
    const data = event.data as Partial<BridgeMessage>;
    if (!data || data.source !== BRIDGE_SOURCE) return;
    if (data.type === 'TIMEDTEXT_URL' && typeof data.url === 'string') {
      void handleInterceptedURL(data.url, {
        title: data.title,
        channel: data.channel,
      });
    }
  });
}

function installKeyboardShortcut(): void {
  window.addEventListener(
    'keydown',
    (ev: KeyboardEvent) => {
      const target = ev.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return;
      }

      if (
        !sidebar.isOpen() &&
        !ev.altKey &&
        !ev.metaKey &&
        !ev.ctrlKey &&
        (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight')
      ) {
        const segments = currentTranscript?.segments ?? [];
        if (segments.length > 0) {
          ev.preventDefault();
          ev.stopPropagation();
          navigateCue(segments, ev.key === 'ArrowLeft' ? -1 : 1);
        }
        return;
      }

      if (
        ev.altKey &&
        !ev.metaKey &&
        !ev.ctrlKey &&
        ev.code === 'KeyZ' &&
        !sidebar.isOpen()
      ) {
        ev.preventDefault();
        ev.stopPropagation();
        sidebar.beginCaptureFromShortcut();
        return;
      }

      if (ev.altKey && !ev.metaKey && !ev.ctrlKey && ev.code === 'KeyS') {
        ev.preventDefault();
        ev.stopPropagation();
        if (!sidebar.isOpen()) {
          sidebar.beginCaptureFromShortcut();
        }
        sidebar.selectFocusWord();
      }
    },
    true,
  );
}

function installStorageListener(): void {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    const change = changes[TRANSCRIPTS_STORAGE_KEY];
    if (!change) return;

    const videoId = getVideoIdFromUrl() ?? currentVideoId;
    if (!videoId) return;

    const map = (change.newValue ?? {}) as Record<string, StoredTranscript>;
    syncTranscriptToUi(map[videoId] ?? null);
  });
}

function scheduleMetaRefresh(videoId: string | null): void {
  if (!videoId) return;
  window.setTimeout(() => {
    if ((getVideoIdFromUrl() ?? currentVideoId) !== videoId) return;
    void refreshStoredVideoMeta(videoId);
  }, 2000);
}

function installSpaNavigationWatcher(): void {
  let lastHref = location.href;

  const check = (): void => {
    if (location.href === lastHref) return;
    lastHref = location.href;

    const nextId = getVideoIdFromUrl();
    if (nextId === currentVideoId) return;

    currentVideoId = nextId;
    lastCapturedVideoId = null;
    void loadTranscriptForVideo(nextId);
    scheduleMetaRefresh(nextId);
  };

  window.addEventListener('yt-navigate-finish', check);
  window.addEventListener('popstate', check);
  window.setInterval(check, 800);
}

installPageWorldListener();
installKeyboardShortcut();
installStorageListener();
installSpaNavigationWatcher();
void loadTranscriptForVideo(currentVideoId);
scheduleMetaRefresh(currentVideoId);
