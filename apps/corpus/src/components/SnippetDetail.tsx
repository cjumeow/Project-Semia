import { isYouTubeAnchor } from '@semia/shared';
import type { LanguageCard } from '@semia/shared';
import type { CorpusSnippet } from '../types/corpus';
import { effectiveTriageStatus, snippetSeekSeconds } from '../utils/corpusGrouping';
import { formatTimestamp } from '../utils/youtubeUrl';
import { LinkedLanguageCards } from './LinkedLanguageCards';
import { NoteCard } from './NoteCard';

type SnippetDetailProps = {
  snippet: CorpusSnippet | undefined;
  width?: number;
  embedded?: boolean;
  variant?: 'default' | 'inbox-snip';
  generating?: boolean;
  error?: string | null;
  onRegenerate?: () => void;
  generatingContext?: boolean;
  contextError?: string | null;
  contextWindowEnabled?: boolean;
  onOpenSettings?: () => void;
  onMarkMastered?: () => void;
  languageCards?: LanguageCard[];
  languageCardCount?: number;
  onCreateLanguageCard?: () => void;
  createLanguageCardEnabled?: boolean;
  onOpenLanguageCards?: () => void;
};

export function SnippetDetail({
  snippet,
  width: _width,
  embedded = false,
  variant = 'default',
  generating,
  error,
  onRegenerate,
  generatingContext,
  contextError,
  contextWindowEnabled,
  onOpenSettings,
  onMarkMastered,
  languageCards = [],
  languageCardCount,
  onCreateLanguageCard,
  createLanguageCardEnabled,
  onOpenLanguageCards,
}: SnippetDetailProps) {
  const isInboxSnip = variant === 'inbox-snip';
  const shellClass = embedded
    ? 'flex min-h-0 flex-1 flex-col overflow-hidden bg-surface'
    : 'flex h-full w-full shrink-0 flex-col overflow-y-auto bg-surface';
  const shellStyle = embedded ? undefined : undefined;

  if (!snippet) {
    return (
      <section
        className={
          embedded
            ? 'flex flex-1 items-center justify-center bg-surface'
            : 'flex h-full shrink-0 items-center justify-center bg-surface'
        }
        style={shellStyle}
      >
        <p className="px-6 text-center text-sm text-text-muted">
          Select a snippet to view its note.
        </p>
      </section>
    );
  }

  return (
    <section className={shellClass} style={shellStyle}>
      <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border bg-surface/95 px-5 py-4 backdrop-blur-sm">
        <h2 className="font-reading min-w-0 text-xl font-semibold leading-snug tracking-tight text-text">
          {snippet.selectedText}
        </h2>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {isInboxSnip && languageCardCount && languageCardCount > 0 && onOpenLanguageCards ? (
            <button
              type="button"
              className="rounded-full border border-border bg-canvas px-2.5 py-0.5 text-[10px] font-medium text-text-secondary hover:border-accent/40 hover:text-accent"
              onClick={onOpenLanguageCards}
            >
              {languageCardCount} card{languageCardCount === 1 ? '' : 's'}
            </button>
          ) : null}
          {isYouTubeAnchor(snippet.anchor) ? (
            <span className="rounded-md border border-border bg-canvas px-2 py-0.5 font-mono text-xs tabular-nums text-text-secondary">
              {formatTimestamp(snippetSeekSeconds(snippet) ?? 0)}
            </span>
          ) : null}
          {onRegenerate ? (
            <button
              type="button"
              className="text-xs text-text-muted underline-offset-2 hover:text-text hover:underline disabled:opacity-50"
              onClick={onRegenerate}
              disabled={generating}
            >
              Regenerate
            </button>
          ) : null}
        </div>
      </header>
      <div
        className={
          isInboxSnip
            ? 'language-card-editor-shelf min-h-0 flex-1'
            : 'flex flex-col gap-5 p-5'
        }
      >
        {error ? (
          <p
            className={[
              'rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700',
              isInboxSnip ? 'mb-4' : '',
            ].join(' ')}
          >
            {error}
          </p>
        ) : null}
        <NoteCard
          note={snippet.note}
          highlightSelection={
            snippet.note.originalSpeech.trim() || snippet.selectedText
          }
          generating={generating}
          generatingContext={generatingContext}
          contextError={contextError}
          contextWindowEnabled={contextWindowEnabled}
          onOpenSettings={onOpenSettings}
          languageCardCount={isInboxSnip ? undefined : languageCardCount}
          onOpenLanguageCards={isInboxSnip ? undefined : onOpenLanguageCards}
          onCreateLanguageCard={isInboxSnip ? undefined : onCreateLanguageCard}
          createLanguageCardEnabled={
            isInboxSnip ? false : createLanguageCardEnabled
          }
          onMarkMastered={
            onMarkMastered && effectiveTriageStatus(snippet) === 'review'
              ? onMarkMastered
              : undefined
          }
        />
        {!isInboxSnip && languageCards.length > 0 ? (
          <LinkedLanguageCards cards={languageCards} />
        ) : null}
      </div>
    </section>
  );
}
