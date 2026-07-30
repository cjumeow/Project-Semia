import type { WebAnchor } from '@semia/shared';
import { findFlatRange, flattenText, type FlatText } from './flattenText';

export type WebRestorePayload = {
  selectedText: string;
  textQuote: WebAnchor['textQuote'];
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeQuote(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/** Locate a quote in flattened text, using prefix/suffix to disambiguate duplicates. */
export function findFlatRangeWithQuote(
  flat: FlatText,
  textQuote: WebAnchor['textQuote'],
): { start: number; end: number } | null {
  const needle = normalizeQuote(textQuote.exact);
  if (!needle) return null;

  const pattern = needle.split(' ').map(escapeRegExp).join('\\s+');
  const regex = new RegExp(pattern, 'g');
  const candidates: Array<{ start: number; end: number }> = [];

  let match: RegExpExecArray | null;
  while ((match = regex.exec(flat.text)) !== null) {
    candidates.push({ start: match.index, end: match.index + match[0].length });
  }

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0]!;

  const prefix = textQuote.prefix ? normalizeQuote(textQuote.prefix) : '';
  const suffix = textQuote.suffix ? normalizeQuote(textQuote.suffix) : '';

  for (const candidate of candidates) {
    const before = flat.text.slice(
      Math.max(0, candidate.start - Math.max(prefix.length, 32)),
      candidate.start,
    );
    const after = flat.text.slice(
      candidate.end,
      candidate.end + Math.max(suffix.length, 32),
    );

    const prefixOk =
      !prefix || before.replace(/\s+$/, '').endsWith(prefix);
    const suffixOk =
      !suffix || after.replace(/^\s+/, '').startsWith(suffix);
    if (prefixOk && suffixOk) return candidate;
  }

  return candidates[0]!;
}

function contentOffsetToNodeOffset(node: Text, offset: number): number {
  const raw = node.data;
  const normalized = raw.replace(/\s+/g, ' ').trim();
  if (!normalized) return 0;

  if (offset <= 0) {
    const first = raw.match(/\S/);
    return first?.index ?? 0;
  }

  if (offset >= normalized.length) {
    let normIdx = 0;
    let i = 0;
    while (i < raw.length) {
      if (/\s/.test(raw[i]!)) {
        while (i < raw.length && /\s/.test(raw[i]!)) i++;
        if (normIdx > 0 && normIdx < normalized.length) normIdx++;
      } else {
        normIdx++;
        i++;
      }
    }
    return i;
  }

  let normIdx = 0;
  let i = 0;
  while (i < raw.length && normIdx < offset) {
    if (/\s/.test(raw[i]!)) {
      while (i < raw.length && /\s/.test(raw[i]!)) i++;
      if (normIdx > 0) normIdx++;
    } else {
      normIdx++;
      i++;
    }
  }
  return i;
}

function flatOffsetsToDomRange(
  flat: FlatText,
  start: number,
  end: number,
): Range | null {
  const { text, chunks } = flat;
  if (start < 0 || end > text.length || start >= end) return null;

  let startNode: Text | null = null;
  let startOffset = 0;
  let endNode: Text | null = null;
  let endOffset = 0;

  for (let index = 0; index < chunks.length; index++) {
    const chunk = chunks[index]!;
    const chunkStart = chunk.start;
    const chunkEnd =
      index + 1 < chunks.length ? chunks[index + 1]!.start : text.length;
    const chunkLength = chunkEnd - chunkStart;

    if (chunkEnd <= start) continue;
    if (chunkStart >= end) break;

    if (!startNode) {
      startNode = chunk.node;
      startOffset = contentOffsetToNodeOffset(
        chunk.node,
        Math.max(0, start - chunkStart),
      );
    }

    endNode = chunk.node;
    endOffset = contentOffsetToNodeOffset(
      chunk.node,
      Math.min(chunkLength, end - chunkStart),
    );
  }

  if (!startNode || !endNode) return null;

  const doc = startNode.ownerDocument;
  const range = doc.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  return range;
}

/** Scroll to and select captured text using the browser's native selection UI. */
export function restoreWebSelection(
  root: Element,
  payload: WebRestorePayload,
): boolean {
  const flat = flattenText(root);
  const offsets =
    findFlatRangeWithQuote(flat, payload.textQuote) ??
    findFlatRange(flat, payload.selectedText);
  if (!offsets) return false;

  const range = flatOffsetsToDomRange(flat, offsets.start, offsets.end);
  if (!range) return false;

  const view = root.ownerDocument.defaultView;
  const selection = view?.getSelection();
  if (!selection) return false;

  selection.removeAllRanges();
  selection.addRange(range);

  const rect = range.getBoundingClientRect();
  if (view && rect.height > 0) {
    view.scrollTo({
      top: view.scrollY + rect.top - view.innerHeight / 3,
      behavior: 'smooth',
    });
  }

  return true;
}
