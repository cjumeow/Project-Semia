/** Guards document-level dismiss so the opening gesture does not close immediately. */
export function shouldIgnoreDocumentDismiss(options: {
  openedAtMs: number | null;
  nowMs: number;
  guardMs?: number;
}): boolean {
  if (options.openedAtMs == null) return false;
  const guardMs = options.guardMs ?? 0;
  return options.nowMs - options.openedAtMs < guardMs;
}

/** Returns true when the event target is inside one of the UI hosts (light or shadow). */
export function eventTargetsSubtitleSettingsUi(
  event: Event,
  hosts: HTMLElement[],
): boolean {
  const path = event.composedPath();
  if (hosts.some((host) => path.includes(host))) {
    return true;
  }

  const target = event.target;
  if (!(target instanceof Node)) return false;

  return hosts.some(
    (host) => host === target || host.shadowRoot?.contains(target) === true,
  );
}
