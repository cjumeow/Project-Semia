import type { SemiaSettings } from '@semia/shared';
import buttonCss from './subtitleSettingsButton.css';
import popoverCss from './subtitleSettingsPopover.css';
import { getSemiaSettings, saveSemiaSettings } from './semiaSettings';
import { findSubtitleSettingsMountBefore } from './subtitleSettingsMount';
import {
  eventTargetsSubtitleSettingsUi,
  shouldIgnoreDocumentDismiss,
} from './subtitleSettingsInteraction';
import { nextPopoverOpenOnToggle } from './subtitleSettingsPopover';
import { computePopoverFixedPosition } from './subtitleSettingsPopoverPosition';
import { mergeSubtitleSettingsPatch } from './subtitleSettingsPatch';
import {
  buildPopoverFieldsHtml,
  POPOVER_WIDTH,
} from './subtitleSettingsPopoverMarkup';

const BUTTON_HOST_ID = 'semia-subtitle-settings-host';
const BUTTON_STYLE_ID = 'semia-subtitle-settings-button-style';
const POPOVER_HOST_ID = 'semia-subtitle-settings-popover-host';
const OPEN_GUARD_MS = 300;
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

function ensureButtonStyles(): void {
  if (document.getElementById(BUTTON_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = BUTTON_STYLE_ID;
  style.textContent = buttonCss;
  document.head.appendChild(style);
}

export function createSubtitleSettingsControl(options: {
  onSettingsChange: (settings: SemiaSettings) => void | Promise<void>;
}): SubtitleSettingsControl {
  document.getElementById(BUTTON_HOST_ID)?.remove();
  document.getElementById(POPOVER_HOST_ID)?.remove();
  ensureButtonStyles();

  const buttonHost = document.createElement('button');
  buttonHost.id = BUTTON_HOST_ID;
  buttonHost.type = 'button';
  buttonHost.className = 'ytp-button';
  buttonHost.title = 'Semia subtitles';
  buttonHost.setAttribute('aria-label', 'Semia subtitles');

  const popoverHost = document.createElement('div');
  popoverHost.id = POPOVER_HOST_ID;
  popoverHost.hidden = true;

  const popoverShadow = popoverHost.attachShadow({ mode: 'open' });
  const popoverStyle = document.createElement('style');
  popoverStyle.textContent = popoverCss;
  popoverShadow.appendChild(popoverStyle);

  const popoverRoot = document.createElement('div');
  popoverShadow.appendChild(popoverRoot);
  document.documentElement.appendChild(popoverHost);

  let settings: SemiaSettings | null = null;
  let popoverOpen = false;
  let openedAtMs: number | null = null;
  let mountedBefore: HTMLElement | null = null;
  let playerObserver: MutationObserver | null = null;

  function bilingualActive(): boolean {
    return settings?.bilingualCaptionsEnabled !== false;
  }

  function applyPopoverHostPosition(top: number, left: number): void {
    popoverHost.style.position = 'fixed';
    popoverHost.style.zIndex = '2147483647';
    popoverHost.style.top = `${top}px`;
    popoverHost.style.left = `${left}px`;
    popoverHost.style.width = `${POPOVER_WIDTH}px`;
    popoverHost.style.pointerEvents = 'auto';
  }

  function positionPopover(): void {
    if (!buttonHost.isConnected) return;

    const anchorRect = buttonHost.getBoundingClientRect();
    const popoverEl = popoverRoot.querySelector<HTMLElement>('.popover');
    const popoverHeight = popoverEl?.getBoundingClientRect().height ?? 220;
    const { top, left } = computePopoverFixedPosition({
      anchor: anchorRect,
      popoverWidth: POPOVER_WIDTH,
      popoverHeight,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });

    applyPopoverHostPosition(top, left);
  }

  function renderButton(): void {
    const bilingual = bilingualActive();
    buttonHost.setAttribute('aria-pressed', bilingual ? 'true' : 'false');
    buttonHost.setAttribute('aria-expanded', popoverOpen ? 'true' : 'false');
    buttonHost.innerHTML = semiaSubtitleIconSvg();
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
    positionPopover();
    requestAnimationFrame(() => {
      positionPopover();
    });
  }

  function render(): void {
    renderButton();
    renderPopover();
  }

  function setPopoverOpen(nextOpen: boolean): void {
    popoverOpen = nextOpen;
    openedAtMs = nextOpen ? Date.now() : null;
    render();
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
    event.stopPropagation();
    setPopoverOpen(nextPopoverOpenOnToggle(popoverOpen));
  }

  function onButtonClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  function onPopoverClick(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const action = target.closest<HTMLElement>('[data-action]')?.dataset.action;
    if (action !== 'close-popover') return;

    event.preventDefault();
    event.stopPropagation();
    setPopoverOpen(false);
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
    if (!popoverOpen) return;
    if (
      shouldIgnoreDocumentDismiss({
        openedAtMs,
        nowMs: Date.now(),
        guardMs: OPEN_GUARD_MS,
      })
    ) {
      return;
    }
    if (eventTargetsSubtitleSettingsUi(event, [buttonHost, popoverHost])) {
      return;
    }
    setPopoverOpen(false);
  }

  function onViewportChange(): void {
    if (!popoverOpen) return;
    positionPopover();
  }

  buttonHost.addEventListener('pointerdown', onButtonPointerDown);
  buttonHost.addEventListener('click', onButtonClick);
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
    buttonHost.removeEventListener('pointerdown', onButtonPointerDown);
    buttonHost.removeEventListener('click', onButtonClick);
    popoverRoot.removeEventListener('click', onPopoverClick);
    popoverRoot.removeEventListener('change', onFieldChange);
    buttonHost.remove();
    popoverHost.remove();
  }

  return { destroy, setSettings };
}
