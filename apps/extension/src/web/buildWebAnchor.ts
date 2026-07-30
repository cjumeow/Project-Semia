import type { WebAnchor } from '@semia/shared';
import type { FlatText } from './flattenText';

const QUOTE_RADIUS = 32;

function quotePart(text: string, fromEnd: boolean): string | undefined {
  const normalized = text.replace(/\s+/g, ' ');
  if (!normalized.trim()) return undefined;
  const slice = fromEnd
    ? normalized.slice(-QUOTE_RADIUS)
    : normalized.slice(0, QUOTE_RADIUS);
  return slice.trim() || undefined;
}

/** Build a web anchor from a located selection inside flattened article text. */
export function buildWebAnchor(
  flat: FlatText,
  selectedText: string,
  offsets: { start: number; end: number } | null,
): WebAnchor {
  if (!offsets) {
    return {
      kind: 'web',
      textQuote: { exact: selectedText },
      textPosition: { start: 0, end: selectedText.length },
    };
  }

  const { start, end } = offsets;

  return {
    kind: 'web',
    textQuote: {
      exact: selectedText,
      prefix: quotePart(flat.text.slice(Math.max(0, start - QUOTE_RADIUS), start), true),
      suffix: quotePart(
        flat.text.slice(end, Math.min(flat.text.length, end + QUOTE_RADIUS)),
        false,
      ),
    },
    textPosition: { start, end },
  };
}
