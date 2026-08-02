import { effectiveSnippetUnitType } from '@semia/shared';
import { useEffect, useState, type ReactNode } from 'react';
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
  contextWindowEnabled?: boolean;
  onGenerateContext?: () => void;
  onOpenSettings?: () => void;
  onMarkMastered?: () => void;
};

const NOTE_FIELDS = [
  { key: 'originalSpeech', label: 'Original Speech', multiline: false, splitBilingual: false },
  { key: 'naturalTranslation', label: 'Natural Translation', multiline: false, splitBilingual: false },
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
  contextWindowEnabled = true,
  onGenerateContext,
  onOpenSettings,
  onMarkMastered,
}: NoteCardProps) {
  const noteReady = Boolean(note.generatedAt);
  const illustrativeValue = note.illustrativeExample ?? '';
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
          const raw = generating ? '' : (note[key] ?? '');

          return (
            <NoteField
              key={key}
              label={label}
              value={raw}
              multiline={multiline}
              splitBilingual={splitBilingual && hasBilingualSplit(raw)}
            />
          );
        })}
        {showIllustrativeExample ? (
          <NoteField
            label="Illustrative example"
            value={illustrativeValue}
            multiline
            splitBilingual={hasBilingualSplit(illustrativeValue)}
            highlightSelection={note.originalSpeech.trim() || highlightSelection}
          />
        ) : null}
        {noteReady && !generating ? (
          <ContextWindowSection
            value={note.dynamicContextBlock ?? ''}
            enabled={contextWindowEnabled}
            highlightSelection={highlightSelection}
            loading={generatingContext}
            error={contextError}
            onGenerateContext={onGenerateContext}
            onOpenSettings={onOpenSettings}
          />
        ) : null}
      </dl>
      </article>
    </div>
  );
}

function ContextWindowSection({
  value,
  enabled,
  highlightSelection,
  loading,
  error,
  onGenerateContext,
  onOpenSettings,
}: {
  value: string;
  enabled: boolean;
  highlightSelection?: string;
  loading?: boolean;
  error?: string | null;
  onGenerateContext?: () => void;
  onOpenSettings?: () => void;
}) {
  const hasContent = Boolean(value.trim());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [value]);

  if (!enabled) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-canvas/40 px-3 py-3">
        <p className="semia-section-label">Context window</p>
        <p className="mt-1.5 text-sm text-text-muted">
          Context window is turned off.{' '}
          {onOpenSettings ? (
            <button
              type="button"
              className="text-accent underline-offset-2 hover:underline"
              onClick={onOpenSettings}
            >
              Enable in Settings
            </button>
          ) : (
            'Enable it in Settings.'
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-canvas/50">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={() => {
            if (hasContent) {
              setExpanded((current) => !current);
            }
          }}
          aria-expanded={hasContent ? expanded : undefined}
          disabled={!hasContent && !loading}
        >
          <span className="semia-section-label">Context window</span>
          {hasContent ? (
            <span className="font-mono text-[10px] text-text-muted">
              {expanded ? '▾' : '▸'}
            </span>
          ) : null}
        </button>
        {expanded && hasContent && onGenerateContext ? (
          <ContextWindowRegenerateButton
            onClick={onGenerateContext}
            disabled={loading}
          />
        ) : null}
      </div>
      {loading ? (
        <div className="border-t border-border px-3 py-2 text-sm text-text-muted">
          <TextDots>Generating</TextDots>
        </div>
      ) : expanded && hasContent ? (
        <div className="border-t border-border px-3 py-3">
          <BilingualBlock
            value={value}
            highlightSelection={highlightSelection}
          />
        </div>
      ) : !hasContent && !loading ? (
        <div className="border-t border-border px-3 py-2 text-sm text-text-muted">
          Waiting for context window…
        </div>
      ) : null}
      {error ? (
        <p className="border-t border-border px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ContextWindowRegenerateButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 font-mono text-[11px] font-medium text-text-secondary transition-colors hover:border-accent/40 hover:bg-accent-soft hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
      onClick={onClick}
      disabled={disabled}
      aria-label="Regenerate context window"
      title="Regenerate context window"
    >
      <PencilSparklesIcon />
      Regenerate
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
          'text-text',
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
      <p className="m-0 text-sm leading-relaxed text-text">
        {highlightSelection?.trim() ? (
          <HighlightSelection text={original} selection={highlightSelection} />
        ) : (
          original
        )}
      </p>
      {translation ? (
        <>
          <div className="border-t border-border" />
          <p className="m-0 text-sm leading-relaxed text-text-secondary">
            {translation}
          </p>
        </>
      ) : null}
    </div>
  );
}
