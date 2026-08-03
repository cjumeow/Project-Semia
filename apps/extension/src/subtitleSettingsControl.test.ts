// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSubtitleSettingsControl } from './subtitleSettingsControl';

vi.mock('./semiaSettings', () => ({
  getSemiaSettings: vi.fn().mockResolvedValue({
    learningLanguage: 'en',
    nativeLanguage: 'zh-TW',
    bilingualCaptionsEnabled: true,
  }),
  saveSemiaSettings: vi.fn().mockResolvedValue(undefined),
}));

const BUTTON_HOST_ID = 'semia-subtitle-settings-host';
const POPOVER_HOST_ID = 'semia-subtitle-settings-popover-host';

function installYoutubePlayerFixture(): void {
  document.body.innerHTML = `
    <div id="movie_player" class="html5-video-player">
      <div class="ytp-right-controls">
        <button class="ytp-subtitles-button"></button>
        <button class="ytp-settings-button"></button>
      </div>
    </div>
  `;
}

function getToggleButton(): HTMLButtonElement {
  const host = document.getElementById(BUTTON_HOST_ID);
  if (!host?.shadowRoot) {
    throw new Error('subtitle settings button host missing');
  }
  const button = host.shadowRoot.querySelector<HTMLButtonElement>(
    '[data-action="toggle-popover"]',
  );
  if (!button) {
    throw new Error('toggle button missing');
  }
  return button;
}

function getPopoverHost(): HTMLElement {
  const popoverHost = document.getElementById(POPOVER_HOST_ID);
  if (!popoverHost) {
    throw new Error('popover host missing');
  }
  return popoverHost;
}

function isPopoverVisible(): boolean {
  const popoverHost = getPopoverHost();
  return (
    !popoverHost.hidden &&
    Boolean(popoverHost.shadowRoot?.querySelector('[role="dialog"]'))
  );
}

async function flushControlInit(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('createSubtitleSettingsControl interaction', () => {
  let destroy: (() => void) | undefined;

  beforeEach(() => {
    installYoutubePlayerFixture();
  });

  afterEach(() => {
    destroy?.();
    destroy = undefined;
    document.body.innerHTML = '';
    document.documentElement
      .querySelectorAll(`#${POPOVER_HOST_ID}`)
      .forEach((node) => node.remove());
  });

  it('opens on pointerdown even when the follow-up click is swallowed', async () => {
    const control = createSubtitleSettingsControl({
      onSettingsChange: vi.fn(),
    });
    destroy = control.destroy;
    await flushControlInit();

    const button = getToggleButton();
    button.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true }),
    );
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(isPopoverVisible()).toBe(true);
    expect(getToggleButton().getAttribute('aria-expanded')).toBe('true');
  });

  it('does not close immediately from a document capture click in the open guard window', async () => {
    const control = createSubtitleSettingsControl({
      onSettingsChange: vi.fn(),
    });
    destroy = control.destroy;
    await flushControlInit();

    const button = getToggleButton();
    button.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true }),
    );

    document.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );

    expect(isPopoverVisible()).toBe(true);
  });

  it('positions the portaled popover host with fixed coordinates', async () => {
    const control = createSubtitleSettingsControl({
      onSettingsChange: vi.fn(),
    });
    destroy = control.destroy;
    await flushControlInit();

    const button = getToggleButton();
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
      top: 500,
      right: 900,
      bottom: 536,
      left: 864,
      width: 36,
      height: 36,
      x: 864,
      y: 500,
      toJSON: () => ({}),
    });

    button.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true }),
    );

    const popoverHost = getPopoverHost();
    expect(popoverHost.style.position).toBe('fixed');
    expect(popoverHost.style.zIndex).toBe('2147483647');
    expect(popoverHost.style.top).not.toBe('');
    expect(popoverHost.style.left).not.toBe('');
  });
});
