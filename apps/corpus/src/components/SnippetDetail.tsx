import type { CorpusSnippet } from '../types/corpus';
import { formatTimestamp } from '../utils/youtubeUrl';
import { NoteCard } from './NoteCard';

type SnippetDetailProps = {
  snippet: CorpusSnippet | undefined;
};

export function SnippetDetail({ snippet }: SnippetDetailProps) {
  if (!snippet) {
    return (
      <section className="flex h-full w-[min(380px,32vw)] shrink-0 items-center justify-center border-l border-border bg-surface">
        <p className="px-6 text-center text-sm text-text-muted">
          Select a snippet to view its note.
        </p>
      </section>
    );
  }

  return (
    <section className="flex h-full w-[min(380px,32vw)] shrink-0 flex-col overflow-y-auto border-l border-border bg-surface">
      <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border bg-surface/95 px-5 py-4 backdrop-blur-sm">
        <h2 className="text-lg font-semibold leading-snug tracking-tight text-text">
          {snippet.selectedText}
        </h2>
        <span className="shrink-0 rounded-md border border-border bg-canvas px-2 py-0.5 font-mono text-xs tabular-nums text-text-secondary">
          {formatTimestamp(snippet.start)}
        </span>
      </header>
      <div className="p-5">
        <NoteCard note={snippet.note} />
      </div>
    </section>
  );
}
