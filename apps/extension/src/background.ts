import { generateContextWindow } from './ai/generateContextWindow';
import { generateSnippetNote } from './ai/generateSnippetNote';
import { ensureSnippetNote } from './ensureSnippetNote';
import { listFragments, normalizeFragments } from './fragmentsStorage';
import { openSemiaPage } from './openSemia';
import {
  ensureWebCaptureForTab,
  ensureWebCaptureForUrl,
  requestWebCapturePermission,
} from './webCaptureInjection';
import { getSnippetNote, getSnippetNotes, saveSnippetNote } from './snippetNotesStorage';
import type { BackgroundMessage } from './types';
import { saveTranscript, saveTranscriptError } from './storage';
import { FRAGMENTS_STORAGE_KEY, SNIPPET_NOTES_STORAGE_KEY } from '@semia/shared';

chrome.action.onClicked.addListener((tab) => {
  if (tab.id && tab.url) {
    void (async () => {
      const ready = await ensureWebCaptureForUrl(tab.url!);
      if (!ready) {
        await requestWebCapturePermission(tab.url!);
      }
      if (tab.id) {
        await ensureWebCaptureForTab(tab.id, tab.url!);
      }
    })();
  }
  openSemiaPage();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;
  void ensureWebCaptureForTab(tabId, tab.url);
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;

  if (changes[FRAGMENTS_STORAGE_KEY]) {
    void queueNotesForNewFragments(
      changes[FRAGMENTS_STORAGE_KEY].oldValue,
      changes[FRAGMENTS_STORAGE_KEY].newValue,
    );
  }

  if (changes[FRAGMENTS_STORAGE_KEY] || changes[SNIPPET_NOTES_STORAGE_KEY]) {
    void chrome.runtime
      .sendMessage({ type: 'FRAGMENTS_CHANGED' })
      .catch(() => {});
  }
});

async function queueNotesForNewFragments(
  oldValue: unknown,
  newValue: unknown,
): Promise<void> {
  const oldIds = new Set(normalizeFragments(oldValue).map((fragment) => fragment.id));
  const added = normalizeFragments(newValue).filter(
    (fragment) => !oldIds.has(fragment.id),
  );

  for (const fragment of added) {
    void ensureSnippetNote(fragment).catch((err) => {
      console.error(
        `[Semia] Failed to auto-generate note for ${fragment.id}:`,
        err,
      );
    });
  }
}

// Service worker entry.
chrome.runtime.onMessage.addListener((message: BackgroundMessage, _sender, sendResponse) => {
  (async () => {
    if (message.type === 'SAVE_TRANSCRIPT') {
      await saveTranscript(message.transcript);
      sendResponse({ ok: true });
      return;
    }

    if (message.type === 'SAVE_TRANSCRIPT_ERROR') {
      await saveTranscriptError(message.error);
      sendResponse({ ok: true });
      return;
    }

    if (message.type === 'OPEN_SEMIA') {
      openSemiaPage();
      sendResponse({ ok: true });
      return;
    }

    if (message.type === 'LIST_FRAGMENTS') {
      const fragments = await listFragments();
      sendResponse({ ok: true, fragments });
      return;
    }

    if (message.type === 'LIST_SNIPPET_NOTES') {
      const notes = await getSnippetNotes();
      sendResponse({ ok: true, notes });
      return;
    }

    if (message.type === 'GENERATE_SNIPPET_NOTE') {
      const note = await generateSnippetNote(message.fragment);
      await saveSnippetNote(message.fragment.id, note);
      sendResponse({ ok: true, note });
      return;
    }

    if (message.type === 'GENERATE_CONTEXT_WINDOW') {
      const existing = await getSnippetNote(message.fragment.id);
      if (!existing?.generatedAt) {
        sendResponse({
          ok: false,
          error: 'Generate the snippet note before building a context window.',
        });
        return;
      }

      const dynamicContextBlock = await generateContextWindow(message.fragment);
      const note = { ...existing, dynamicContextBlock };
      await saveSnippetNote(message.fragment.id, note);
      sendResponse({ ok: true, note });
      return;
    }

    sendResponse({ ok: false, error: 'Unknown message type' });
  })().catch((err) => {
    sendResponse({ ok: false, error: String(err?.message ?? err) });
  });

  // Keep the message channel open for async sendResponse.
  return true;
});
