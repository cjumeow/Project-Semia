import { buildTextFragmentUrl } from '@semia/shared';
import type { CorpusSnippet } from '../types/corpus';

function faviconUrl(sourceUrl: string): string {
  try {
    const origin = new URL(sourceUrl).origin;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(origin)}&sz=64`;
  } catch {
    return '';
  }
}

type WebPreviewProps = {
  sourceUrl: string;
  title: string;
  textQuote?: {
    exact: string;
    prefix?: string;
    suffix?: string;
  };
};

export function WebPreview({ sourceUrl, title, textQuote }: WebPreviewProps) {
  const href = textQuote
    ? buildTextFragmentUrl(sourceUrl, textQuote)
    : sourceUrl;
  const icon = faviconUrl(sourceUrl);

  return (
    <div className="mx-auto w-[85%] overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group block p-5 transition-colors hover:bg-canvas"
        aria-label={`Open "${title}" on the original page`}
      >
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
              {title}
            </p>
            <p className="mt-1 truncate text-xs text-text-muted">{sourceUrl}</p>
            <p className="mt-4 text-sm font-medium text-accent group-hover:underline">
              Open original page
              {textQuote ? ' and highlight selection' : ''}
            </p>
          </div>
        </div>
      </a>
    </div>
  );
}

export function webPreviewPropsForSnippet(snippet: CorpusSnippet): WebPreviewProps {
  return {
    sourceUrl: snippet.sourceUrl,
    title: snippet.sourceTitle,
    textQuote:
      snippet.anchor.kind === 'web' ? snippet.anchor.textQuote : undefined,
  };
}
