import type { CorpusSnippet } from '../types/corpus';
import { corpusRepository } from '../data/corpusRepository';
import { isWebJumpBackReliable } from '@semia/shared';
import { useWebJumpBackHint } from '../hooks/useWebJumpBackHint';
import { JumpBackHintCallout } from './JumpBackHintCallout';
import { SemiaButton } from './SemiaButton';
import { WebIcon } from './SemiaNavIcons';

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
  const webSnippet =
    snippet.anchor.kind === 'web'
      ? {
          id: snippet.id,
          anchor: snippet.anchor,
          selectedText: snippet.selectedText,
        }
      : undefined;
  const { hint: jumpBackHint, resetRestoreStatus } =
    useWebJumpBackHint(webSnippet);
  const canRestore =
    snippet.anchor.kind === 'web' &&
    corpusRepository.isLive() &&
    isWebJumpBackReliable(snippet.anchor);

  const openLabel = canRestore
    ? 'Open at selection'
    : 'Open original page';

  async function handleOpen(): Promise<void> {
    if (snippet.anchor.kind !== 'web') return;

    if (canRestore) {
      resetRestoreStatus();
    }

    try {
      await corpusRepository.openWebCapture(snippet);
    } catch (error) {
      console.error('[Semia] Failed to open web capture:', error);
      window.open(snippet.sourceUrl, '_blank', 'noopener,noreferrer');
    }
  }

  const openAction = (
    <SemiaButton
      variant="accent"
      icon={<ExternalLinkIcon />}
      onClick={() => void handleOpen()}
    >
      {openLabel}
    </SemiaButton>
  );

  return (
    <div className="mx-auto w-[85%] overflow-hidden rounded-xl border border-border bg-surface">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {icon ? (
            <img
              src={icon}
              alt=""
              className="mt-0.5 h-10 w-10 rounded-lg border border-border bg-surface object-contain"
            />
          ) : (
            <div
              className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-canvas"
              aria-hidden
            >
              <WebIcon size={20} className="text-text-muted" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-text">
              {snippet.sourceTitle}
            </p>
            <p className="mt-1 truncate text-xs text-text-muted">
              {snippet.sourceUrl}
            </p>
          </div>
        </div>

        {jumpBackHint ? (
          <div className="mt-4">
            <JumpBackHintCallout
              hint={jumpBackHint}
              action={openAction}
            />
          </div>
        ) : (
          <div className="mt-4 flex justify-end border-t border-border/60 pt-3">
            {openAction}
          </div>
        )}
      </div>
    </div>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

export function webPreviewPropsForSnippet(snippet: CorpusSnippet): {
  snippet: CorpusSnippet;
} {
  return { snippet };
}
