import { MT_NATIVE_CACHE_STORAGE_KEY } from '@semia/shared';

export type MtNativeCacheEntry = {
  videoId: string;
  nativeLanguageCode: string;
  /** cueIndex (string) → translated text */
  translations: Record<string, string>;
  updatedAt: string;
};

type MtNativeCacheMap = Record<string, MtNativeCacheEntry>;

export function mtNativeCacheKey(
  videoId: string,
  nativeLanguageCode: string,
): string {
  return `${videoId}:${nativeLanguageCode}`;
}

export async function loadMtNativeCacheEntry(
  videoId: string,
  nativeLanguageCode: string,
): Promise<MtNativeCacheEntry | null> {
  const key = mtNativeCacheKey(videoId, nativeLanguageCode);
  const map = (await chrome.storage.local.get(MT_NATIVE_CACHE_STORAGE_KEY))[
    MT_NATIVE_CACHE_STORAGE_KEY
  ] as MtNativeCacheMap | undefined;
  return map?.[key] ?? null;
}

export async function saveMtNativeCacheEntry(
  entry: MtNativeCacheEntry,
): Promise<void> {
  const key = mtNativeCacheKey(entry.videoId, entry.nativeLanguageCode);
  const map = ((await chrome.storage.local.get(MT_NATIVE_CACHE_STORAGE_KEY))[
    MT_NATIVE_CACHE_STORAGE_KEY
  ] ?? {}) as MtNativeCacheMap;
  map[key] = entry;
  await chrome.storage.local.set({ [MT_NATIVE_CACHE_STORAGE_KEY]: map });
}

export function mtCacheToMap(
  entry: MtNativeCacheEntry | null,
): Map<number, string> {
  const map = new Map<number, string>();
  if (!entry) return map;
  for (const [index, text] of Object.entries(entry.translations)) {
    const n = Number(index);
    if (Number.isFinite(n) && text.trim()) {
      map.set(n, text);
    }
  }
  return map;
}

export function mapToMtCacheTranslations(
  translations: Map<number, string>,
): Record<string, string> {
  const record: Record<string, string> = {};
  for (const [index, text] of translations) {
    if (text.trim()) record[String(index)] = text;
  }
  return record;
}
