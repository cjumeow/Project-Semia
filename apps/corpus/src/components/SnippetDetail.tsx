import type { CorpusSnippet } from '../types/corpus';
import { useCorpusNote } from '../hooks/useCorpusNote';
import { formatTimestamp } from '../utils/youtubeUrl';
import { MarkdownNote } from './MarkdownNote';
import { NoteCard } from './NoteCard';

type SnippetDetailProps = {
  snippet: CorpusSnippet | undefined;
  width: number;
  generating?: boolean;
  error?: string | null;
  onRegenerate?: () => void;
  generatingContext?: boolean;
  contextError?: string | null;
  onGenerateContext?: () => void;
};

export function SnippetDetail({
  snippet,
  width,
  generating,
  error,
  onRegenerate,
  generatingContext,
  contextError,
  onGenerateContext,
}: SnippetDetailProps) {
  const { markdown, saving, save } = useCorpusNote(snippet?.id);

  if (!snippet) {
    return (
      <section
        className="flex h-full shrink-0 items-center justify-center bg-surface"
        style={{ width }}
      >
        <p className="px-6 text-center text-sm text-text-muted">
          Select a snippet to view its note.
        </p>
      </section>
    );
  }

  return (
    <section
      className="flex h-full shrink-0 flex-col overflow-y-auto bg-surface"
      style={{ width }}
    >
      <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border bg-surface/95 px-5 py-4 backdrop-blur-sm">
        <h2 className="text-lg font-semibold leading-snug tracking-tight text-text">
          {snippet.selectedText}
        </h2>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="rounded-md border border-border bg-canvas px-2 py-0.5 font-mono text-xs tabular-nums text-text-secondary">
            {formatTimestamp(snippet.start)}
          </span>
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
      <div className="flex flex-col gap-5 p-5">
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <NoteCard
          note={snippet.note}
          generating={generating}
          generatingContext={generatingContext}
          contextError={contextError}
          onGenerateContext={onGenerateContext}
        />
        <MarkdownNote
          key={snippet.id}
          markdown={markdown}
          saving={saving}
          onSave={save}
        />
      </div>
    </section>
  );
}
