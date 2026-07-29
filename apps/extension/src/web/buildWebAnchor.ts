import type { WebAnchor } from '@semia/shared';
import type { FlatText } from './flattenText';
import { rangeToFlatOffsets } from './flattenText';

const QUOTE_RADIUS = 32;

function pickQuotePart(text: string, fromEnd: boolean): string | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  const slice = fromEnd
    ? trimmed.slice(-QUOTE_RADIUS)
    : trimmed.slice(0, QUOTE_RADIUS);
  return slice.trim() || undefined;
}

export function buildWebAnchor(flat: FlatText, range: Range): WebAnchor | null {
  const offsets = rangeToFlatOffsets(flat, range);
  if (!offsets) return null;

  const { start, end } = offsets;
  const exact = flat.text.slice(start, end).trim();
  if (!exact) return null;

  const prefix = pickQuotePart(flat.text.slice(Math.max(0, start - QUOTE_RADIUS), start), false);
  const suffix = pickQuotePart(flat.text.slice(end, Math.min(flat.text.length, end + QUOTE_RADIUS)), true);

  return {
    kind: 'web',
    textQuote: {
      exact,
      prefix,
      suffix,
    },
    textPosition: { start, end },
  };
}
