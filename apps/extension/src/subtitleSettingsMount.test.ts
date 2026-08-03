// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { findSubtitleSettingsMountParent } from './subtitleSettingsMount';

function mountFixture(html: string): ParentNode {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
}

describe('findSubtitleSettingsMountParent', () => {
  it('targets the active movie_player right controls', () => {
    const root = mountFixture(`
      <div id="stale-player" class="html5-video-player" style="display:none">
        <div class="ytp-right-controls" id="stale-controls"></div>
      </div>
      <div id="movie_player" class="html5-video-player">
        <div class="ytp-right-controls" id="active-controls">
          <button class="ytp-fullscreen-button"></button>
        </div>
      </div>
    `);

    const parent = findSubtitleSettingsMountParent(root);
    expect(parent?.id).toBe('active-controls');
  });
});
