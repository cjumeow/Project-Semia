import { effectiveSnippetUnitType } from '@semia/shared';
import { useRef, type ReactNode } from 'react';
import type { SnippetNote } from '../types/corpus';
import { HighlightSelection } from './HighlightSelection';
import { TextDots } from './TextDots';
import { TriageStatusIcon } from './TriageStatusIcon';

type NoteCardProps = {
  note: SnippetNote;
  highlightSelection?: string;
  generating?: boolean;
  generatingContext?: boolean;
  contextError?: string | null;
  onGenerateContext?: () => void;
  onMarkMastered?: () => void;
  generatingIllustrative?: boolean;
  savingIllustrative?: boolean;
  illustrativeError?: string | null;
  onGenerateIllustrativeExample?: () => void;
  onSaveIllustrativeExample?: (text: string) => void;
};

const NOTE_FIELDS = [
  { key: 'originalSpeech', label: 'Original Speech', multiline: false, splitBilingual: false },
  { key: 'naturalTranslation', label: 'Natural Translation', multiline: false, splitBilingual: false },
  {
    key: 'dynamicContextBlock',
    label: 'Context Window',
    multiline: true,
    splitBilingual: true,
  },
  { key: 'backgroundNote', label: 'Background Note', multiline: true, splitBilingual: false },
] as const satisfies ReadonlyArray<{
  key: keyof SnippetNote;
  label: string;
  multiline: boolean;
  splitBilingual: boolean;
}>;

export function NoteCard({
  note,
  highlightSelection,
  generating,
  generatingContext,
  contextError,
  onGenerateContext,
  onMarkMastered,
  generatingIllustrative,
  savingIllustrative,
  illustrativeError,
  onGenerateIllustrativeExample,
  onSaveIllustrativeExample,
}: NoteCardProps) {
  const noteReady = Boolean(note.generatedAt);
  const contextReady = Boolean(note.dynamicContextBlock?.trim());
  const showIllustrativeExample =
    noteReady && !generating && effectiveSnippetUnitType(note) === 'word';

  return (
    <div className="relative">
      {onMarkMastered ? (
        <button
          type="button"
          className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[10px] font-medium text-text-secondary shadow-sm transition-colors hover:border-emerald-600/30 hover:bg-emerald-50 hover:text-emerald-800"
          aria-label="Mark as mastered"
          title="Mark as mastered"
          onClick={onMarkMastered}
        >
          <TriageStatusIcon status="review" size={12} />
          <span aria-hidden>→</span>
          <TriageStatusIcon status="mastered" size={12} />
        </button>
      ) : null}
      <article className="rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(28,25,23,0.04)]">
      {generating ? (
        <p className="mb-4 text-sm text-text-muted">
          <TextDots>Generating</TextDots>
        </p>
      ) : null}
      <dl className="flex flex-col gap-5">
        {NOTE_FIELDS.map(({ key, label, multiline, splitBilingual }) => {
          const isContextField = key === 'dynamicContextBlock';
          const raw = generating && !isContextField ? '' : (note[key] ?? '');
          const value = formatFieldValue(key, raw, noteReady, generating ?? false);
          const showContextAction =
            isContextField && noteReady && onGenerateContext && !generating;

          return (
            <NoteField
              key={key}
              label={label}
              value={value}
              multiline={multiline}
              splitBilingual={splitBilingual && hasBilingualSplit(value)}
              highlightSelection={
                isContextField ? highlightSelection : undefined
              }
              loading={isContextField ? generatingContext : generating}
              headerAction={
                showContextAction ? (
                  <ContextWindowButton
                    onClick={onGenerateContext}
                    disabled={generating || generatingContext}
                    hasContent={contextReady}
                  />
                ) : undefined
              }
            />
          );
        })}
        {showIllustrativeExample ? (
          <IllustrativeExampleField
            value={note.illustrativeExample ?? ''}
            generating={generatingIllustrative}
            saving={savingIllustrative}
            onGenerate={onGenerateIllustrativeExample}
            onSave={onSaveIllustrativeExample}
          />
        ) : null}
      </dl>
      {illustrativeError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {illustrativeError}
        </p>
      ) : null}
      {contextError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {contextError}
        </p>
      ) : null}
      </article>
    </div>
  );
}

