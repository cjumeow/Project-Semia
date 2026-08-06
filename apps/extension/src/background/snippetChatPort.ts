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

  let activeAbort: AbortController | null = null;

  const abortActiveStream = () => {
    activeAbort?.abort();
    activeAbort = null;
  };

  port.onDisconnect.addListener(() => {
    abortActiveStream();
  });

  port.onMessage.addListener((message: SnippetChatPortStart) => {
    if (message?.type !== 'start') {
      postPortMessage(port, {
        type: 'error',
        error: 'Expected a snippet chat start message.',
      });
      return;
    }

    abortActiveStream();
    const abortController = new AbortController();
    activeAbort = abortController;

    void streamSnippetChat(
      {
        fragment: message.fragment,
        history: message.history,
        userMessage: message.userMessage,
        globalThread: message.globalThread,
      },
      (delta) => {
        postPortMessage(port, { type: 'chunk', delta });
      },
      abortController.signal,
    )
      .then(() => {
        if (abortController.signal.aborted) {
          return;
        }
        activeAbort = null;
        postPortMessage(port, { type: 'done' });
      })
      .catch((err) => {
        if (abortController.signal.aborted) {
          return;
        }
        activeAbort = null;
        postPortMessage(port, {
          type: 'error',
          error: formatStorageError(err),
        });
      });
  });
}
