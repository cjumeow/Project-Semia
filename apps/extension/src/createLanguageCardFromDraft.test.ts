import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createEmptyLanguageCardDraftContent,
  enrollCardInReviewQueue,
  LANGUAGE_CARDS_STORAGE_KEY,
  MAX_LANGUAGE_CARDS_PER_FRAGMENT,
} from '@semia/shared';
import { createLanguageCardFromDraft } from './createLanguageCardFromDraft';
import { getLanguageCardsMap } from './languageCardsStorage';

const webAnchor = {
  kind: 'web' as const,
  textQuote: { exact: 'vessels' },
  textPosition: { start: 0, end: 7 },
  locateQuality: 'precise' as const,
};

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

describe('createLanguageCardFromDraft', () => {
  let mock: ReturnType<typeof createChromeStorageMock>;

  beforeEach(() => {
    mock = createChromeStorageMock();
    vi.stubGlobal('chrome', mock.chrome);
  });

  it('promotes a valid draft into a formal card and clears the draft', async () => {
    const fragment = {
      id: 'frag-1',
      selectedText: 'vessels',
      contextText: 'context',
      languageCode: 'en',
      sourceUrl: 'https://example.com',
      sourceTitle: 'Example',
      capturedAt: '2026-01-01T00:00:00.000Z',
      anchor: webAnchor,
    };

    const card = await createLanguageCardFromDraft({
      fragment,
      draft: {
        ...createEmptyLanguageCardDraftContent(),
        focusText: 'vessels',
        meaning: '船只',
      },
    });

    expect(card.focusText).toBe('vessels');
    expect(card.meaning).toBe('船只');
    expect(card.triageStatus).toBe('review');

    const map = await getLanguageCardsMap();
    expect(Object.keys(map)).toEqual([card.id]);
  });

  it('rejects incomplete drafts', async () => {
    await expect(
      createLanguageCardFromDraft({
        fragment: {
          id: 'frag-1',
          selectedText: 'vessels',
          contextText: 'context',
          languageCode: 'en',
          sourceUrl: 'https://example.com',
          sourceTitle: 'Example',
          capturedAt: '2026-01-01T00:00:00.000Z',
          anchor: webAnchor,
        },
        draft: createEmptyLanguageCardDraftContent(),
      }),
    ).rejects.toThrow(/incomplete/i);
  });

  it('enforces the per-capture formal card cap', async () => {
    const fragment = {
      id: 'frag-cap',
      selectedText: 'word',
      contextText: 'context',
      languageCode: 'en',
      sourceUrl: 'https://example.com',
      sourceTitle: 'Example',
      capturedAt: '2026-01-01T00:00:00.000Z',
      anchor: webAnchor,
    };

    const now = '2026-01-01T00:00:00.000Z';
    const cards = Object.fromEntries(
      Array.from({ length: MAX_LANGUAGE_CARDS_PER_FRAGMENT }, (_, index) => {
        const card = enrollCardInReviewQueue(
          {
            id: `card-${index}`,
            sourceFragmentId: fragment.id,
            focusText: `focus-${index}`,
            focus: `focus-${index}`,
            meaning: '意思',
            intents: ['speaking'],
            examples: [],
            createdAt: now,
            generatedAt: now,
          },
          now,
        );
        return [card.id, card];
      }),
    );

    await mock.chrome.storage.local.set({
      [LANGUAGE_CARDS_STORAGE_KEY]: cards,
    });

    await expect(
      createLanguageCardFromDraft({
        fragment,
        draft: {
          ...createEmptyLanguageCardDraftContent(),
          focusText: 'another',
          meaning: '另一個',
        },
      }),
    ).rejects.toThrow(/already has/i);
  });
});
