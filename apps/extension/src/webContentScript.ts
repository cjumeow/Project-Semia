import { saveFragment } from './storage';
import { buildWebFragment } from './web/buildWebFragment';

const HOST_ID = 'semia-web-capture-host';
const BOOT_FLAG = '__semiaWebCaptureBooted';

type Toolbar = {
  host: HTMLElement;
  status: HTMLElement;
  button: HTMLButtonElement;
};

/**
 * Styles are applied through CSSOM rather than a <style> element because page
 * CSP can block content-script style blocks, leaving the toolbar invisible.
 */
function applyStyles(el: HTMLElement, styles: Record<string, string>): void {
  for (const [property, value] of Object.entries(styles)) {
    el.style.setProperty(property, value, 'important');
  }
}

function removeToolbar(): void {
  document.getElementById(HOST_ID)?.remove();
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

  const panel = document.createElement('div');
  applyStyles(panel, {
    display: 'flex',
    'align-items': 'center',
    gap: '8px',
    padding: '6px 8px',
    'border-radius': '10px',
    border: '1px solid rgba(0,0,0,0.12)',
    background: '#ffffff',
    'box-shadow': '0 8px 24px rgba(0,0,0,0.18)',
    font: '13px/1.2 system-ui, -apple-system, sans-serif',
    color: '#111827',
    'white-space': 'nowrap',
  });

  const status = document.createElement('span');
  status.textContent = 'Capture to SEMIA';
  applyStyles(status, {
    color: '#4b5563',
    'font-size': '12px',
    font: '12px/1.2 system-ui, -apple-system, sans-serif',
  });

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Capture';
  applyStyles(button, {
    border: '0',
    'border-radius': '8px',
    padding: '6px 10px',
    background: '#111827',
    color: '#ffffff',
    cursor: 'pointer',
    font: '13px/1.2 system-ui, -apple-system, sans-serif',
  });

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
    applyStyles(button, { opacity: '0.6', cursor: 'default' });
    status.textContent = 'Saving…';

    try {
      const fragment = buildWebFragment(savedRange);
      if (!fragment) {
        status.textContent = 'Could not capture selection';
        button.disabled = false;
        applyStyles(button, { opacity: '1', cursor: 'pointer' });
        return;
      }

      await saveFragment(fragment);
      status.textContent = 'Saved to SEMIA';
      window.setTimeout(removeToolbar, 1000);
    } catch (error) {
      console.error('[Semia] Failed to save web capture:', error);
      status.textContent = 'Save failed';
      button.disabled = false;
      applyStyles(button, { opacity: '1', cursor: 'pointer' });
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

bootWebCapture();
