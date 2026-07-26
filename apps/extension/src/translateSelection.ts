const cache = new Map<string, string>();

/**
 * Translate selection text to Traditional Chinese (low-latency, cache-first).
 */
export async function translateSelectionText(
  text: string,
  signal?: AbortSignal,
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return '';

  const cached = cache.get(trimmed);
  if (cached) return cached;

  const url =
    'https://translate.googleapis.com/translate_a/single' +
    `?client=gtx&sl=auto&tl=zh-TW&dt=t&q=${encodeURIComponent(trimmed)}`;

  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`Translation failed (${res.status})`);
  }

  const data = (await res.json()) as unknown;
  const translated = parseGoogleTranslateResponse(data);
  cache.set(trimmed, translated);
  return translated;
}

function parseGoogleTranslateResponse(data: unknown): string {
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error('Unexpected translation response');
  }
  return data[0]
    .map((part) => (Array.isArray(part) ? String(part[0] ?? '') : ''))
    .join('');
}
