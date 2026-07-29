import {
  CORPUS_NOTES_STORAGE_KEY,
  FRAGMENTS_STORAGE_KEY,
  SNIPPET_NOTES_STORAGE_KEY,
  type CorpusNotesMap,
  type LanguageFragment,
  type SnippetNote,
  type SnippetNotesMap,
  normalizeFragments,
} from '@semia/shared';
import { isExtensionContext } from '../utils/extensionContext';

type OkResponse<T> = { ok: true } & T;
type ErrResponse = { ok: false; error: string };

export interface CorpusRepository {
  listFragments(): Promise<LanguageFragment[]>;
  getSnippetNotes(): Promise<SnippetNotesMap>;
  generateSnippetNote(fragment: LanguageFragment): Promise<SnippetNote>;
  generateContextWindow(fragment: LanguageFragment): Promise<SnippetNote>;
  getNotes(): Promise<CorpusNotesMap>;
  saveNote(fragmentId: string, markdown: string): Promise<void>;
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

  async getNotes(): Promise<CorpusNotesMap> {
    const result = await chrome.storage.local.get(CORPUS_NOTES_STORAGE_KEY);
    return (result[CORPUS_NOTES_STORAGE_KEY] ?? {}) as CorpusNotesMap;
  }

  async saveNote(fragmentId: string, markdown: string): Promise<void> {
    const notes = await this.getNotes();
    notes[fragmentId] = {
      markdown,
      updatedAt: new Date().toISOString(),
    };
    await chrome.storage.local.set({
      [CORPUS_NOTES_STORAGE_KEY]: notes,
    });
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
        changes[CORPUS_NOTES_STORAGE_KEY]
      ) {
        listener();
      }
    };

    const onRuntimeMessage = (message: unknown): void => {
      if (
        message &&
        typeof message === 'object' &&
        'type' in message &&
        message.type === 'FRAGMENTS_CHANGED'
      ) {
        listener();
      }
    };

    chrome.storage.onChanged.addListener(onStorageChanged);
    chrome.runtime.onMessage.addListener(onRuntimeMessage);

    return () => {
      chrome.storage.onChanged.removeListener(onStorageChanged);
      chrome.runtime.onMessage.removeListener(onRuntimeMessage);
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

  async getSnippetNotes(): Promise<SnippetNotesMap> {
    return {};
  }

  async generateSnippetNote(): Promise<SnippetNote> {
    throw new Error('AI generation requires the Chrome extension.');
  }

  async generateContextWindow(): Promise<SnippetNote> {
    throw new Error('AI generation requires the Chrome extension.');
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
