import type { SnippetChatPortMessage, SnippetChatPortStart } from '@semia/shared';
import { SNIPPET_CHAT_PORT_NAME } from '@semia/shared';
import { streamSnippetChat } from '../ai/sendSnippetChat';
import { formatStorageError } from '../storageError';

function postPortMessage(
  port: chrome.runtime.Port,
  message: SnippetChatPortMessage,
): void {
  try {
    port.postMessage(message);
  } catch {
    // Port may already be disconnected.
  }
}

export function handleSnippetChatPortConnection(port: chrome.runtime.Port): void {
  if (port.name !== SNIPPET_CHAT_PORT_NAME) {
    return;
  }

  const abortController = new AbortController();

  port.onDisconnect.addListener(() => {
    abortController.abort();
  });

  port.onMessage.addListener((message: SnippetChatPortStart) => {
    if (message?.type !== 'start') {
      postPortMessage(port, {
        type: 'error',
        error: 'Expected a snippet chat start message.',
      });
      return;
    }

    void streamSnippetChat(
      {
        fragment: message.fragment,
        history: message.history,
        userMessage: message.userMessage,
      },
      (delta) => {
        postPortMessage(port, { type: 'chunk', delta });
      },
      abortController.signal,
    )
      .then(() => {
        postPortMessage(port, { type: 'done' });
      })
      .catch((err) => {
        if (abortController.signal.aborted) {
          return;
        }
        postPortMessage(port, {
          type: 'error',
          error: formatStorageError(err),
        });
      });
  });
}
