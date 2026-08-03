/** Mount target: active player's right controls (append = far-right). */
export function findSubtitleSettingsMountParent(
  root: ParentNode = document,
): HTMLElement | null {
  const player =
    root.querySelector('#movie_player') ??
    root.querySelector('.html5-video-player');
  if (!player) return null;

  const rightControls = player.querySelector('.ytp-right-controls');
  if (rightControls instanceof HTMLElement) return rightControls;
  return null;
}

/** @deprecated Use findSubtitleSettingsMountParent + appendChild for far-right placement. */
export function findSubtitleSettingsMountBefore(
  root: ParentNode = document,
): HTMLElement | null {
  const parent = findSubtitleSettingsMountParent(root);
  if (!parent) return null;
  const settingsButton = parent.querySelector('.ytp-settings-button');
  if (settingsButton instanceof HTMLElement) return settingsButton;
  return parent;
}
