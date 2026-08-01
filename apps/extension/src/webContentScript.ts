import toolbarCss from './webCaptureToolbar.css';
import { submitFragment } from './submitCapture';
import { buildWebFragment } from './web/buildWebFragment';
import { runWebRestoreWithRetry } from './web/runWebRestoreWithRetry';
import {
  restoreWebSelection,
  type WebRestorePayload,
} from './web/restoreWebSelection';

const HOST_ID = 'semia-web-capture-host';
const BOOT_FLAG = '__semiaWebCaptureBooted';

type Toolbar = {
  host: HTMLElement;
  status: HTMLElement;
  button: HTMLButtonElement;
};

/**
 * Host positioning uses CSSOM because it updates every frame-adjacent scroll;
 * panel chrome uses shadow styles (same pattern as LingoPanel).
 */
function applyStyles(el: HTMLElement, styles: Record<string, string>): void {
  for (const [property, value] of Object.entries(styles)) {
    el.style.setProperty(property, value, 'important');
  }
}

function removeToolbar(): void {
  document.getElementById(HOST_ID)?.remove();
}

function setStatus(
  status: HTMLElement,
  text: string,
  tone: 'default' | 'success' | 'error' = 'default',
): void {
  status.textContent = text;
  status.classList.remove(
    'semia-capture-status-success',
    'semia-capture-status-error',
  );
  if (tone === 'success') {
    status.classList.add('semia-capture-status-success');
  } else if (tone === 'error') {
    status.classList.add('semia-capture-status-error');
  }
}

function createToolbar(): Toolbar {
  const host = document.createElement('div');
  host.id = HOST_ID;
  applyStyles(host, {
    position: 'fixed',
    top: '0px',
    left: '0px',
    'z-index': '2147483647',
    margin: '0',
    padding: '0',
    border: '0',
    background: 'transparent',
  });

  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = toolbarCss;
  shadow.appendChild(style);

  const panel = document.createElement('div');
  panel.className = 'semia-capture-toolbar';

  const status = document.createElement('span');
  status.className = 'semia-capture-status';
  status.textContent = 'Capture to SEMIA';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'semia-capture-btn';
  button.textContent = 'Capture';

  panel.append(status, button);
  shadow.append(panel);
  document.body.appendChild(host);

  return { host, status, button };
}

function positionToolbar(host: HTMLElement, rect: DOMRect): void {
  const width = host.offsetWidth || 220;
  const height = host.offsetHeight || 36;
  const top = rect.top > height + 12 ? rect.top - height - 8 : rect.bottom + 8;
  const left = Math.min(
    Math.max(8, rect.left),
    Math.max(8, window.innerWidth - width - 8),
  );

  applyStyles(host, { top: `${top}px`, left: `${left}px` });
}

function showToolbar(range: Range): void {
  removeToolbar();

  const savedRange = range.cloneRange();
  const { host, status, button } = createToolbar();

  // Keep the page selection intact when pressing the button.
  button.addEventListener('mousedown', (event) => {
    event.preventDefault();
    event.stopPropagation();
  });

  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    void capture();
  });

  async function capture(): Promise<void> {
    button.disabled = true;
    setStatus(status, 'Saving…');

    try {
      const result = buildWebFragment(savedRange);
      if (!result.ok) {
        setStatus(
          status,
          result.reason === 'locate-failed'
            ? 'Could not locate selection'
            : 'Could not capture',
          'error',
        );
        button.disabled = false;
        return;
      }

      await submitFragment(result.fragment);
      setStatus(status, 'Saved to SEMIA', 'success');
      window.setTimeout(removeToolbar, 1000);
    } catch (error) {
      console.error('[Semia] Failed to save web capture:', error);
      const message = String(
        error instanceof Error ? error.message : (error ?? ''),
      );
      setStatus(
        status,
        /quota/i.test(message) ? 'Storage full' : 'Save failed',
        'error',
      );
      button.disabled = false;
    }
  }
  positionToolbar(host, range.getBoundingClientRect());
}

function isInsideToolbar(node: EventTarget | null): boolean {
  const host = document.getElementById(HOST_ID);
  if (!host || !(node instanceof Node)) return false;
  return host === node || host.contains(node);
}

function syncToolbarToSelection(): void {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    removeToolbar();
    return;
  }

  const range = selection.getRangeAt(0);
  if (!range.toString().trim()) {
    removeToolbar();
    return;
  }

  showToolbar(range);
}

export function bootWebCapture(): void {
  if (window.location.hostname.includes('youtube.com')) return;

  const scope = window as unknown as Record<string, boolean>;
  if (scope[BOOT_FLAG]) return;
  scope[BOOT_FLAG] = true;

  document.addEventListener('mouseup', (event) => {
    if (isInsideToolbar(event.target)) return;
    window.setTimeout(syncToolbarToSelection, 0);
  });

  document.addEventListener('keyup', (event) => {
    if (!event.shiftKey && event.key !== 'Shift') return;
    window.setTimeout(syncToolbarToSelection, 0);
  });

  document.addEventListener(
    'pointerdown',
    (event) => {
      if (isInsideToolbar(event.target)) return;
      removeToolbar();
    },
    true,
  );

  window.addEventListener('scroll', removeToolbar, { passive: true });

  console.info('[Semia] Web capture ready — select text to capture.');
}

const RESTORE_RETRY_MS = 500;
const RESTORE_MAX_ATTEMPTS = 20;

type PendingRestoreResponse =
  | { ok: true; payload: WebRestorePayload | null }
  | { ok: false; error?: string };

function reportWebRestoreResult(fragmentId: string, ok: boolean): void {
  void chrome.runtime
    .sendMessage({ type: 'WEB_RESTORE_RESULT', fragmentId, ok })
    .catch(() => {});
}

async function tryRestorePendingSelection(): Promise<void> {
  const response = (await chrome.runtime.sendMessage({
    type: 'TAKE_PENDING_WEB_RESTORE',
  })) as PendingRestoreResponse | undefined;

  if (!response?.ok || !response.payload) return;

  const { fragmentId, ...restoreInput } = response.payload;
  const tryOnce = (): boolean =>
    restoreWebSelection(document.body, restoreInput);

  runWebRestoreWithRetry(
    tryOnce,
    { maxAttempts: RESTORE_MAX_ATTEMPTS, intervalMs: RESTORE_RETRY_MS },
    (ok) => reportWebRestoreResult(fragmentId, ok),
  );
}

bootWebCapture();
void tryRestorePendingSelection();