function IllustrativeExampleField({
  value,
  generating,
  saving,
  onGenerate,
  onSave,
}: {
  value: string;
  generating?: boolean;
  saving?: boolean;
  onGenerate?: () => void;
  onSave?: (text: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = () => {
    if (textareaRef.current && onSave) {
      onSave(textareaRef.current.value);
    }
    onGenerate?.();
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <dt className="semia-section-label">Illustrative example</dt>
        {onGenerate ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-border bg-canvas px-2 py-1 font-mono text-[11px] font-medium text-text-secondary transition-colors hover:border-accent/40 hover:bg-accent-soft hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleGenerate}
            disabled={generating || saving}
          >
            {value.trim() ? 'Regenerate' : 'Generate'}
          </button>
        ) : null}
      </div>
      <dd className="mt-1.5">
        {generating ? (
          <p className="text-sm text-text-muted">
            <TextDots>Generating</TextDots>
          </p>
        ) : onSave ? (
          <textarea
            ref={textareaRef}
            key={value}
            className="w-full rounded-md border border-border bg-canvas px-3 py-2 font-reading text-sm leading-relaxed text-text"
            rows={3}
            placeholder="Optional — generate or type your own example sentence"
            defaultValue={value}
            disabled={saving}
            onBlur={(event) => {
              const next = event.target.value;
              if (next !== value) {
                onSave(next);
              }
            }}
          />
        ) : (
          <p className="text-sm text-text-secondary">{value || '—'}</p>
        )}
      </dd>
    </div>
  );
}

function ContextWindowButton({
  onClick,
  disabled,
  hasContent,
}: {
  onClick: () => void;
  disabled?: boolean;
  hasContent: boolean;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-md border border-border bg-canvas px-2 py-1 font-mono text-[11px] font-medium text-text-secondary transition-colors hover:border-accent/40 hover:bg-accent-soft hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
      onClick={onClick}
      disabled={disabled}
      aria-label={hasContent ? 'Regenerate context window' : 'Generate context window'}
      title={hasContent ? 'Regenerate context window' : 'Generate context window'}
    >
      <PencilSparklesIcon />
      {hasContent ? 'Regenerate' : 'Generate'}
    </button>
  );
}

function PencilSparklesIcon() {
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
      <path d="M10 3H8" />
      <path d="m15.007 5.008 3.987 3.986" />
      <path d="M20 15v4" />
      <path d="M21.174 6.813a2.82 2.82 0 0 0-3.986-3.987L3.842 16.175a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      <path d="M22 17h-4" />
      <path d="M4 5v4" />
      <path d="M6 7H2" />
      <path d="M9 2v2" />
    </svg>
  );
}

function formatFieldValue(
  key: keyof SnippetNote,
  raw: string,
  noteReady: boolean,
  generating: boolean,
): string {
  if (generating || raw.trim()) {
    return raw;
  }

  if (key === 'dynamicContextBlock') {
    if (!noteReady) {
      return 'Available after the snippet note is generated.';
    }
    return 'Click Generate to build a bilingual context paragraph.';
  }

  return raw;
}

function hasBilingualSplit(value: string): boolean {
  return /\s*---\s*/.test(value);
}

type NoteFieldProps = {
  label: string;
  value: string;
  isExample?: boolean;
  multiline?: boolean;
  splitBilingual?: boolean;
  highlightSelection?: string;
  loading?: boolean;
  headerAction?: ReactNode;
};

function NoteField({
  label,
  value,
  isExample,
  multiline,
  splitBilingual,
  highlightSelection,
  loading,
  headerAction,
}: NoteFieldProps) {
  const isPlaceholder =
    value === 'Click Generate to build a bilingual context paragraph.' ||
    value === 'Available after the snippet note is generated.';

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <dt className="semia-section-label">
          {label}
        </dt>
        {headerAction}
      </div>
      <dd
        className={[
          'mt-1.5 min-h-[1.25rem] text-sm leading-relaxed',
          multiline || label === 'Original Speech' || label === 'Natural Translation'
            ? 'font-reading'
            : '',
          multiline ? 'whitespace-pre-line' : '',
          !loading && isPlaceholder ? 'text-text-muted' : 'text-text',
        ].join(' ')}
      >
        {loading ? (
          <TextDots>Generating</TextDots>
        ) : isExample ? (
          <ul className="list-disc pl-4">
            <li>{value}</li>
          </ul>
        ) : splitBilingual ? (
          <BilingualBlock
            value={value}
            highlightSelection={highlightSelection}
          />
        ) : (
          value || '—'
        )}
      </dd>
    </div>
  );
}

function BilingualBlock({
  value,
  highlightSelection,
}: {
  value: string;
  highlightSelection?: string;
}) {
  const parts = value.split(/\s*---\s*/);
  const original = parts[0]?.trim() ?? '';
  const translation = parts.slice(1).join(' --- ').trim();

  if (!original && !translation) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="m-0">
        {highlightSelection?.trim() ? (
          <HighlightSelection text={original} selection={highlightSelection} />
        ) : (
          original
        )}
      </p>
      {translation ? (
        <>
          <div className="border-t border-border" />
          <p className="m-0 text-text-secondary">{translation}</p>
        </>
      ) : null}
    </div>
  );
}
