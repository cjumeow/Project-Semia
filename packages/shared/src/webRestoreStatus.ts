import type { WebAnchor } from './types';
import {
  effectiveWebLocateQuality,
  webJumpBackUncertainLabel,
  webLocateFailureLabel,
} from './webAnchor';

export type WebRestoreStatus = 'ok' | 'failed';

export type WebRestoreStatusMap = Record<string, WebRestoreStatus>;

export type WebJumpBackHintKind = 'unavailable' | 'uncertain' | 'failed';

export type WebJumpBackHint = {
  kind: WebJumpBackHintKind;
  message: string;
};

/**
 * Hint for SEMIA UI. Cannot know jump-back will work until restore is tried;
 * `uncertain` is the best pre-attempt signal (LaTeX, fuzzy locate at capture).
 */
export function getWebJumpBackHint(
  anchor: WebAnchor,
  options?: {
    restoreFailed?: boolean;
    restoreSucceeded?: boolean;
    selectedText?: string;
  },
): WebJumpBackHint | undefined {
  const selectedText = options?.selectedText ?? anchor.textQuote.exact;
  const quality = effectiveWebLocateQuality(anchor, selectedText);

  if (quality === 'degraded') {
    const message = webLocateFailureLabel(anchor);
    return message ? { kind: 'unavailable', message } : undefined;
  }

  if (options?.restoreSucceeded) {
    return undefined;
  }

  if (options?.restoreFailed) {
    return {
      kind: 'failed',
      message:
        'Opened the page, but the selection could not be restored. ' +
        'Dynamic content (for example LaTeX formulas) may prevent jump-back on some sites.',
    };
  }

  if (quality === 'uncertain') {
    return {
      kind: 'uncertain',
      message: webJumpBackUncertainLabel(),
    };
  }

  return undefined;
}

/** @deprecated Use getWebJumpBackHint for UI that needs kind + message. */
export function webJumpBackUnavailableLabel(
  anchor: WebAnchor,
  options?: {
    restoreFailed?: boolean;
    restoreSucceeded?: boolean;
    selectedText?: string;
  },
): string | undefined {
  return getWebJumpBackHint(anchor, options)?.message;
}
