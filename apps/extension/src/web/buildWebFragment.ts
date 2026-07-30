import type { LanguageFragment } from '@semia/shared';
import { getArticleRoot } from './articleRoot';
import { buildWebAnchor } from './buildWebAnchor';
import { extractContext } from './extractContext';
import { findFlatRange, flattenText, type FlatText } from './flattenText';

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

type LocatedSelection = {
  flat: FlatText;
  offsets: { start: number; end: number } | null;
};

/**
 * Readability rebuilds the article into a detached tree, so a selection made in
 * the live page is not always present there. Fall back to the live body.
 */
function locateSelection(selectedText: string): LocatedSelection {
  const articleFlat = flattenText(getArticleRoot());
  const articleOffsets = findFlatRange(articleFlat, selectedText);
  if (articleOffsets) {
    return { flat: articleFlat, offsets: articleOffsets };
  }

  const bodyFlat = flattenText(document.body);
  return { flat: bodyFlat, offsets: findFlatRange(bodyFlat, selectedText) };
}

export function buildWebFragment(range: Range): LanguageFragment | null {
  const selectedText = range.toString().replace(/\s+/g, ' ').trim();
  if (!selectedText) return null;

  const { flat, offsets } = locateSelection(selectedText);
  const anchor = buildWebAnchor(flat, selectedText, offsets);
  const contextText = offsets
    ? extractContext(flat, offsets.start, offsets.end)
    : selectedText;

  return {
    id: createId(),
    selectedText,
    contextText,
    languageCode: detectLanguageCode(),
    sourceUrl: window.location.href,
    sourceTitle: pageTitle(),
    capturedAt: new Date().toISOString(),
    anchor,
  };
}
