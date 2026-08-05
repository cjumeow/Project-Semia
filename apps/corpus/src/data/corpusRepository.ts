import {
  CORPUS_NOTES_STORAGE_KEY,
  FRAGMENTS_STORAGE_KEY,
  LANGUAGE_CARDS_STORAGE_KEY,
  SNIPPET_CHAT_PORT_NAME,
  SNIPPET_NOTES_STORAGE_KEY,
  TRANSCRIPTS_STORAGE_KEY,
  WEB_RESTORE_STATUS_STORAGE_KEY,
  type CorpusNotesMap,
  type CardIntent,
  type LanguageCard,
  type LanguageFragment,
  type SnippetNote,
  type SnippetNotesMap,
  type SnippetChatPortMessage,
  type SnippetChatPortStart,
  type SnippetChatTurn,
  type SnippetTriageStatus,
  type StoredTranscript,
  type WebRestoreStatus,
  type WebRestoreStatusMap,
  SnippetChatAbortedError,
  normalizeFragments,
  normalizeLanguageCard,
} from '@semia/shared';
import { isExtensionContext } from '../utils/extensionContext';

type OkResponse<T> = { ok: true } & T;
type ErrResponse = { ok: false; error: string };

export type CreateLanguageCardRequest = {
  fragment: LanguageFragment;
  focusText: string;
  intents: CardIntent[];
  learnerNote?: string;
  includeScenario?: boolean;
};

export type SnippetChatRequest = {
  fragment?: LanguageFragment;
  history: SnippetChatTurn[];
  userMessage: string;
};

export type SnippetChatStreamHandlers = {
  onChunk: (delta: string) => void;
  onDone: () => void;
};

export type SnippetChatStreamOptions = {
  signal?: AbortSignal;
};

export interface CorpusRepository {
  listFragments(): Promise<LanguageFragment[]>;
  listTranscripts(): Promise<StoredTranscript[]>;
  getSnippetNotes(): Promise<SnippetNotesMap>;
  generateSnippetNote(fragment: LanguageFragment): Promise<SnippetNote>;
  generateContextWindow(fragment: LanguageFragment): Promise<SnippetNote>;
  getLanguageCards(): Promise<LanguageCard[]>;
  getCardsForFragment(fragmentId: string): Promise<LanguageCard[]>;
  createLanguageCard(request: CreateLanguageCardRequest): Promise<LanguageCard>;
  sendSnippetChat(request: SnippetChatRequest): Promise<string>;
  streamSnippetChat(
    request: SnippetChatRequest,
    handlers: SnippetChatStreamHandlers,
    options?: SnippetChatStreamOptions,
  ): Promise<void>;
  openWebCapture(fragment: LanguageFragment): Promise<void>;
  deleteFragment(fragmentId: string): Promise<void>;
  deleteSource(sourceUrl: string): Promise<void>;
  setSnippetTriageStatus(
    fragmentId: string,
    status: Exclude<SnippetTriageStatus, 'pending'>,
  ): Promise<void>;
  recordStillLearning(fragmentId: string): Promise<void>;
  recordCardStillLearning(cardId: string): Promise<void>;
  markCardMasteredInReview(cardId: string): Promise<void>;
  setCardMastered(cardId: string): Promise<void>;
  getNotes(): Promise<CorpusNotesMap>;
  saveNote(fragmentId: string, markdown: string): Promise<void>;
  getWebRestoreStatus(fragmentId: string): Promise<WebRestoreStatus | undefined>;
  subscribe(listener: () => void): () => void;
  isLive(): boolean;
}

class ChromeCorpusRepository implements CorpusRepository {
  isLive(): boolean {
    return isExtensionContext();
  }

  async listFragments(): Promise<LanguageFragment[]> {
    const response = (await chrome.runtime.sendMessage({
      type: 'LIST_FRAGMENTS',
    })) as OkResponse<{ fragments: LanguageFragment[] }> | ErrResponse | undefined;

    if (response?.ok) {
      return normalizeFragments(response.fragments);
    }

    throw new Error(
      response?.error ?? 'Failed to load captures from extension.',
    );
  }

  async listTranscripts(): Promise<StoredTranscript[]> {
    const response = (await chrome.runtime.sendMessage({
      type: 'LIST_TRANSCRIPTS',
    })) as
      | OkResponse<{ transcripts: StoredTranscript[] }>
      | ErrResponse
      | undefined;

    if (response?.ok) {
      return response.transcripts ?? [];
    }

    throw new Error(
      response?.error ?? 'Failed to load YouTube transcripts.',
    );
  }

