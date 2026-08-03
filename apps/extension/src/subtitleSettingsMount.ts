/** Pure mount targeting — scoped to the active YouTube player chrome. */
export function findSubtitleSettingsMountBefore(
  root: ParentNode = document,
): HTMLElement | null {
  const player =
    root.querySelector('#movie_player') ??
    root.querySelector('.html5-video-player');
  if (!player) return null;

  const rightControls = player.querySelector('.ytp-right-controls');
  if (!rightControls) return null;

  const settingsButton = rightControls.querySelector('.ytp-settings-button');
  if (settingsButton instanceof HTMLElement) return settingsButton;
  if (rightControls instanceof HTMLElement) return rightControls;
  return null;
}
