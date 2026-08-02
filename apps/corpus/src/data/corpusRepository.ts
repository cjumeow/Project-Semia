import {
  CORPUS_NOTES_STORAGE_KEY,
  FRAGMENTS_STORAGE_KEY,
  SNIPPET_NOTES_STORAGE_KEY,
  TRANSCRIPTS_STORAGE_KEY,
  WEB_RESTORE_STATUS_STORAGE_KEY,
  type CorpusNotesMap,
  type LanguageFragment,
  type SnippetNote,
  type SnippetNotesMap,
  type SnippetTriageStatus,
  type StoredTranscript,
  type WebRestoreStatus,
  type WebRestoreStatusMap,
  normalizeFragments,
} from '@semia/shared';
import { isExtensionContext } from '../utils/extensionContext';

type OkResponse<T> = { ok: true } & T;
type ErrResponse = { ok: false; error: string };

export interface CorpusRepository {
  listFragments(): Promise<LanguageFragment[]>;
  listTranscripts(): Promise<StoredTranscript[]>;
  getSnippetNotes(): Promise<SnippetNotesMap>;
  generateSnippetNote(fragment: LanguageFragment): Promise<SnippetNote>;
  generateContextWindow(fragment: LanguageFragment): Promise<SnippetNote>;
  openWebCapture(fragment: LanguageFragment): Promise<void>;
  deleteFragment(fragmentId: string): Promise<void>;
  deleteSource(sourceUrl: string): Promise<void>;
  setSnippetTriageStatus(
    fragmentId: string,
    status: Exclude<SnippetTriageStatus, 'pending'>,
  ): Promise<void>;
  recordStillLearning(fragmentId: string): Promise<void>;
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
