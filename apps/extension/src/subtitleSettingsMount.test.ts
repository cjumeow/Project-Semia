// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { findSubtitleSettingsMountBefore } from './subtitleSettingsMount';

function mountFixture(html: string): ParentNode {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
}

describe('findSubtitleSettingsMountBefore', () => {
  it('mounts inside the active movie_player, not an earlier stale bar', () => {
    const root = mountFixture(`
      <div id="stale-player" class="html5-video-player" style="display:none">
        <div class="ytp-right-controls">
          <button class="ytp-settings-button" id="stale-settings"></button>
        </div>
      </div>
      <div id="movie_player" class="html5-video-player">
        <div class="ytp-right-controls">
          <button class="ytp-subtitles-button"></button>
          <button class="ytp-settings-button" id="active-settings"></button>
        </div>
      </div>
    `);

    const mountBefore = findSubtitleSettingsMountBefore(root);
    expect(mountBefore?.id).toBe('active-settings');
  });

  it('falls back to html5-video-player when movie_player is absent', () => {
    const root = mountFixture(`
      <div class="html5-video-player">
        <div class="ytp-right-controls">
          <button class="ytp-settings-button" id="player-settings"></button>
        </div>
      </div>
    `);

    const mountBefore = findSubtitleSettingsMountBefore(root);
    expect(mountBefore?.id).toBe('player-settings');
  });
});
