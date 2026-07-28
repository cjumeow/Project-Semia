import {
  CORPUS_NOTES_STORAGE_KEY,
  FRAGMENTS_STORAGE_KEY,
  type CorpusNotesMap,
  type LanguageFragment,
} from '@semia/shared';

export interface CorpusRepository {
  listFragments(): Promise<LanguageFragment[]>;
  getNotes(): Promise<CorpusNotesMap>;
  saveNote(fragmentId: string, markdown: string): Promise<void>;
  subscribe(listener: () => void): () => void;
}

class ChromeCorpusRepository implements CorpusRepository {
  async listFragments(): Promise<LanguageFragment[]> {
    const result = await chrome.storage.local.get(FRAGMENTS_STORAGE_KEY);
    return (result[FRAGMENTS_STORAGE_KEY] ?? []) as LanguageFragment[];
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
    const onChanged = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ): void => {
      if (areaName !== 'local') return;
      if (
        changes[FRAGMENTS_STORAGE_KEY] ||
        changes[CORPUS_NOTES_STORAGE_KEY]
      ) {
        listener();
      }
    };

    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  }
}

class MockCorpusRepository implements CorpusRepository {
  private notes: CorpusNotesMap = {};

  async listFragments(): Promise<LanguageFragment[]> {
    return [];
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

function hasChromeStorage(): boolean {
  return (
    typeof chrome !== 'undefined' &&
    typeof chrome.storage?.local !== 'undefined'
  );
}

export const corpusRepository: CorpusRepository = hasChromeStorage()
  ? new ChromeCorpusRepository()
  : new MockCorpusRepository();
