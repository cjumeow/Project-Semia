import {
  LANGUAGE_CARD_DRAFTS_STORAGE_KEY,
  clearLanguageCardDraftFromMap,
  deleteLanguageCardDraftsFromMap,
  getLanguageCardDraft,
  normalizeLanguageCardDraft,
  upsertLanguageCardDraft,
  type LanguageCardDraft,
  type LanguageCardDraftsMap,
} from '@semia/shared';

export async function getLanguageCardDraftsMap(): Promise<LanguageCardDraftsMap> {
  const result = await chrome.storage.local.get(LANGUAGE_CARD_DRAFTS_STORAGE_KEY);
  return (result[LANGUAGE_CARD_DRAFTS_STORAGE_KEY] ?? {}) as LanguageCardDraftsMap;
}

export async function loadLanguageCardDraft(
  sourceFragmentId: string,
): Promise<LanguageCardDraft | null> {
  const map = await getLanguageCardDraftsMap();
  return getLanguageCardDraft(map, sourceFragmentId) ?? null;
}

export async function saveLanguageCardDraft(draft: LanguageCardDraft): Promise<void> {
  const map = await getLanguageCardDraftsMap();
  const next = upsertLanguageCardDraft(map, draft);
  await chrome.storage.local.set({
    [LANGUAGE_CARD_DRAFTS_STORAGE_KEY]: next,
  });
}

export async function clearLanguageCardDraft(
  sourceFragmentId: string,
): Promise<void> {
  const map = await getLanguageCardDraftsMap();
  const next = clearLanguageCardDraftFromMap(map, sourceFragmentId);
  if (next === map) return;

  await chrome.storage.local.set({
    [LANGUAGE_CARD_DRAFTS_STORAGE_KEY]: next,
  });
}

export async function deleteLanguageCardDrafts(
  sourceFragmentIds: string[],
): Promise<void> {
  const map = await getLanguageCardDraftsMap();
  const next = deleteLanguageCardDraftsFromMap(map, sourceFragmentIds);
  if (next === map) return;

  await chrome.storage.local.set({
    [LANGUAGE_CARD_DRAFTS_STORAGE_KEY]: next,
  });
}

export function normalizeLanguageCardDraftsMap(
  value: unknown,
): LanguageCardDraftsMap {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const map: LanguageCardDraftsMap = {};
  for (const [fragmentId, draftValue] of Object.entries(value)) {
    const normalized = normalizeLanguageCardDraft(draftValue, fragmentId);
    if (normalized) {
      map[fragmentId] = normalized;
    }
  }
  return map;
}
