import { saveFragment } from './storage';
import { buildWebFragment } from './web/buildWebFragment';

const TOOLBAR_ID = 'semia-web-capture-toolbar';

function ensureStyles(): void {
  if (document.getElementById('semia-web-capture-styles')) return;
  const style = document.createElement('style');
  style.id = 'semia-web-capture-styles';
  style.textContent = `
    #${TOOLBAR_ID} {
      position: fixed;
      z-index: 2147483646;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 10px;
      border: 1px solid rgba(0,0,0,0.12);
      background: #fff;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      font: 13px/1.2 system-ui, -apple-system, sans-serif;
      color: #111;
    }
    #${TOOLBAR_ID} button {
      border: none;
      border-radius: 8px;
      padding: 6px 10px;
      background: #111827;
      color: #fff;
      cursor: pointer;
      font: inherit;
    }
    #${TOOLBAR_ID} button:disabled {
      opacity: 0.6;
      cursor: default;
    }
    #${TOOLBAR_ID} .semia-web-status {
      color: #4b5563;
      font-size: 12px;
      white-space: nowrap;
    }
  `;
  document.documentElement.appendChild(style);
}

function hideToolbar(): void {
  document.getElementById(TOOLBAR_ID)?.remove();
}

function showToolbar(range: Range): void {
  ensureStyles();
  hideToolbar();

  const toolbar = document.createElement('div');
  toolbar.id = TOOLBAR_ID;

  const status = document.createElement('span');
  status.className = 'semia-web-status';
  status.textContent = 'Capture selection to SEMIA';

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Capture';

  button.addEventListener('mousedown', (event) => {
    event.preventDefault();
    event.stopPropagation();
  });

  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = 'Saving…';
    try {
      const fragment = buildWebFragment(range);
      if (!fragment) {
        status.textContent = 'Could not capture selection';
        button.disabled = false;
        return;
      }
      await saveFragment(fragment);
      status.textContent = 'Saved to SEMIA';
      window.setTimeout(hideToolbar, 900);
    } catch {
      status.textContent = 'Save failed';
      button.disabled = false;
    }
  });

  toolbar.append(status, button);
  document.documentElement.appendChild(toolbar);

  const rect = range.getBoundingClientRect();
  const top = Math.max(8, rect.top - toolbar.offsetHeight - 8);
  const left = Math.min(
    window.innerWidth - toolbar.offsetWidth - 8,
    Math.max(8, rect.left),
  );
  toolbar.style.top = `${top}px`;
  toolbar.style.left = `${left}px`;
}

function handleSelectionChange(): void {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    hideToolbar();
    return;
  }

  const range = selection.getRangeAt(0);
  const text = range.toString().trim();
  if (!text) {
    hideToolbar();
    return;
  }

  showToolbar(range);
}

function installKeyboardShortcut(): void {
  document.addEventListener('keydown', (event) => {
    if (!event.altKey || event.key.toLowerCase() !== 'z') return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;
    event.preventDefault();
    const toolbar = document.getElementById(TOOLBAR_ID);
    const button = toolbar?.querySelector('button');
    button?.click();
  });
}

function installDismissHandlers(): void {
  document.addEventListener('mousedown', (event) => {
    const toolbar = document.getElementById(TOOLBAR_ID);
    if (!toolbar) return;
    if (event.target instanceof Node && toolbar.contains(event.target)) return;
    hideToolbar();
  });

  document.addEventListener('scroll', hideToolbar, true);
}

export function bootWebCapture(): void {
  if (window.location.hostname.includes('youtube.com')) return;
  document.addEventListener('mouseup', () => {
    window.setTimeout(handleSelectionChange, 0);
  });
  installKeyboardShortcut();
  installDismissHandlers();
}

bootWebCapture();
