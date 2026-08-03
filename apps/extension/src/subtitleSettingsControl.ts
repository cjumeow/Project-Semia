import type { SemiaSettings } from '@semia/shared';
import {
  LEARNING_LANGUAGE_OPTIONS,
  NATIVE_LANGUAGE_OPTIONS,
} from '@semia/shared';
import buttonCss from './subtitleSettingsControl.css';
import popoverCss from './subtitleSettingsPopover.css';
import { getSemiaSettings, saveSemiaSettings } from './semiaSettings';
import { findSubtitleSettingsMountBefore } from './subtitleSettingsMount';
import {
  nextPopoverOpenOnToggle,
  shouldDismissPopoverOnDocumentClick,
} from './subtitleSettingsPopover';
import { computePopoverFixedPosition } from './subtitleSettingsPopoverPosition';
import { mergeSubtitleSettingsPatch } from './subtitleSettingsPatch';

const BUTTON_HOST_ID = 'semia-subtitle-settings-host';
const POPOVER_HOST_ID = 'semia-subtitle-settings-popover-host';
const POPOVER_WIDTH = 288;
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

function clickInsideAnyHost(event: Event, hosts: HTMLElement[]): boolean {
  const path = event.composedPath();
  return hosts.some((host) => path.includes(host));
}

function buildPopoverFieldsHtml(
  learning: string,
  native: string,
  bilingual: boolean,
): string {
  const learningOptions = LEARNING_LANGUAGE_OPTIONS.map(
    (option) =>
      `<option value="${option.code}"${option.code === learning ? ' selected' : ''}>${option.label}</option>`,
  ).join('');

  const nativeOptions = NATIVE_LANGUAGE_OPTIONS.map(
    (option) =>
      `<option value="${option.code}"${option.code === native ? ' selected' : ''}>${option.label}</option>`,
  ).join('');

  return `
    <div class="popover" role="dialog" aria-label="Subtitle settings">
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
    </div>
  `;
}

export function createSubtitleSettingsControl(options: {
  onSettingsChange: (settings: SemiaSettings) => void | Promise<void>;
}): SubtitleSettingsControl {
  document.getElementById(BUTTON_HOST_ID)?.remove();
  document.getElementById(POPOVER_HOST_ID)?.remove();

  const buttonHost = document.createElement('div');
  buttonHost.id = BUTTON_HOST_ID;

  const buttonShadow = buttonHost.attachShadow({ mode: 'open' });
  const buttonStyle = document.createElement('style');
  buttonStyle.textContent = buttonCss;
  buttonShadow.appendChild(buttonStyle);

  const buttonRoot = document.createElement('div');
  buttonShadow.appendChild(buttonRoot);

  const popoverHost = document.createElement('div');
  popoverHost.id = POPOVER_HOST_ID;
  popoverHost.hidden = true;

  const popoverShadow = popoverHost.attachShadow({ mode: 'open' });
  const popoverStyle = document.createElement('style');
  popoverStyle.textContent = popoverCss;
  popoverShadow.appendChild(popoverStyle);

  const popoverRoot = document.createElement('div');
  popoverShadow.appendChild(popoverRoot);
  document.body.appendChild(popoverHost);

  let settings: SemiaSettings | null = null;
  let popoverOpen = false;
  let mountedBefore: HTMLElement | null = null;
  let playerObserver: MutationObserver | null = null;

  function bilingualActive(): boolean {
    return settings?.bilingualCaptionsEnabled !== false;
  }

  function positionPopover(): void {
    const anchor = buttonRoot.querySelector<HTMLElement>(
      '[data-action="toggle-popover"]',
    );
    if (!anchor) return;

    const anchorRect = anchor.getBoundingClientRect();
    const popoverEl = popoverRoot.querySelector<HTMLElement>('.popover');
    const popoverHeight = popoverEl?.getBoundingClientRect().height ?? 220;
    const { top, left } = computePopoverFixedPosition({
      anchor: anchorRect,
      popoverWidth: POPOVER_WIDTH,
      popoverHeight,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });

    popoverHost.style.top = `${top}px`;
    popoverHost.style.left = `${left}px`;
  }

  function renderButton(): void {
    const bilingual = bilingualActive();
    buttonRoot.innerHTML = `
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
    `;
  }

  function renderPopover(): void {
    if (!popoverOpen) {
      popoverHost.hidden = true;
      popoverRoot.innerHTML = '';
      return;
    }

    const learning = settings?.learningLanguage ?? 'en';
    const native = settings?.nativeLanguage ?? 'zh-TW';
    popoverHost.hidden = false;
    popoverRoot.innerHTML = buildPopoverFieldsHtml(
      learning,
      native,
      bilingualActive(),
    );
    requestAnimationFrame(() => {
      positionPopover();
    });
  }

  function render(): void {
    renderButton();
    renderPopover();
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

  function onButtonPointerDown(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.closest('[data-action="toggle-popover"]')) return;
    event.preventDefault();
    event.stopPropagation();
  }

  function onButtonClick(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const action = target.closest<HTMLElement>('[data-action]')?.dataset.action;
    if (action !== 'toggle-popover') return;

    event.preventDefault();
    event.stopPropagation();
    popoverOpen = nextPopoverOpenOnToggle(popoverOpen);
    render();
  }

  function onPopoverClick(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const action = target.closest<HTMLElement>('[data-action]')?.dataset.action;
    if (action !== 'close-popover') return;

    event.preventDefault();
    event.stopPropagation();
    popoverOpen = false;
    render();
  }

  function onFieldChange(event: Event): void {
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
        clickInsideUi: clickInsideAnyHost(event, [buttonHost, popoverHost]),
      })
    ) {
      return;
    }
    popoverOpen = false;
    render();
  }

  function onViewportChange(): void {
    if (!popoverOpen) return;
    positionPopover();
  }

  buttonRoot.addEventListener('pointerdown', onButtonPointerDown);
  buttonRoot.addEventListener('click', onButtonClick);
  popoverRoot.addEventListener('click', onPopoverClick);
  popoverRoot.addEventListener('change', onFieldChange);
  document.addEventListener('click', onDocumentClick, true);
  window.addEventListener('resize', onViewportChange);
  window.addEventListener('scroll', onViewportChange, true);

  function mount(): boolean {
    const mountBefore = findSubtitleSettingsMountBefore();
    if (!mountBefore) return false;

    const parent = mountBefore.parentElement;
    if (!parent) return false;

    const needsInsert =
      !buttonHost.isConnected ||
      buttonHost.parentElement !== parent ||
      mountedBefore !== mountBefore;

    if (needsInsert) {
      parent.insertBefore(buttonHost, mountBefore);
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
      if (popoverOpen) {
        requestAnimationFrame(() => positionPopover());
      }
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
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
    document.removeEventListener('click', onDocumentClick, true);
    buttonRoot.removeEventListener('pointerdown', onButtonPointerDown);
    buttonRoot.removeEventListener('click', onButtonClick);
    popoverRoot.removeEventListener('click', onPopoverClick);
    popoverRoot.removeEventListener('change', onFieldChange);
    buttonHost.remove();
    popoverHost.remove();
  }

  return { destroy, setSettings };
}
