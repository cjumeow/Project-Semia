import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MarkdownNoteProps = {
  markdown: string;
  saving?: boolean;
  onSave: (markdown: string) => Promise<void>;
};

export function MarkdownNote({ markdown, saving = false, onSave }: MarkdownNoteProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(markdown);

  useEffect(() => {
    if (!editing) {
      setDraft(markdown);
    }
  }, [markdown, editing]);

  const cancel = (): void => {
    setDraft(markdown);
    setEditing(false);
  };

  const save = async (): Promise<void> => {
    await onSave(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="semia-section-label">
            My notes
          </h3>
        </div>
        <textarea
          aria-label="My notes"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={8}
          className="w-full resize-y rounded-lg border border-border bg-canvas px-3 py-2.5 font-mono text-sm leading-relaxed text-text outline-none focus:border-border-strong"
          placeholder="Add your own notes in Markdown…"
        />
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary hover:bg-canvas disabled:opacity-50"
            onClick={cancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md border border-border bg-canvas px-3 py-1.5 text-xs font-medium text-text hover:bg-surface disabled:opacity-50"
            onClick={() => void save()}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          My notes
        </h3>
        <button
          type="button"
          className="text-xs text-text-muted underline-offset-2 hover:text-text hover:underline"
          onClick={() => setEditing(true)}
        >
          {markdown ? 'Edit' : 'Add'}
        </button>
      </div>
      {markdown ? (
        <div className="prose-note font-reading text-sm leading-relaxed text-text">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      ) : (
        <button
          type="button"
          className="w-full rounded-lg border border-dashed border-border px-3 py-6 text-left text-sm text-text-muted hover:border-border-strong hover:text-text-secondary"
          onClick={() => setEditing(true)}
        >
          Add your own notes in Markdown…
        </button>
      )}
    </section>
  );
}