  async getSnippetNotes(): Promise<SnippetNotesMap> {
    const response = (await chrome.runtime.sendMessage({
      type: 'LIST_SNIPPET_NOTES',
    })) as OkResponse<{ notes: SnippetNotesMap }> | ErrResponse | undefined;

    if (response?.ok) {
      return response.notes ?? {};
    }

    throw new Error(response?.error ?? 'Failed to load snippet notes.');
  }

  async generateSnippetNote(fragment: LanguageFragment): Promise<SnippetNote> {
    const response = (await chrome.runtime.sendMessage({
      type: 'GENERATE_SNIPPET_NOTE',
      fragment,
    })) as OkResponse<{ note: SnippetNote }> | ErrResponse | undefined;

    if (response?.ok && response.note) {
      return response.note;
    }

    const message =
      response && !response.ok ? response.error : 'Failed to generate note.';
    throw new Error(message);
  }

  async generateContextWindow(fragment: LanguageFragment): Promise<SnippetNote> {
    const response = (await chrome.runtime.sendMessage({
      type: 'GENERATE_CONTEXT_WINDOW',
      fragment,
    })) as OkResponse<{ note: SnippetNote }> | ErrResponse | undefined;

    if (response?.ok && response.note) {
      return response.note;
    }

    const message =
      response && !response.ok
        ? response.error
        : 'Failed to generate context window.';
    throw new Error(message);
  }

  async getLanguageCards(): Promise<LanguageCard[]> {
    const response = (await chrome.runtime.sendMessage({
      type: 'LIST_LANGUAGE_CARDS',
    })) as OkResponse<{ cards: LanguageCard[] }> | ErrResponse | undefined;

    if (response?.ok) {
      return (response.cards ?? []).map((card) => normalizeLanguageCard(card));
    }

    throw new Error(response?.error ?? 'Failed to load language cards.');
  }

  async getCardsForFragment(fragmentId: string): Promise<LanguageCard[]> {
    const cards = await this.getLanguageCards();
    return cards.filter((card) => card.sourceFragmentId === fragmentId);
  }

  async createLanguageCard(
    request: CreateLanguageCardRequest,
  ): Promise<LanguageCard> {
    const response = (await chrome.runtime.sendMessage({
      type: 'CREATE_LANGUAGE_CARD',
      fragment: request.fragment,
      focusText: request.focusText,
      intents: request.intents,
      learnerNote: request.learnerNote,
      includeScenario: request.includeScenario,
    })) as OkResponse<{ card: LanguageCard }> | ErrResponse | undefined;

    if (response?.ok && response.card) {
      return normalizeLanguageCard(response.card);
    }

    const message =
      response && !response.ok
        ? response.error
        : 'Failed to create language card.';
    throw new Error(message);
  }

  async sendSnippetChat(request: SnippetChatRequest): Promise<string> {
    let reply = '';
    await this.streamSnippetChat(request, {
      onChunk: (delta) => {
        reply += delta;
      },
      onDone: () => {},
    });
    if (!reply) {
      throw new Error('AI returned an empty response.');
    }
    return reply;
  }

  async streamSnippetChat(
    request: SnippetChatRequest,
    handlers: SnippetChatStreamHandlers,
    options?: SnippetChatStreamOptions,
  ): Promise<void> {
    if (options?.signal?.aborted) {
      throw new SnippetChatAbortedError();
    }

    const port = chrome.runtime.connect({ name: SNIPPET_CHAT_PORT_NAME });

    await new Promise<void>((resolve, reject) => {
      let settled = false;

      const cleanup = () => {
        port.onMessage.removeListener(onMessage);
        port.onDisconnect.removeListener(onDisconnect);
        options?.signal?.removeEventListener('abort', onAbort);
      };

      const finishAbort = () => {
        if (settled) return;
        settled = true;
        cleanup();
        port.disconnect();
        reject(new SnippetChatAbortedError());
      };

      const onAbort = () => {
        finishAbort();
      };

      const onMessage = (message: SnippetChatPortMessage) => {
        if (message.type === 'chunk') {
          handlers.onChunk(message.delta);
          return;
        }

        if (message.type === 'done') {
          settled = true;
          cleanup();
          handlers.onDone();
          port.disconnect();
          resolve();
          return;
        }

        if (message.type === 'error') {
          settled = true;
          cleanup();
          port.disconnect();
          reject(new Error(message.error));
        }
      };

      const onDisconnect = () => {
        cleanup();
        if (settled) return;
        if (options?.signal?.aborted) {
          reject(new SnippetChatAbortedError());
          return;
        }
        const disconnectError = chrome.runtime.lastError?.message;
        reject(
          new Error(
            disconnectError ?? 'Snippet chat connection closed unexpectedly.',
          ),
        );
      };

      port.onMessage.addListener(onMessage);
      port.onDisconnect.addListener(onDisconnect);
      options?.signal?.addEventListener('abort', onAbort, { once: true });

      const startMessage: SnippetChatPortStart = {
        type: 'start',
        fragment: request.fragment,
        history: request.history,
        userMessage: request.userMessage,
      };
      port.postMessage(startMessage);
    });
  }

