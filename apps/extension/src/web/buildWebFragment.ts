import type { LanguageFragment, WebLocateQuality } from '@semia/shared';
import { hasLikelyLatexOrMathMarkup } from '@semia/shared';
import { buildWebAnchor } from './buildWebAnchor';
import { extractContext } from './extractContext';
import {
  findFlatRange,
  flattenText,
  locateRangeInFlat,
  type FlatText,
} from './flattenText';

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `frag-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function detectLanguageCode(doc: Document = document): string {
  const lang =
    doc.documentElement.lang ||
    doc.querySelector('meta[http-equiv="content-language"]')?.getAttribute('content') ||
    navigator.language;
  return lang.split('-')[0]?.toLowerCase() || 'en';
}

function pageTitle(doc: Document = document): string {
  return doc.title.trim() || doc.location.hostname;
}

export type WebCaptureFailureReason = 'empty-selection' | 'locate-failed';

export type WebCaptureResult =
  | { ok: true; fragment: LanguageFragment }
  | { ok: false; reason: WebCaptureFailureReason };

type LocatedSelection = {
  flat: FlatText;
  offsets: { start: number; end: number };
  fromRange: boolean;
};

/**
 * Locate against the live page body.
 *
 * Prefer mapping the DOM Range through flatten chunks (same nodes the user
 * selected). Fall back to string search when the Range boundaries are not in
 * the flattened tree (e.g. skipped hidden nodes).
 */
function locateSelection(
  range: Range,
  selectedText: string,
): LocatedSelection | null {
  const bodyFlat = flattenText(document.body);
  const fromRange = locateRangeInFlat(bodyFlat, range);
  if (fromRange) {
    return { flat: bodyFlat, offsets: fromRange, fromRange: true };
  }

  const fromSearch = findFlatRange(bodyFlat, selectedText);
  if (!fromSearch) return null;

  return { flat: bodyFlat, offsets: fromSearch, fromRange: false };
}

function inferLocateQuality(
  selectedText: string,
  fromRange: boolean,
): WebLocateQuality {
  if (hasLikelyLatexOrMathMarkup(selectedText) || !fromRange) {
    return 'uncertain';
  }
  return 'precise';
}

export function buildWebFragment(range: Range): WebCaptureResult {
  const selectedText = range.toString().replace(/\s+/g, ' ').trim();
  if (!selectedText) {
    return { ok: false, reason: 'empty-selection' };
  }

  const located = locateSelection(range, selectedText);
  if (!located) {
    return { ok: false, reason: 'locate-failed' };
  }

  const { flat, offsets, fromRange } = located;
  const locateQuality = inferLocateQuality(selectedText, fromRange);
  const anchor = buildWebAnchor(flat, selectedText, offsets, locateQuality);
  const contextText = extractContext(flat, offsets.start, offsets.end);

  return {
    ok: true,
    fragment: {
      id: createId(),
      selectedText,
      contextText,
      languageCode: detectLanguageCode(),
      sourceUrl: window.location.href,
      sourceTitle: pageTitle(),
      capturedAt: new Date().toISOString(),
      triageStatus: 'pending',
      anchor,
    },
  };
}
