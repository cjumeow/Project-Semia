import type { SemiaSettings } from '@semia/shared';
import { SEMIA_SETTINGS_STORAGE_KEY } from '@semia/shared';
import type { StoredTranscript } from './types';
import {
  coerceTranscriptForNativeLine,
  fetchBilingualTranscript,
  shouldApplyStoredTranscript,
  transcriptMatchesSettings,
} from './bilingualTranscriptFetch';
import {
  createMtPrewarmSession,
  runMtNativePrewarm,
  setMtPrewarmPriorityCue,
  shouldPrewarmMtNativeLine,
  translateCueBatchIfMissing,
  type MtPrewarmSession,
  type MtPrewarmStatus,
} from './mtNativePrewarm';
import { mtCacheToMap, loadMtNativeCacheEntry } from './mtNativeCacheStorage';
import { getTranscript, TRANSCRIPTS_STORAGE_KEY } from './storage';
import {
  findCueIndexByTime,
  getVideoElement,
  getVideoIdFromUrl,
  navigateCue,
} from './playerSync';
import { createCaptionOverlay } from './captionOverlay';
import { createCaptureSidebar } from './sidebarPanel';
import { getSemiaSettings } from './semiaSettings';
import { createSubtitleSettingsControl } from './subtitleSettingsControl';
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

let mtTranslations = new Map<number, string>();
let mtPrewarmSession: MtPrewarmSession | null = null;

const captionOverlay = createCaptionOverlay({
  onWordClick: (ref) => sidebar.beginCaptureFromOverlay(ref),
  onActiveCueChange: (cueIndex) => {
    setMtPrewarmPriorityCue(mtPrewarmSession, cueIndex);
    void prioritizeCueTranslation(cueIndex);
  },
});

const timedtextTemplateByVideoId = new Map<string, string>();
const inflightSync = new Map<string, Promise<void>>();

let currentVideoId: string | null = getVideoIdFromUrl();
let currentTranscript: StoredTranscript | null = null;
let currentSettings: SemiaSettings | null = null;
let transcriptSyncGeneration = 0;
let mtPrewarmAbort: AbortController | null = null;
let mtPrewarmKey: string | null = null;

function replaceMtTranslations(
  source: Iterable<[number, string]>,
): void {
  mtTranslations.clear();
  for (const [index, text] of source) {
    if (text.trim()) mtTranslations.set(index, text);
  }
}

function updateMtOverlayState(status: MtPrewarmStatus): void {
  captionOverlay.setMtNativeState({
    translationsByCueIndex: mtTranslations,
    prewarmStatus: status,
  });
}

function cancelMtPrewarm(): void {
  mtPrewarmAbort?.abort();
  mtPrewarmAbort = null;
  mtPrewarmKey = null;
  mtPrewarmSession = null;
}

function getActiveCueIndex(transcript: StoredTranscript): number {
  const video = getVideoElement();
  if (!video) return 0;
  const idx = findCueIndexByTime(transcript.segments, video.currentTime);
  return idx >= 0 ? idx : 0;
}

async function prioritizeCueTranslation(cueIndex: number): Promise<void> {
  const transcript = currentTranscript;
  if (!transcript || !shouldPrewarmMtNativeLine(transcript)) return;
  if (mtTranslations.has(cueIndex)) return;

  const nativeLang = transcript.nativeLanguageCode?.trim() || 'zh-TW';
  const key = `${transcript.videoId}:${nativeLang}`;

  try {
    const updated = await translateCueBatchIfMissing({
      transcript,
      cueIndex,
      translations: mtTranslations,
      signal: mtPrewarmAbort?.signal,
    });
    if (mtPrewarmKey !== key && mtPrewarmKey !== null) return;
    if (!updated.has(cueIndex)) return;
    const fullyCached = updated.size >= transcript.segments.length;
    updateMtOverlayState(fullyCached ? 'complete' : 'loading');
  } catch (err) {
    if (mtPrewarmAbort?.signal.aborted) return;
    console.warn('[Semia] Priority cue translation failed:', err);
  }
}