  async openWebCapture(fragment: LanguageFragment): Promise<void> {
    const response = (await chrome.runtime.sendMessage({
      type: 'OPEN_WEB_CAPTURE',
      fragment,
    })) as OkResponse<Record<string, never>> | ErrResponse | undefined;

    if (response?.ok) return;

    throw new Error(response?.error ?? 'Failed to open web capture.');
  }

  async deleteFragment(fragmentId: string): Promise<void> {
    const response = (await chrome.runtime.sendMessage({
      type: 'DELETE_FRAGMENT',
      fragmentId,
    })) as OkResponse<Record<string, never>> | ErrResponse | undefined;

    if (response?.ok) return;

    throw new Error(response?.error ?? 'Failed to delete snippet.');
  }

  async deleteSource(sourceUrl: string): Promise<void> {
    const response = (await chrome.runtime.sendMessage({
      type: 'DELETE_SOURCE',
      sourceUrl,
    })) as OkResponse<Record<string, never>> | ErrResponse | undefined;

    if (response?.ok) return;

    throw new Error(response?.error ?? 'Failed to delete source.');
  }

  async setSnippetTriageStatus(
    fragmentId: string,
    status: Exclude<SnippetTriageStatus, 'pending'>,
  ): Promise<void> {
    const response = (await chrome.runtime.sendMessage({
      type: 'SET_SNIPPET_TRIAGE_STATUS',
      fragmentId,
      status,
    })) as OkResponse<Record<string, never>> | ErrResponse | undefined;

    if (response?.ok) return;

    throw new Error(response?.error ?? 'Failed to update triage status.');
  }

  async recordStillLearning(fragmentId: string): Promise<void> {
    const response = (await chrome.runtime.sendMessage({
      type: 'RECORD_STILL_LEARNING',
      fragmentId,
    })) as OkResponse<Record<string, never>> | ErrResponse | undefined;

    if (response?.ok) return;

    throw new Error(response?.error ?? 'Failed to record still learning.');
  }

  async recordCardStillLearning(cardId: string): Promise<void> {
    const response = (await chrome.runtime.sendMessage({
      type: 'RECORD_CARD_STILL_LEARNING',
      cardId,
    })) as OkResponse<Record<string, never>> | ErrResponse | undefined;

    if (response?.ok) return;

    throw new Error(response?.error ?? 'Failed to record card still learning.');
  }

  async markCardMasteredInReview(cardId: string): Promise<void> {
    const response = (await chrome.runtime.sendMessage({
      type: 'MARK_CARD_MASTERED',
      cardId,
    })) as OkResponse<Record<string, never>> | ErrResponse | undefined;

    if (response?.ok) return;

    throw new Error(response?.error ?? 'Failed to mark card mastered.');
  }

  async setCardMastered(cardId: string): Promise<void> {
    const response = (await chrome.runtime.sendMessage({
      type: 'SET_CARD_MASTERED',
      cardId,
    })) as OkResponse<Record<string, never>> | ErrResponse | undefined;

    if (response?.ok) return;

    throw new Error(response?.error ?? 'Failed to mark card mastered.');
  }

  async getNotes(): Promise<CorpusNotesMap> {
    const result = await chrome.storage.local.get(CORPUS_NOTES_STORAGE_KEY);
    return (result[CORPUS_NOTES_STORAGE_KEY] ?? {}) as CorpusNotesMap;
  }

