import type { LanguageFragment } from '@semia/shared';

type OkResponse = { ok: true };
type ErrResponse = { ok: false; error?: string };

/**
 * Content-script entry: route fragment saves through the background service worker.
 */
export async function submitFragment(
  fragment: LanguageFragment,
): Promise<void> {
  const response = (await chrome.runtime.sendMessage({
    type: 'SAVE_FRAGMENT',
    fragment,
  })) as OkResponse | ErrResponse | undefined;

  if (response?.ok) return;

  throw new Error(response?.error ?? 'Failed to save capture.');
}