async function maybeStartMtNativePrewarm(
  transcript: StoredTranscript,
): Promise<void> {
  const settings = currentSettings ?? (await getSemiaSettings());
  if (settings.bilingualCaptionsEnabled === false) {
    cancelMtPrewarm();
    replaceMtTranslations([]);
    updateMtOverlayState('idle');
    return;
  }

  if (!shouldPrewarmMtNativeLine(transcript)) {
    cancelMtPrewarm();
    replaceMtTranslations([]);
    updateMtOverlayState('idle');
    return;
  }

  const nativeLang = transcript.nativeLanguageCode?.trim() || 'zh-TW';
  const key = `${transcript.videoId}:${nativeLang}`;
  if (mtPrewarmKey === key) {
    if (mtPrewarmAbort) {
      return;
    }
    const cached = mtCacheToMap(
      await loadMtNativeCacheEntry(transcript.videoId, nativeLang),
    );
    replaceMtTranslations(cached);
    const fullyCached = mtTranslations.size >= transcript.segments.length;
    updateMtOverlayState(
      fullyCached && mtTranslations.size > 0 ? 'complete' : 'loading',
    );
    return;
  }

  cancelMtPrewarm();
  mtPrewarmKey = key;

  const cached = mtCacheToMap(
    await loadMtNativeCacheEntry(transcript.videoId, nativeLang),
  );
  replaceMtTranslations(cached);
  const fullyCached = mtTranslations.size >= transcript.segments.length;
  updateMtOverlayState(
    fullyCached && mtTranslations.size > 0 ? 'complete' : 'loading',
  );

  const controller = new AbortController();
  mtPrewarmAbort = controller;
  mtPrewarmSession = createMtPrewarmSession(getActiveCueIndex(transcript));

  void runMtNativePrewarm({
    transcript,
    translations: mtTranslations,
    session: mtPrewarmSession,
    signal: controller.signal,
    onProgress: (_translations, status) => {
      if (controller.signal.aborted) return;
      if (mtPrewarmKey !== key) return;
      updateMtOverlayState(status);
    },
  }).catch((err) => {
    if (controller.signal.aborted) return;
    console.warn('[Semia] MT prewarm failed:', err);
    updateMtOverlayState('failed');
  }).finally(() => {
    if (mtPrewarmKey === key) {
      mtPrewarmAbort = null;
    }
  });
}

async function onSemiaSettingsChange(settings: SemiaSettings): Promise<void> {
  currentSettings = settings;
  const videoId = getVideoIdFromUrl() ?? currentVideoId;
  if (!videoId) return;

  const generation = ++transcriptSyncGeneration;
  captionOverlay.setNativeLineSuppressed(true);
  cancelMtPrewarm();
  replaceMtTranslations([]);
  updateMtOverlayState('idle');
  try {
    await syncBilingualTranscriptForVideo(videoId, {
      force: true,
      syncGeneration: generation,
    });
  } finally {
    if (generation === transcriptSyncGeneration) {
      captionOverlay.setNativeLineSuppressed(false);
    }
  }
}

const subtitleSettings = createSubtitleSettingsControl({
  onSettingsChange: onSemiaSettingsChange,
});

function syncTranscriptToUi(transcript: StoredTranscript | null): void {
  const normalized = transcript
    ? coerceTranscriptForNativeLine(transcript)
    : null;
  currentTranscript = normalized;
  sidebar.setTranscript(normalized);
  const preferMt = normalized ? shouldPrewarmMtNativeLine(normalized) : false;
  captionOverlay.setSkipTlangPairing(preferMt);
  if (!normalized) {
    cancelMtPrewarm();
    replaceMtTranslations([]);
    updateMtOverlayState('idle');
  } else if (!preferMt) {
    cancelMtPrewarm();
    replaceMtTranslations([]);
    updateMtOverlayState('idle');
  }
  captionOverlay.setTranscript(normalized);
  if (normalized && preferMt) {
    void maybeStartMtNativePrewarm(normalized);
  }
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
    syncGeneration?: number;
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
      if (
        videoId === (getVideoIdFromUrl() ?? currentVideoId) &&
        (options?.syncGeneration === undefined ||
          options.syncGeneration === transcriptSyncGeneration)
      ) {
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

    if (
      videoId === (getVideoIdFromUrl() ?? currentVideoId) &&
      (options?.syncGeneration === undefined ||
        options.syncGeneration === transcriptSyncGeneration)
    ) {
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
        currentSettings = merged;
        subtitleSettings.setSettings(merged);
        await onSemiaSettingsChange(merged);
      })();
    }

    const change = changes[TRANSCRIPTS_STORAGE_KEY];
    if (!change) return;

    const videoId = getVideoIdFromUrl() ?? currentVideoId;
    if (!videoId) return;

    const map = (change.newValue ?? {}) as Record<string, StoredTranscript>;
    const transcript = map[videoId] ?? null;
    if (!shouldApplyStoredTranscript(transcript, currentSettings)) {
      return;
    }
    syncTranscriptToUi(transcript);
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
