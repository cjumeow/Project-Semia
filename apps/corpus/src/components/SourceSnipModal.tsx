import type { CorpusSnippet } from '../types/corpus';
import { NoteCard } from './NoteCard';

type SourceSnipModalProps = {
  snippet: CorpusSnippet | undefined;
  contextWindowEnabled: boolean;
  onClose: () => void;
};

export function SourceSnipModal({
  snippet,
  contextWindowEnabled,
  onClose,
}: SourceSnipModalProps) {
  if (!snippet) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="source-snip-modal-title"
        aria-modal="true"
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="font-mono text-[10px] text-text-muted">
          Source · read-only snip note
        </p>
        <h2
          id="source-snip-modal-title"
          className="font-reading mt-2 text-lg font-semibold text-text"
        >
          {snippet.selectedText}
        </h2>
        <p className="mt-1 text-xs text-text-muted">{snippet.sourceTitle}</p>
        <div className="mt-4">
          <NoteCard
            note={snippet.note}
            highlightSelection={
              snippet.note.originalSpeech.trim() || snippet.selectedText
            }
            contextWindowEnabled={contextWindowEnabled}
          />
        </div>
        <button
          type="button"
          className="mt-4 w-full rounded-md border border-border py-2.5 text-sm text-text-secondary hover:bg-canvas"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