  async saveNote(fragmentId: string, markdown: string): Promise<void> {
    const response = (await chrome.runtime.sendMessage({
      type: 'SAVE_CORPUS_NOTE',
      fragmentId,
      markdown,
    })) as OkResponse<Record<string, never>> | ErrResponse | undefined;

    if (response?.ok) return;

    throw new Error(response?.error ?? 'Failed to save note.');
  }

  async getWebRestoreStatus(
    fragmentId: string,
  ): Promise<WebRestoreStatus | undefined> {
    const result = await chrome.storage.local.get(WEB_RESTORE_STATUS_STORAGE_KEY);
    const map = (result[WEB_RESTORE_STATUS_STORAGE_KEY] ??
      {}) as WebRestoreStatusMap;
    return map[fragmentId];
  }

  subscribe(listener: () => void): () => void {
    const onStorageChanged = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ): void => {
      if (areaName !== 'local') return;
      if (
        changes[FRAGMENTS_STORAGE_KEY] ||
        changes[SNIPPET_NOTES_STORAGE_KEY] ||
        changes[LANGUAGE_CARDS_STORAGE_KEY] ||
        changes[CORPUS_NOTES_STORAGE_KEY] ||
        changes[TRANSCRIPTS_STORAGE_KEY] ||
        changes[WEB_RESTORE_STATUS_STORAGE_KEY]
      ) {
        listener();
      }
    };

    chrome.storage.onChanged.addListener(onStorageChanged);

    return () => {
      chrome.storage.onChanged.removeListener(onStorageChanged);
    };
  }
}

class MockCorpusRepository implements CorpusRepository {
  private notes: CorpusNotesMap = {};

  isLive(): boolean {
    return false;
  }

  async listFragments(): Promise<LanguageFragment[]> {
    return [];
  }

  async listTranscripts(): Promise<StoredTranscript[]> {
    return [];
  }

  async getSnippetNotes(): Promise<SnippetNotesMap> {
    return {};
  }

  async generateSnippetNote(): Promise<SnippetNote> {
    throw new Error('AI generation requires the Chrome extension.');
  }

  async generateContextWindow(): Promise<SnippetNote> {
    throw new Error('AI generation requires the Chrome extension.');
  }

  async getLanguageCards(): Promise<LanguageCard[]> {
    return [];
  }

  async getCardsForFragment(): Promise<LanguageCard[]> {
    return [];
  }

  async createLanguageCard(): Promise<LanguageCard> {
    throw new Error('Language card creation requires the Chrome extension.');
  }

  async sendSnippetChat(): Promise<string> {
    throw new Error('AI chat requires the Chrome extension.');
  }

  async streamSnippetChat(): Promise<void> {
    throw new Error('AI chat requires the Chrome extension.');
  }

  async openWebCapture(fragment: LanguageFragment): Promise<void> {
    if (fragment.anchor.kind === 'web') {
      window.open(fragment.sourceUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    throw new Error('Only web captures can be opened on the original page.');
  }

  async deleteFragment(): Promise<void> {
    throw new Error('Delete requires the Chrome extension.');
  }

  async deleteSource(): Promise<void> {
    throw new Error('Delete requires the Chrome extension.');
  }

  async setSnippetTriageStatus(): Promise<void> {
    throw new Error('Triage updates require the Chrome extension.');
  }

  async recordStillLearning(): Promise<void> {
    throw new Error('Review updates require the Chrome extension.');
  }

  async recordCardStillLearning(): Promise<void> {
    throw new Error('Review updates require the Chrome extension.');
  }

  async markCardMasteredInReview(): Promise<void> {
    throw new Error('Review updates require the Chrome extension.');
  }

  async setCardMastered(): Promise<void> {
    throw new Error('Review updates require the Chrome extension.');
  }

  async getNotes(): Promise<CorpusNotesMap> {
    return { ...this.notes };
  }

  async saveNote(fragmentId: string, markdown: string): Promise<void> {
    this.notes[fragmentId] = {
      markdown,
      updatedAt: new Date().toISOString(),
    };
  }

  async getWebRestoreStatus(): Promise<WebRestoreStatus | undefined> {
    return undefined;
  }

  subscribe(): () => void {
    return () => {};
  }
}

function createRepository(): CorpusRepository {
  if (isExtensionContext()) {
    return new ChromeCorpusRepository();
  }

  if (
    typeof chrome !== 'undefined' &&
    typeof chrome.storage?.local !== 'undefined'
  ) {
    return new ChromeCorpusRepository();
  }

  return new MockCorpusRepository();
}

export const corpusRepository: CorpusRepository = createRepository();
