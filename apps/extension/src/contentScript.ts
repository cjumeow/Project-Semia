import type { SemiaSettings } from '@semia/shared';
import { SEMIA_SETTINGS_STORAGE_KEY } from '@semia/shared';
import type { StoredTranscript } from './types';
import {
  fetchBilingualTranscript,
  transcriptMatchesSettings,
} from './bilingualTranscriptFetch';
import { getTranscript, TRANSCRIPTS_STORAGE_KEY } from './storage';
import { getVideoIdFromUrl, navigateCue } from './playerSync';
import { createCaptionOverlay } from './captionOverlay';
import { createCaptureSidebar } from './sidebarPanel';
import { getSemiaSettings } from './semiaSettings';
import {
  applyYoutubeMeta,
  buildYoutubeMetaForVideo,
  type YoutubePageMeta,
} from './youtubePageMeta';

const BRIDGE_SOURCE = 'YT_TRANSCRIPT_CAPTURE_BRIDGE';

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

const timedtextTemplateByVideoId = new Map<string, string>();
const inflightSync = new Map<string, Promise<void>>();

let currentVideoId: string | null = getVideoIdFromUrl();
let currentTranscript: StoredTranscript | null = null;
let currentSettings: SemiaSettings | null = null;

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

async function syncBilingualTranscriptForVideo(
  videoId: string,
  options?: {
    templateUrl?: string;
    bridgeMeta?: YoutubePageMeta;
    force?: boolean;
  },
): Promise<void> {
  if (options?.templateUrl) {
    timedtextTemplateByVideoId.set(videoId, options.templateUrl);
  }

  const settings = currentSettings ?? (await getSemiaSettings());
  currentSettings = settings;

  const existing = await getTranscript(videoId);
  if (!options?.force && transcriptMatchesSettings(existing, settings)) {
    if (videoId === (getVideoIdFromUrl() ?? currentVideoId)) {
      syncTranscriptToUi(existing);
    }
    return;
  }

  const syncKey = `${videoId}:${settings.learningLanguage}:${settings.nativeLanguage}:${settings.bilingualCaptionsEnabled}`;
  const inflight = inflightSync.get(syncKey);
  if (inflight) {
    await inflight;
    return;
  }

  const job = (async () => {
    const { meta } = buildPageMeta(videoId, options?.bridgeMeta);
    const template =
      options?.templateUrl ?? timedtextTemplateByVideoId.get(videoId);

    const result = await fetchBilingualTranscript({
      videoId,
      templateUrl: template,
      settings,
      pageMeta: meta,
      source: 'interceptedTimedtextUrl',
    });

    if (!result.ok) {
      console.warn(`[Semia] Transcript fetch failed for ${videoId}:`, result.error);
      if (videoId === (getVideoIdFromUrl() ?? currentVideoId)) {
        syncTranscriptToUi(existing);
      }
      return;
    }

    const stored = applyPageMeta(
      result.transcript,
      meta,
      Boolean(meta.title || meta.channel),
    );
    await sendTranscriptToBackground(stored);

    if (videoId === (getVideoIdFromUrl() ?? currentVideoId)) {
      currentVideoId = videoId;
      syncTranscriptToUi(stored);
    }
  })();

  inflightSync.set(syncKey, job);
  try {
    await job;
  } finally {
    inflightSync.delete(syncKey);
  }
}

async function handleInterceptedURL(
  timedtextUrl: string,
  bridgeMeta?: YoutubePageMeta,
): Promise<void> {
  try {
    const urlObj = new URL(timedtextUrl);
    const videoId = urlObj.searchParams.get('v');
    if (!videoId) return;

    const existing = await getTranscript(videoId);
    const { meta: pageMeta, authoritative } = buildPageMeta(videoId, bridgeMeta);

    if (existing?.segments.length && authoritative && (pageMeta.title || pageMeta.channel)) {
      const updated = applyPageMeta(existing, pageMeta, true);
      if (
        updated.title !== existing.title ||
        updated.channel !== existing.channel
      ) {
        await sendTranscriptToBackground(updated);
        if (videoId === (getVideoIdFromUrl() ?? currentVideoId)) {
          syncTranscriptToUi(updated);
        }
      }
    }

    await syncBilingualTranscriptForVideo(videoId, {
      templateUrl: timedtextUrl,
      bridgeMeta,
    });
  } catch (err) {
    console.error('Error capturing transcript:', err);
  }
}

async function onSemiaSettingsChange(settings: SemiaSettings): Promise<void> {
  currentSettings = settings;
  const videoId = getVideoIdFromUrl() ?? currentVideoId;
  if (!videoId) return;
  await syncBilingualTranscriptForVideo(videoId, { force: true });
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

    const settingsChange = changes[SEMIA_SETTINGS_STORAGE_KEY];
    if (settingsChange) {
      void (async () => {
        const next = (settingsChange.newValue ?? {}) as SemiaSettings;
        const merged = { ...(await getSemiaSettings()), ...next };
        await onSemiaSettingsChange(merged);
      })();
    }

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
    void loadTranscriptForVideo(nextId);
    if (nextId) {
      void syncBilingualTranscriptForVideo(nextId);
    }
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

void (async () => {
  currentSettings = await getSemiaSettings();
  await loadTranscriptForVideo(currentVideoId);
  if (currentVideoId) {
    await syncBilingualTranscriptForVideo(currentVideoId);
  }
  scheduleMetaRefresh(currentVideoId);
})();
