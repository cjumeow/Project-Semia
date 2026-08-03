const memoryCache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

export function parseGtxTranslateResponse(data: unknown): string {
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error('Unexpected translation response');
  }
  return data[0]
    .map((part) => (Array.isArray(part) ? String(part[0] ?? '') : ''))
    .join('');
}

export function gtxTranslateCacheKey(
  text: string,
  sourceLang: string,
  targetLang: string,
): string {
  return `${sourceLang}\0${targetLang}\0${text}`;
}

function buildGtxUrl(
  text: string,
  sourceLang: string,
  targetLang: string,
): string {
  return (
    'https://translate.googleapis.com/translate_a/single' +
    `?client=gtx&sl=${encodeURIComponent(sourceLang)}` +
    `&tl=${encodeURIComponent(targetLang)}` +
    '&dt=t' +
    `&q=${encodeURIComponent(text)}`
  );
}

export type TranslateGtxOptions = {
  text: string;
  sourceLang?: string;
  targetLang: string;
  signal?: AbortSignal;
};

/** Low-latency GTX translate with memory cache and in-flight dedup. */
export async function translateGtxText(
  options: TranslateGtxOptions,
): Promise<string> {
  const trimmed = options.text.trim();
  if (!trimmed) return '';

  const sourceLang = options.sourceLang?.trim() || 'auto';
  const targetLang = options.targetLang.trim();
  const cacheKey = gtxTranslateCacheKey(trimmed, sourceLang, targetLang);

  const cached = memoryCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const pending = inflight.get(cacheKey);
  if (pending) return pending;

  const promise = (async () => {
    const res = await fetch(buildGtxUrl(trimmed, sourceLang, targetLang), {
      signal: options.signal,
    });
    if (res.status === 429) {
      throw new Error('Translation rate limited (429)');
    }
    if (!res.ok) {
      throw new Error(`Translation failed (${res.status})`);
    }
    const data = (await res.json()) as unknown;
    const translated = parseGtxTranslateResponse(data);
    memoryCache.set(cacheKey, translated);
    return translated;
  })().finally(() => {
    inflight.delete(cacheKey);
  });

  inflight.set(cacheKey, promise);
  return promise;
}

/** @internal test helper */
export function clearGtxTranslateCacheForTests(): void {
  memoryCache.clear();
  inflight.clear();
}
