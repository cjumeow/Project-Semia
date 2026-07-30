import { generateContextWindow } from './ai/generateContextWindow';
import { generateSnippetNote } from './ai/generateSnippetNote';
import { deleteFragment, deleteSource } from './deleteCaptures';
import { ensureSnippetNote } from './ensureSnippetNote';
import { listFragments, normalizeFragments } from './fragmentsStorage';
import { openSemiaPage } from './openSemia';
import { getSnippetNote, getSnippetNotes, saveSnippetNote } from './snippetNotesStorage';
import type { BackgroundMessage } from './types';
import { saveTranscript, saveTranscriptError } from './storage';
import {
  openWebCapture,
  takePendingWebRestore,
} from './pendingWebRestore';
import { FRAGMENTS_STORAGE_KEY, SNIPPET_NOTES_STORAGE_KEY } from '@semia/shared';

chrome.action.onClicked.addListener(() => {
  openSemiaPage();
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
chrome.runtime.onMessage.addListener((message: BackgroundMessage, sender, sendResponse) => {
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

    if (message.type === 'OPEN_WEB_CAPTURE') {
      await openWebCapture(message.fragment);
      sendResponse({ ok: true });
      return;
    }

    if (message.type === 'DELETE_FRAGMENT') {
      await deleteFragment(message.fragmentId);
      sendResponse({ ok: true });
      return;
    }

    if (message.type === 'DELETE_SOURCE') {
      await deleteSource(message.sourceUrl);
      sendResponse({ ok: true });
      return;
    }

    if (message.type === 'TAKE_PENDING_WEB_RESTORE') {
      const tabId = sender.tab?.id;
      if (!tabId) {
        sendResponse({ ok: true, payload: null });
        return;
      }
      sendResponse({ ok: true, payload: takePendingWebRestore(tabId) });
      return;
    }

    sendResponse({ ok: false, error: 'Unknown message type' });
  })().catch((err) => {
    sendResponse({ ok: false, error: String(err?.message ?? err) });
  });

  // Keep the message channel open for async sendResponse.
  return true;
});
