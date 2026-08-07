import { effectiveSnippetUnitType } from '@semia/shared';
import { useEffect, useState } from 'react';
import type { SnippetNote } from '../types/corpus';
import { cardCountBadgeClass } from '../utils/semiaUi';
import { HighlightSelection } from './HighlightSelection';
import { LanguageCardIcon } from './LanguageCardIcon';
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
  onOpenLanguageCards?: () => void;
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
  onOpenLanguageCards,
  onCreateLanguageCard,
  createLanguageCardEnabled = false,
}: NoteCardProps) {
  const noteReady = Boolean(note.generatedAt);
  const illustrativeValue = note.illustrativeExample ?? '';
  const showIllustrativeExample =
    noteReady && !generating && effectiveSnippetUnitType(note) === 'word';

  const showLanguageCardRow =
    createLanguageCardEnabled && onCreateLanguageCard && noteReady && !generating;
  const showCardCount = languageCardCount > 0;
  const showToolbar = showLanguageCardRow || onMarkMastered || showCardCount;

  return (
    <article className="semia-note-card">
      {showToolbar ? (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0 pt-0.5">
            {showLanguageCardRow ? (
              <button
                type="button"
                className="semia-language-card-btn"
                onClick={onCreateLanguageCard}
              >
                <LanguageCardIcon />
                Language card
              </button>
            ) : null}
          </div>
          {showCardCount || onMarkMastered ? (
            <div className="flex shrink-0 flex-col items-end gap-2">
              {showCardCount ? (
                onOpenLanguageCards ? (
                  <button
                    type="button"
                    className={`${cardCountBadgeClass()} underline-offset-2 hover:underline`}
                    onClick={onOpenLanguageCards}
                  >
                    {languageCardCount} card{languageCardCount === 1 ? '' : 's'}
                  </button>
                ) : (
                  <span className={cardCountBadgeClass()}>
                    {languageCardCount} card{languageCardCount === 1 ? '' : 's'}
                  </span>
                )
              ) : null}
              {onMarkMastered ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[10px] font-medium text-text-secondary transition-colors hover:border-emerald-600/30 hover:bg-emerald-50 hover:text-emerald-800"
                  aria-label="Mark as mastered"
                  title="Mark as mastered"
                  onClick={onMarkMastered}
                >
                  <TriageStatusIcon status="review" size={12} />
                  <span aria-hidden>→</span>
                  <TriageStatusIcon status="mastered" size={12} />
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
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
            onOpenSettings={onOpenSettings}
          />
        ) : null}
      </dl>
    </article>
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
    <div className="semia-context-collapsed">
      <button
        type="button"
        className={[
          'flex w-full items-center gap-1.5 px-4 py-3 text-left transition-colors',
          hasContent ? 'hover:bg-black/[0.04]' : 'cursor-default',
        ].join(' ')}
        onClick={() => {
          if (hasContent) {
            setExpanded((current) => !current);
          }
        }}
        aria-expanded={hasContent ? expanded : undefined}
        disabled={!hasContent && !loading}
      >
        {hasContent ? (
          <ContextWindowDisclosureIcon expanded={expanded} />
        ) : null}
        <span className="text-sm font-medium text-text">Context window</span>
      </button>
      {loading ? (
        <div className="semia-context-body px-4 py-3 text-sm text-text-muted">
          <TextDots>Generating</TextDots>
        </div>
      ) : expanded && hasContent ? (
        <div className="semia-context-body px-4 py-3">
          <BilingualBlock
            value={value}
            highlightSelection={highlightSelection}
            highlightMarkClassName="rounded-sm px-0.5 semia-context-highlight"
          />
        </div>
      ) : !hasContent && !loading ? (
        <div className="semia-context-body px-4 py-3 text-sm text-text-muted">
          Waiting for context window…
        </div>
      ) : null}
      {error ? (
        <p className="semia-context-body px-4 py-3 text-sm text-red-700">
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
  highlightMarkClassName,
}: {
  value: string;
  highlightSelection?: string;
  highlightMarkClassName?: string;
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
          <HighlightSelection
            text={original}
            selection={highlightSelection}
            markClassName={highlightMarkClassName}
          />
        ) : (
          original
        )}
      </p>
      {translation ? (
        <p className="semia-field-zh m-0 text-text-secondary">
          {translation}
        </p>
      ) : null}
    </div>
  );
}

function ContextWindowDisclosureIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={[
        'h-[0.85em] w-[0.85em] shrink-0 text-text-muted transition-transform duration-150',
        expanded ? 'rotate-90' : '',
      ].join(' ')}
      viewBox="0 0 10 10"
      fill="currentColor"
      aria-hidden
    >
      <path d="M2.5 1.5 7.5 5 2.5 8.5Z" />
    </svg>
  );
}
