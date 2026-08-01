import type { WebAnchor, WebLocateQuality } from './types';

/** LaTeX / MathJax markers that often break quote-based restore after reload. */
export function hasLikelyLatexOrMathMarkup(text: string): boolean {
  return /\\[a-zA-Z]+|\\\(|\\\)|\\\[|\\\]|\\begin\{|\\end\{|\$\$?|[\^_]\{/.test(
    text,
  );
}

/** Detect pre-Phase-3 anchors saved without real page offsets. */
export function inferWebLocateQuality(
  textQuote: WebAnchor['textQuote'],
  textPosition: WebAnchor['textPosition'],
): WebLocateQuality {
  const exactLen = textQuote.exact.replace(/\s+/g, ' ').trim().length;
  const hasDisambiguation = Boolean(
    textQuote.prefix?.trim() || textQuote.suffix?.trim(),
  );
  const placeholderPosition =
    textPosition.start === 0 &&
    textPosition.end === exactLen &&
    !hasDisambiguation;

  return placeholderPosition ? 'degraded' : 'precise';
}

/**
 * Stored quality plus legacy inference from captured text.
 * Jump-back cannot be proven until restore runs; LaTeX selections are uncertain.
 */
export function effectiveWebLocateQuality(
  anchor: WebAnchor,
  selectedText: string,
): WebLocateQuality {
  if (
    anchor.locateQuality === 'degraded' ||
    anchor.locateQuality === 'uncertain'
  ) {
    return anchor.locateQuality;
  }

  if (hasLikelyLatexOrMathMarkup(selectedText)) {
    return 'uncertain';
  }

  return 'precise';
}

export function isDegradedWebAnchor(anchor: WebAnchor): boolean {
  return anchor.locateQuality === 'degraded';
}

export function isUncertainWebAnchor(
  anchor: WebAnchor,
  selectedText?: string,
): boolean {
  return (
    effectiveWebLocateQuality(anchor, selectedText ?? anchor.textQuote.exact) ===
    'uncertain'
  );
}

/** True when jump-back should be attempted (not blocked at capture time). */
export function isWebJumpBackReliable(anchor: WebAnchor): boolean {
  return !isDegradedWebAnchor(anchor);
}

export function webLocateFailureLabel(anchor: WebAnchor): string | undefined {
  if (!isDegradedWebAnchor(anchor)) return undefined;
  return (
    anchor.locateFailureReason ??
    'Selection could not be mapped to page text (quote-only capture).'
  );
}

export function webJumpBackUncertainLabel(): string {
  return (
    'Jump-back may not highlight this selection. Open the page to try — ' +
    'if restore fails, a note will appear here.'
  );
}
