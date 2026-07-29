import type { LanguageFragment } from '@semia/shared';
import { getArticleRoot } from './articleRoot';
import { buildWebAnchor } from './buildWebAnchor';
import { extractContext } from './extractContext';
import { flattenText } from './flattenText';

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

export function buildWebFragment(range: Range): LanguageFragment | null {
  const root = getArticleRoot();
  const flat = flattenText(root);
  const anchor = buildWebAnchor(flat, range);
  if (!anchor) return null;

  const selectedText = anchor.textQuote.exact;
  const contextText = extractContext(
    flat,
    anchor.textPosition.start,
    anchor.textPosition.end,
  );

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
