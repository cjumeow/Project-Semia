import { openSemiaPage } from '../openSemia';
import { takePendingWebRestore } from '../pendingWebRestore';
import type { BackgroundMessage } from '../types';
import { setWebRestoreStatus } from '../webRestoreStatusStorage';
import {
  handleFragmentMessage,
  isFragmentMessage,
} from './fragmentPipeline';
import {
  handleTranscriptMessage,
  isTranscriptMessage,
} from './transcriptPipeline';

export async function handleBackgroundMessage(
  message: BackgroundMessage,
  sender: chrome.runtime.MessageSender,
): Promise<Record<string, unknown>> {
  if (message.type === 'OPEN_SEMIA') {
    openSemiaPage();
    return { ok: true };
  }

  if (message.type === 'WEB_RESTORE_RESULT') {
    await setWebRestoreStatus(
      message.fragmentId,
      message.ok ? 'ok' : 'failed',
    );
    return { ok: true };
  }

  if (message.type === 'TAKE_PENDING_WEB_RESTORE') {
    const tabId = sender.tab?.id;
    if (!tabId) {
      return { ok: true, payload: null };
    }
    return { ok: true, payload: takePendingWebRestore(tabId) };
  }

  if (isFragmentMessage(message)) {
    return handleFragmentMessage(message);
  }

  if (isTranscriptMessage(message)) {
    return handleTranscriptMessage(message);
  }

  return { ok: false, error: 'Unknown message type' };
}
