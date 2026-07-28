const SEMIA_PAGE_PATH = 'dist/corpus/index.html';

export function getSemiaPageUrl(): string {
  return chrome.runtime.getURL(SEMIA_PAGE_PATH);
}

export function openSemiaPage(): void {
  const url = getSemiaPageUrl();
  void chrome.tabs.create({ url });
}
