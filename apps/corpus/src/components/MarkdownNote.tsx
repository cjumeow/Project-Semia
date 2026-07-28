import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MarkdownNoteProps = {
  markdown: string;
  onSave: (markdown: string) => Promise<void>;
};

export function MarkdownNote({ markdown, onSave }: MarkdownNoteProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(markdown);
  const [saving, setSaving] = useState(false);

  const cancel = (): void => {
    setDraft(markdown);
    setEditing(false);
  };

  const save = async (): Promise<void> => {
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <section className="markdown-note">
        <textarea
          aria-label="Markdown note"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <div className="markdown-note__actions">
          <button type="button" onClick={cancel} disabled={saving}>
            Cancel
          </button>
          <button type="button" onClick={() => void save()} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="markdown-note">
      <button type="button" onClick={() => setEditing(true)}>
        Edit
      </button>
      {markdown ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      ) : (
        <button
          type="button"
          className="empty-note"
          onClick={() => setEditing(true)}
        >
          Add notes…
        </button>
      )}
    </section>
  );
}
