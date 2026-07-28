import type { SnippetNote } from '../types/corpus';

type NoteCardProps = {
  note: SnippetNote;
  generating?: boolean;
};

export function NoteCard({ note, generating }: NoteCardProps) {
  return (
    <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      {generating ? (
        <p className="mb-4 text-sm text-text-muted">Generating note…</p>
      ) : null}
      <dl className="flex flex-col gap-5">
        <NoteField label="Original Speech" value={note.originalSpeech} />
        <NoteField label="Natural Translation" value={note.naturalTranslation} />
        <NoteField label="Background Note" value={note.backgroundNote} multiline />
        {note.example ? (
          <NoteField label="Example" value={note.example} isExample />
        ) : null}
      </dl>
    </article>
  );
}

type NoteFieldProps = {
  label: string;
  value: string;
  isExample?: boolean;
  multiline?: boolean;
};

function NoteField({ label, value, isExample, multiline }: NoteFieldProps) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        {label}
      </dt>
      <dd
        className={[
          'mt-1.5 text-sm leading-relaxed text-text',
          multiline ? 'whitespace-pre-line' : '',
        ].join(' ')}
      >
        {isExample ? (
          <ul className="list-disc pl-4">
            <li>{value}</li>
          </ul>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
