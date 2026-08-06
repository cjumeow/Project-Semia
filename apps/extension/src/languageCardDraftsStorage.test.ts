import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LANGUAGE_CARD_DRAFTS_STORAGE_KEY,
  createEmptyLanguageCardDraft,
} from '@semia/shared';
import {
  clearLanguageCardDraft,
  deleteLanguageCardDrafts,
  loadLanguageCardDraft,
  saveLanguageCardDraft,
} from './languageCardDraftsStorage';

function createChromeStorageMock() {
  const store = new Map<string, unknown>();

  return {
    store,
    chrome: {
      storage: {
        local: {
          get: vi.fn(async (key: string) => ({
            [key]: store.get(key),
          })),
          set: vi.fn(async (value: Record<string, unknown>) => {
            for (const [key, entry] of Object.entries(value)) {
              store.set(key, entry);
            }
          }),
        },
      },
    },
  };
}

describe('languageCardDraftsStorage', () => {
  let mock: ReturnType<typeof createChromeStorageMock>;

  beforeEach(() => {
    mock = createChromeStorageMock();
    vi.stubGlobal('chrome', mock.chrome);
  });

  it('round-trips a draft for one capture', async () => {
    const draft = {
      ...createEmptyLanguageCardDraft('frag-1', '2026-01-01T00:00:00.000Z'),
      focusText: 'categorized',
      meaning: '分類的',
    };

    await saveLanguageCardDraft(draft);
    const loaded = await loadLanguageCardDraft('frag-1');

    expect(loaded).toEqual(draft);
  });

  it('overwrites the existing draft for the same capture id', async () => {
    await saveLanguageCardDraft({
      ...createEmptyLanguageCardDraft('frag-1', '2026-01-01T00:00:00.000Z'),
      focusText: 'old',
    });
    await saveLanguageCardDraft({
      ...createEmptyLanguageCardDraft('frag-1', '2026-01-02T00:00:00.000Z'),
      focusText: 'new',
    });

    const map = mock.store.get(LANGUAGE_CARD_DRAFTS_STORAGE_KEY) as Record<
      string,
      unknown
    >;
    expect(Object.keys(map)).toEqual(['frag-1']);
    expect(await loadLanguageCardDraft('frag-1')).toMatchObject({
      focusText: 'new',
    });
  });

  it('clears a draft without touching other captures', async () => {
    await saveLanguageCardDraft(
      createEmptyLanguageCardDraft('frag-1', '2026-01-01T00:00:00.000Z'),
    );
    await saveLanguageCardDraft(
      createEmptyLanguageCardDraft('frag-2', '2026-01-01T00:00:00.000Z'),
    );

    await clearLanguageCardDraft('frag-1');

    expect(await loadLanguageCardDraft('frag-1')).toBeNull();
    expect(await loadLanguageCardDraft('frag-2')).not.toBeNull();
  });

  it('deletes drafts when captures are purged', async () => {
    await saveLanguageCardDraft(
      createEmptyLanguageCardDraft('frag-1', '2026-01-01T00:00:00.000Z'),
    );
    await saveLanguageCardDraft(
      createEmptyLanguageCardDraft('frag-2', '2026-01-01T00:00:00.000Z'),
    );

    await deleteLanguageCardDrafts(['frag-1']);

    expect(await loadLanguageCardDraft('frag-1')).toBeNull();
    expect(await loadLanguageCardDraft('frag-2')).not.toBeNull();
  });
});
