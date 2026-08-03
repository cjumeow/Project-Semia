import type { SemiaSettings } from '@semia/shared';
import {
  LEARNING_LANGUAGE_OPTIONS,
  NATIVE_LANGUAGE_OPTIONS,
} from '@semia/shared';
import controlCss from './subtitleSettingsControl.css';
import { getSemiaSettings, saveSemiaSettings } from './semiaSettings';
import { findSubtitleSettingsMountBefore } from './subtitleSettingsMount';
import {
  nextPopoverOpenOnToggle,
  shouldDismissPopoverOnDocumentClick,
} from './subtitleSettingsPopover';
import { mergeSubtitleSettingsPatch } from './subtitleSettingsPatch';

const HOST_ID = 'semia-subtitle-settings-host';
const MOUNT_POLL_MS = 500;

export type SubtitleSettingsControl = {
  destroy: () => void;
  setSettings: (settings: SemiaSettings) => void;
};

function semiaSubtitleIconSvg(): string {
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
    <path d="M7 10h6M7 13h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M16 8l3 2-3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function clickInsideHost(event: Event, host: HTMLElement): boolean {
  return event.composedPath().includes(host);
}

export function createSubtitleSettingsControl(options: {
  onSettingsChange: (settings: SemiaSettings) => void | Promise<void>;
}): SubtitleSettingsControl {
  document.getElementById(HOST_ID)?.remove();

  const host = document.createElement('div');
  host.id = HOST_ID;

  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = controlCss;
  shadow.appendChild(style);

  const root = document.createElement('div');
  shadow.appendChild(root);

  let settings: SemiaSettings | null = null;
  let popoverOpen = false;
  let mountedBefore: HTMLElement | null = null;
  let playerObserver: MutationObserver | null = null;

  function bilingualActive(): boolean {
    return settings?.bilingualCaptionsEnabled !== false;
  }

  function render(): void {
    const learning = settings?.learningLanguage ?? 'en';
    const native = settings?.nativeLanguage ?? 'zh-TW';
    const bilingual = bilingualActive();

    const learningOptions = LEARNING_LANGUAGE_OPTIONS.map(
      (option) =>
        `<option value="${option.code}"${option.code === learning ? ' selected' : ''}>${option.label}</option>`,
    ).join('');

    const nativeOptions = NATIVE_LANGUAGE_OPTIONS.map(
      (option) =>
        `<option value="${option.code}"${option.code === native ? ' selected' : ''}>${option.label}</option>`,
    ).join('');

    root.innerHTML = `
      <button
        type="button"
        class="icon-btn"
        aria-label="Semia subtitles"
        aria-pressed="${bilingual ? 'true' : 'false'}"
        aria-expanded="${popoverOpen ? 'true' : 'false'}"
        title="Semia subtitles"
        data-action="toggle-popover"
      >
        ${semiaSubtitleIconSvg()}
      </button>
      ${
        popoverOpen
          ? `<div class="popover" role="dialog" aria-label="Subtitle settings">
        <div class="popover-header">
          <div>
            <p class="popover-title">Semia subtitles</p>
            <p class="popover-subtitle">YouTube auto-translate</p>
          </div>
          <button type="button" class="close-btn" aria-label="Close" data-action="close-popover">×</button>
        </div>
        <div class="fields">
          <label class="field">
            <span class="field-label">Learning language</span>
            <select class="field-select" data-field="learningLanguage">${learningOptions}</select>
          </label>
          <label class="field">
            <span class="field-label">Native language</span>
            <select class="field-select" data-field="nativeLanguage">${nativeOptions}</select>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" data-field="bilingualCaptionsEnabled"${bilingual ? ' checked' : ''} />
            Show bilingual captions
          </label>
          <p class="hint">Learning line is shown on the video. Native line display is deferred until pairing is validated.</p>
        </div>
      </div>`
          : ''
      }
    `;
  }

  async function applyPatch(
    patch: Parameters<typeof mergeSubtitleSettingsPatch>[1],
  ): Promise<void> {
    const current = settings ?? (await getSemiaSettings());
    const next = mergeSubtitleSettingsPatch(current, patch);
    settings = next;
    await saveSemiaSettings(next);
    render();
    await options.onSettingsChange(next);
  }

  function onRootPointerDown(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.closest('[data-action="toggle-popover"]')) return;
    event.preventDefault();
    event.stopPropagation();
  }

  function onRootClick(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const action = target.closest<HTMLElement>('[data-action]')?.dataset.action;
    if (action === 'toggle-popover') {
      event.preventDefault();
      event.stopPropagation();
      popoverOpen = nextPopoverOpenOnToggle(popoverOpen);
      render();
      return;
    }
    if (action === 'close-popover') {
      event.preventDefault();
      event.stopPropagation();
      popoverOpen = false;
      render();
    }
  }

  function onRootChange(event: Event): void {
    const target = event.target;
    if (
      !(target instanceof HTMLSelectElement) &&
      !(target instanceof HTMLInputElement)
    ) {
      return;
    }

    const field = target.dataset.field;
    if (!field) return;

    if (field === 'learningLanguage' && target instanceof HTMLSelectElement) {
      void applyPatch({ learningLanguage: target.value });
      return;
    }
    if (field === 'nativeLanguage' && target instanceof HTMLSelectElement) {
      void applyPatch({ nativeLanguage: target.value });
      return;
    }
    if (
      field === 'bilingualCaptionsEnabled' &&
      target instanceof HTMLInputElement
    ) {
      void applyPatch({ bilingualCaptionsEnabled: target.checked });
    }
  }

  function onDocumentClick(event: Event): void {
    if (
      !shouldDismissPopoverOnDocumentClick({
        popoverOpen,
        clickInsideHost: clickInsideHost(event, host),
      })
    ) {
      return;
    }
    popoverOpen = false;
    render();
  }

  root.addEventListener('pointerdown', onRootPointerDown);
  root.addEventListener('click', onRootClick);
  root.addEventListener('change', onRootChange);
  document.addEventListener('click', onDocumentClick, true);

  function mount(): boolean {
    const mountBefore = findSubtitleSettingsMountBefore();
    if (!mountBefore) return false;

    const parent = mountBefore.parentElement;
    if (!parent) return false;

    const needsInsert =
      !host.isConnected ||
      host.parentElement !== parent ||
      mountedBefore !== mountBefore;

    if (needsInsert) {
      parent.insertBefore(host, mountBefore);
      mountedBefore = mountBefore;
    }
    return true;
  }

  function watchPlayer(): void {
    playerObserver?.disconnect();
    const player =
      document.querySelector('#movie_player') ??
      document.querySelector('.html5-video-player');
    if (!player) return;

    playerObserver = new MutationObserver(() => {
      mount();
    });
    playerObserver.observe(player, { childList: true, subtree: true });
  }

  const mountPoll = window.setInterval(() => {
    mount();
    if (!playerObserver) watchPlayer();
  }, MOUNT_POLL_MS);

  void (async () => {
    settings = await getSemiaSettings();
    render();
    mount();
    watchPlayer();
  })();

  function setSettings(next: SemiaSettings): void {
    settings = next;
    render();
  }

  function destroy(): void {
    window.clearInterval(mountPoll);
    playerObserver?.disconnect();
    document.removeEventListener('click', onDocumentClick, true);
    root.removeEventListener('pointerdown', onRootPointerDown);
    root.removeEventListener('click', onRootClick);
    root.removeEventListener('change', onRootChange);
    host.remove();
  }

  return { destroy, setSettings };
}
