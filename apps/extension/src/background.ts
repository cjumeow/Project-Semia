import type { BackgroundMessage } from './types';
import { saveTranscript, saveTranscriptError } from './storage';

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

    sendResponse({ ok: false, error: 'Unknown message type' });
  })().catch((err) => {
    sendResponse({ ok: false, error: String(err?.message ?? err) });
  });
  
  // Keep the message channel open for async sendResponse.
  return true;
});
