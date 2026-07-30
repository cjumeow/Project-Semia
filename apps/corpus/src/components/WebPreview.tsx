import type { CorpusSnippet } from '../types/corpus';
import { corpusRepository } from '../data/corpusRepository';

function faviconUrl(sourceUrl: string): string {
  try {
    const origin = new URL(sourceUrl).origin;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(origin)}&sz=64`;
  } catch {
    return '';
  }
}

type WebPreviewProps = {
  snippet: CorpusSnippet;
};

export function WebPreview({ snippet }: WebPreviewProps) {
  const icon = faviconUrl(snippet.sourceUrl);
  const canRestore =
    snippet.anchor.kind === 'web' && corpusRepository.isLive();

  async function handleOpen(): Promise<void> {
    if (snippet.anchor.kind !== 'web') return;

    try {
      await corpusRepository.openWebCapture(snippet);
    } catch (error) {
      console.error('[Semia] Failed to open web capture:', error);
      window.open(snippet.sourceUrl, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <div className="mx-auto w-[85%] overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="group block p-5 transition-colors hover:bg-canvas">
        <div className="flex items-start gap-4">
          {icon ? (
            <img
              src={icon}
              alt=""
              className="mt-0.5 h-10 w-10 rounded-lg border border-border bg-white object-contain"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-text">
              {snippet.sourceTitle}
            </p>
            <p className="mt-1 truncate text-xs text-text-muted">
              {snippet.sourceUrl}
            </p>
            <button
              type="button"
              onClick={() => void handleOpen()}
              className="mt-4 text-left text-sm font-medium text-accent hover:underline"
            >
              {canRestore
                ? 'Open original page at selection'
                : 'Open original page'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function webPreviewPropsForSnippet(snippet: CorpusSnippet): {
  snippet: CorpusSnippet;
} {
  return { snippet };
}
