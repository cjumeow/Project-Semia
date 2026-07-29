import type { SnippetNote } from '../types/corpus';
import { TextDots } from './TextDots';

type NoteCardProps = {
  note: SnippetNote;
  generating?: boolean;
};

const NOTE_FIELDS = [
  { key: 'originalSpeech', label: 'Original Speech', multiline: false },
  { key: 'naturalTranslation', label: 'Natural Translation', multiline: false },
  { key: 'backgroundNote', label: 'Background Note', multiline: true },
] as const satisfies ReadonlyArray<{
  key: keyof SnippetNote;
  label: string;
  multiline: boolean;
}>;

export function NoteCard({ note, generating }: NoteCardProps) {
  return (
    <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      {generating ? (
        <p className="mb-4 text-sm text-text-muted">
          <TextDots>Generating</TextDots>
        </p>
      ) : null}
      <dl className="flex flex-col gap-5">
        {NOTE_FIELDS.map(({ key, label, multiline }) => (
          <NoteField
            key={key}
            label={label}
            value={generating ? '' : note[key]}
            multiline={multiline}
            loading={generating}
          />
        ))}
        {!generating && note.example ? (
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
  loading?: boolean;
};

function NoteField({
  label,
  value,
  isExample,
  multiline,
  loading,
}: NoteFieldProps) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        {label}
      </dt>
      <dd
        className={[
          'mt-1.5 min-h-[1.25rem] text-sm leading-relaxed text-text',
          multiline ? 'whitespace-pre-line' : '',
        ].join(' ')}
      >
        {loading ? null : isExample ? (
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
