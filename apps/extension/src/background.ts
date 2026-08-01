import { handleBackgroundMessage } from './background/messageRouter';
import {
  onFragmentsStorageChanged,
} from './background/fragmentPipeline';
import {
  bootstrapTranscriptPipeline,
  onTranscriptsStorageChanged,
} from './background/transcriptPipeline';
import { openSemiaPage } from './openSemia';
import { formatStorageError } from './storageError';
import type { BackgroundMessage } from './types';
import {
  FRAGMENTS_STORAGE_KEY,
  TRANSCRIPTS_STORAGE_KEY,
} from '@semia/shared';

chrome.action.onClicked.addListener(() => {
  openSemiaPage();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;

  if (changes[FRAGMENTS_STORAGE_KEY]) {
    onFragmentsStorageChanged(
      changes[FRAGMENTS_STORAGE_KEY].oldValue,
      changes[FRAGMENTS_STORAGE_KEY].newValue,
    );
  }

  if (changes[TRANSCRIPTS_STORAGE_KEY]) {
    onTranscriptsStorageChanged();
  }
});

bootstrapTranscriptPipeline();

chrome.runtime.onMessage.addListener(
  (message: BackgroundMessage, sender, sendResponse) => {
    handleBackgroundMessage(message, sender)
      .then(sendResponse)
      .catch((err) => {
        sendResponse({ ok: false, error: formatStorageError(err) });
      });

    return true;
  },
);
