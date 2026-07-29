const WEB_CAPTURE_SCRIPT_ID = 'semia-web-capture';
const WEB_CAPTURE_FILE = 'dist/webContentScript.js';

function isWebPageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    return !parsed.hostname.includes('youtube.com');
  } catch {
    return false;
  }
}

async function hasWebCapturePermission(url: string): Promise<boolean> {
  const origin = `${new URL(url).origin}/*`;
  return chrome.permissions.contains({ origins: [origin] });
}

async function registerWebCaptureScript(): Promise<void> {
  const registered = await chrome.scripting.getRegisteredContentScripts();
  if (registered.some((script) => script.id === WEB_CAPTURE_SCRIPT_ID)) {
    return;
  }

  await chrome.scripting.registerContentScripts([
    {
      id: WEB_CAPTURE_SCRIPT_ID,
      matches: ['http://*/*', 'https://*/*'],
      excludeMatches: [
        'https://www.youtube.com/*',
        'https://youtube.com/*',
        'https://m.youtube.com/*',
      ],
      js: [WEB_CAPTURE_FILE],
      runAt: 'document_idle',
    },
  ]);
}

export async function ensureWebCaptureForUrl(url: string): Promise<boolean> {
  if (!isWebPageUrl(url)) return false;

  const granted = await hasWebCapturePermission(url);
  if (!granted) return false;

  await registerWebCaptureScript();
  return true;
}

export async function requestWebCapturePermission(url: string): Promise<boolean> {
  if (!isWebPageUrl(url)) return false;

  const origin = `${new URL(url).origin}/*`;
  const granted = await chrome.permissions.request({ origins: [origin] });
  if (!granted) return false;

  await registerWebCaptureScript();
  return true;
}

export async function injectWebCaptureNow(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: [WEB_CAPTURE_FILE],
  });
}

export async function ensureWebCaptureForTab(
  tabId: number,
  url: string,
): Promise<void> {
  if (!(await ensureWebCaptureForUrl(url))) return;

  try {
    await injectWebCaptureNow(tabId);
  } catch {
    // Script may already be registered via content script.
  }
}
