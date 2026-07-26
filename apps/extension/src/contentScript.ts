import type { StoredTranscript } from './types';
import {
  fetchTranscriptSegments,
  toJson3Url,
} from './youtubeTranscript';
import { getTranscript, TRANSCRIPTS_STORAGE_KEY } from './storage';
import { getVideoIdFromUrl, navigateCue } from './playerSync';
import { createCaptionOverlay } from './captionOverlay';
import { createCaptureSidebar } from './sidebarPanel';

// ------------------------------------------------------------
// Page-world bridge
// ------------------------------------------------------------

const BRIDGE_SOURCE = 'YT_TRANSCRIPT_CAPTURE_BRIDGE';
let lastCapturedVideoId: string | null = null;

type BridgeMessage = {
  source: typeof BRIDGE_SOURCE;
  type: 'TIMEDTEXT_URL';
  url: string;
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

/**
 * Send transcript to background for storage.
 */
async function sendTranscriptToBackground(
  transcript: StoredTranscript,
): Promise<void> {
  await chrome.runtime.sendMessage({ type: 'SAVE_TRANSCRIPT', transcript });
}

async function loadTranscriptForVideo(videoId: string | null): Promise<void> {
  if (!videoId) {
    syncTranscriptToUi(null);
    return;
  }
  const stored = await getTranscript(videoId);
  syncTranscriptToUi(stored);
}

async function handleInterceptedURL(timedtextUrl: string): Promise<void> {
  try {
    const urlObj = new URL(timedtextUrl);
    const videoId = urlObj.searchParams.get('v');
    const lang = urlObj.searchParams.get('lang') ?? 'unknown';
    if (!videoId) return;

    // Prevent duplicate captures for the same video.
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
    };
    await sendTranscriptToBackground(stored);
    console.debug('Transcript captured and sent to background:', stored);

    // Keep sidebar in sync if this is the active video.
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
      void handleInterceptedURL(data.url);
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

      // ←/→: previous/next cue while watching (not in capture).
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

      // Alt+Z: open panel at current cue (no focus word).
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

      // Alt+S: select focus word as start=end (view translation before Capture It!).
      if (
        ev.altKey &&
        !ev.metaKey &&
        !ev.ctrlKey &&
        ev.code === 'KeyS' &&
        sidebar.isOpen()
      ) {
        ev.preventDefault();
        ev.stopPropagation();
        sidebar.selectFocusWord();
      }
    },
    true,
  );
}

// To listen for changes to the transcripts storage.
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

/**
 * YouTube SPA navigations change the URL without a full reload.
 */
function installSpaNavigationWatcher(): void {
  let lastHref = location.href;

  const check = (): void => {
    if (location.href === lastHref) return;
    lastHref = location.href;

    const nextId = getVideoIdFromUrl();
    if (nextId === currentVideoId) return;

    currentVideoId = nextId;
    // Reset intercept dedupe so the new video can be captured.
    lastCapturedVideoId = null;
    void loadTranscriptForVideo(nextId);
  };

  window.addEventListener('yt-navigate-finish', check);
  window.addEventListener('popstate', check);

  // Fallback: poll lightly for URL changes YouTube may not announce.
  window.setInterval(check, 800);
}

// Boot
installPageWorldListener();
installKeyboardShortcut();
installStorageListener();
installSpaNavigationWatcher();
void loadTranscriptForVideo(currentVideoId);
