import { translateGtxText } from './translateGtx';

/**
 * GTX preserves newlines but strips `\u001e`. Learning cues are normalized to
 * single-line on fetch, so `\n` is a safe batch delimiter.
 */
export const CUE_BATCH_SEPARATOR = '\n';

export const DEFAULT_CUE_BATCH_SIZE = 10;

export function joinCueBatch(cueTexts: string[]): string {
  return cueTexts.join(CUE_BATCH_SEPARATOR);
}

export function splitCueBatch(
  translated: string,
  expectedCount: number,
): string[] {
  if (expectedCount <= 0) return [];
  const parts = translated.split(CUE_BATCH_SEPARATOR);
  const result: string[] = [];
  for (let i = 0; i < expectedCount; i++) {
    result.push((parts[i] ?? '').trim());
  }
  return result;
}

function countNonEmptyParts(parts: string[]): number {
  return parts.filter((part) => part.trim()).length;
}

/** False when GTX merged the batch into one blob (separator lost). */
export function isBatchSplitHealthy(
  translated: string,
  expectedCount: number,
): boolean {
  if (expectedCount <= 1) return true;
  const parts = translated.split(CUE_BATCH_SEPARATOR);
  const nonEmpty = countNonEmptyParts(parts);
  if (parts.length === 1 && expectedCount > 1) return false;
  const minHealthy = Math.max(1, Math.ceil(expectedCount * 0.8));
  return nonEmpty >= minHealthy;
}

async function translateCueBatchIndividually(options: {
  cueTexts: string[];
  sourceLang: string;
  targetLang: string;
  signal?: AbortSignal;
}): Promise<string[]> {
  const { cueTexts, sourceLang, targetLang, signal } = options;
  return Promise.all(
    cueTexts.map((text) =>
      translateGtxText({ text, sourceLang, targetLang, signal }),
    ),
  );
}

export async function translateCueBatch(options: {
  cueTexts: string[];
  sourceLang: string;
  targetLang: string;
  signal?: AbortSignal;
}): Promise<string[]> {
  const { cueTexts, sourceLang, targetLang, signal } = options;
  if (!cueTexts.length) return [];

  if (cueTexts.length === 1) {
    const text = await translateGtxText({
      text: cueTexts[0]!,
      sourceLang,
      targetLang,
      signal,
    });
    return [text];
  }

  const translated = await translateGtxText({
    text: joinCueBatch(cueTexts),
    sourceLang,
    targetLang,
    signal,
  });

  if (!isBatchSplitHealthy(translated, cueTexts.length)) {
    return translateCueBatchIndividually({
      cueTexts,
      sourceLang,
      targetLang,
      signal,
    });
  }

  return splitCueBatch(translated, cueTexts.length);
}
