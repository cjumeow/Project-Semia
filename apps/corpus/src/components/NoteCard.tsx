import { effectiveSnippetUnitType } from '@semia/shared';
import { useEffect, useState } from 'react';
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
  onOpenSettings?: () => void;
  onMarkMastered?: () => void;
  languageCardCount?: number;
  onCreateLanguageCard?: () => void;
  createLanguageCardEnabled?: boolean;
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
  onOpenSettings,
  onMarkMastered,
  languageCardCount = 0,
  onCreateLanguageCard,
  createLanguageCardEnabled = false,
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
      {createLanguageCardEnabled && onCreateLanguageCard && noteReady && !generating ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            className="rounded-md border border-accent/30 bg-accent-soft px-3 py-2 text-sm font-medium text-accent transition-colors hover:border-accent/50 hover:bg-accent-soft/80"
            onClick={onCreateLanguageCard}
          >
            + Language card
          </button>
          {languageCardCount > 0 ? (
            <span className="rounded-md bg-canvas px-2 py-1 font-mono text-[10px] tabular-nums text-text-muted">
              {languageCardCount} card{languageCardCount === 1 ? '' : 's'}
            </span>
          ) : null}
        </div>
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
  onOpenSettings,
}: {
  value: string;
  enabled: boolean;
  highlightSelection?: string;
  loading?: boolean;
  error?: string | null;
  onOpenSettings?: () => void;
}) {
  const hasContent = Boolean(value.trim());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [value]);

  if (!enabled) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-canvas/40 px-4 py-4">
        <p className="text-sm font-medium text-text-secondary">Context window</p>
        <p className="mt-2 text-sm text-text-muted">
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
    <div className="overflow-hidden rounded-lg border border-border bg-canvas/50">
      <button
        type="button"
        className={[
          'flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors',
          hasContent ? 'hover:bg-canvas/80' : 'cursor-default',
        ].join(' ')}
        onClick={() => {
          if (hasContent) {
            setExpanded((current) => !current);
          }
        }}
        aria-expanded={hasContent ? expanded : undefined}
        disabled={!hasContent && !loading}
      >
        <span className="text-sm font-medium text-text">Context window</span>
        {hasContent ? (
          <span className="text-base leading-none text-text-muted" aria-hidden>
            {expanded ? '▾' : '▸'}
          </span>
        ) : null}
      </button>
      {loading ? (
        <div className="border-t border-border px-4 py-3 text-sm text-text-muted">
          <TextDots>Generating</TextDots>
        </div>
      ) : expanded && hasContent ? (
        <div className="border-t border-border px-4 py-3">
          <BilingualBlock
            value={value}
            highlightSelection={highlightSelection}
          />
        </div>
      ) : !hasContent && !loading ? (
        <div className="border-t border-border px-4 py-3 text-sm text-text-muted">
          Waiting for context window…
        </div>
      ) : null}
      {error ? (
        <p className="border-t border-border px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function hasBilingualSplit(value: string): boolean {
  return /\s*---\s*/.test(value);
}

type NoteFieldProps = {
  label: string;
  value: string;
  multiline?: boolean;
  splitBilingual?: boolean;
  highlightSelection?: string;
};

function NoteField({
  label,
  value,
  multiline,
  splitBilingual,
  highlightSelection,
}: NoteFieldProps) {
  return (
    <div>
      <dt className="semia-section-label">{label}</dt>
      <dd
        className={[
          'mt-1.5 min-h-[1.25rem] text-sm leading-relaxed text-text',
          multiline || label === 'Original Speech' || label === 'Natural Translation'
            ? 'font-reading'
            : '',
          multiline ? 'whitespace-pre-line' : '',
        ].join(' ')}
      >
        {splitBilingual ? (
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
