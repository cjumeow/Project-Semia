import type { LanguageFragment } from '@semia/shared';
import type { WebRestorePayload } from './web/restoreWebSelection';
import { clearWebRestoreStatus } from './webRestoreStatusStorage';

const pendingByTabId = new Map<number, WebRestorePayload>();

export function setPendingWebRestore(
  tabId: number,
  payload: WebRestorePayload,
): void {
  pendingByTabId.set(tabId, payload);
}

export function takePendingWebRestore(tabId: number): WebRestorePayload | null {
  const payload = pendingByTabId.get(tabId) ?? null;
  pendingByTabId.delete(tabId);
  return payload;
}

export async function openWebCapture(fragment: LanguageFragment): Promise<void> {
  if (fragment.anchor.kind !== 'web') {
    throw new Error('Only web captures can be opened on the original page.');
  }

  await clearWebRestoreStatus(fragment.id);

  const tab = await chrome.tabs.create({ url: fragment.sourceUrl });
  if (!tab.id) return;

  setPendingWebRestore(tab.id, {
    fragmentId: fragment.id,
    selectedText: fragment.selectedText,
    textQuote: fragment.anchor.textQuote,
  });
}
