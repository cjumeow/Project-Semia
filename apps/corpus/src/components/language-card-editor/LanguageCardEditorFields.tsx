import { useState, type ReactNode } from 'react';
import {
  toggleOptionalField,
  type LanguageCardDraftContent,
  type LanguageCardEditorSlotKey,
  type LanguageCardOptionalFieldKey,
} from '@semia/shared';
import type { CorpusSnippet } from '../../types/corpus';
import type { LanguageCardFieldSuggestionsView } from '../../hooks/useLanguageCardFieldSuggestions';
import { FieldSuggestionChip } from './FieldSuggestionChip';
import { FocusSourcePicker } from './FocusSourcePicker';
import { LanguageCardSlotDropZone } from './LanguageCardSlotDropZone';

const OPTIONAL_FIELDS: Array<{
  key: LanguageCardOptionalFieldKey;
  label: string;
  placeholder: string;
  multiline?: boolean;
}> = [
  {
    key: 'example',
    label: 'Example',
    placeholder: 'Example sentence using the focus word or phrase',
    multiline: true,
  },
  {
    key: 'usageNote',
    label: 'Usage note',
    placeholder: 'When or how to use this expression',
    multiline: true,
  },
];

type LanguageCardEditorFieldsProps = {
  snippet?: CorpusSnippet;
  content: LanguageCardDraftContent;
  disabled?: boolean;
  showFocusPicker?: boolean;
  showSuggestions?: boolean;
  suggestions?: LanguageCardFieldSuggestionsView;
  onChange: (patch: Partial<LanguageCardDraftContent>) => void;
  onToggleOptionalField: (
    field: LanguageCardOptionalFieldKey,
    enabled: boolean,
  ) => void;
  onAppendSlot?: (slot: LanguageCardEditorSlotKey, text: string) => void;
};

export function LanguageCardEditorFields({
  snippet,
  content,
  disabled = false,
  showFocusPicker = false,
  showSuggestions = false,
  suggestions,
  onChange,
  onToggleOptionalField,
  onAppendSlot,
}: LanguageCardEditorFieldsProps) {
  const [focusPickerOpen, setFocusPickerOpen] = useState(false);
  const dropEnabled = Boolean(onAppendSlot) && !disabled;

  const wrapDrop = (
    slot: LanguageCardEditorSlotKey,
    node: ReactNode,
    className?: string,
  ) =>
    onAppendSlot ? (
      <LanguageCardSlotDropZone
        slot={slot}
        disabled={!dropEnabled}
        onAppend={onAppendSlot}
        className={className}
      >
        {node}
      </LanguageCardSlotDropZone>
    ) : (
      node
    );

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4">
      <article className="rounded-xl border border-border bg-canvas p-4">
        <div className="relative mb-4">
          <div className="mb-1 flex items-center justify-between gap-2">
            <label className="text-xs font-medium text-text-secondary">Focus</label>
            {showFocusPicker && snippet ? (
              <button
                type="button"
                className="rounded-md border border-border px-2 py-0.5 text-[10px] font-medium text-text-muted hover:bg-surface hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
                disabled={disabled}
                onClick={() => setFocusPickerOpen((open) => !open)}
              >
                Pick from capture
              </button>
            ) : null}
          </div>
          {wrapDrop(
            'focus',
            <input
              type="text"
              value={content.focusText}
              disabled={disabled}
              onChange={(event) => onChange({ focusText: event.target.value })}
              placeholder="Word or phrase from the capture"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
            />,
          )}
          {showFocusPicker && snippet ? (
            <FocusSourcePicker
              open={focusPickerOpen}
              contextWindow={snippet.note.dynamicContextBlock}
              originalSpeech={snippet.note.originalSpeech}
              onClose={() => setFocusPickerOpen(false)}
              onPick={(text) => onChange({ focusText: text })}
            />
          ) : null}
        </div>

        <div className="mb-4">
          <label className="text-xs font-medium text-text-secondary">Meaning</label>
          {wrapDrop(
            'meaning',
            <textarea
              value={content.meaning}
              disabled={disabled}
              onChange={(event) => onChange({ meaning: event.target.value })}
              rows={3}
              placeholder="Explanation in your native language"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
            />,
            'mt-1',
          )}
          {showSuggestions && suggestions?.meaning ? (
            <FieldSuggestionChip
              label="meaning"
              suggestion={suggestions.meaning.text}
              loading={suggestions.meaning.loading}
              onAccept={suggestions.acceptMeaning}
              onDismiss={suggestions.dismissMeaning}
            />
          ) : null}
        </div>

        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
            Optional fields
          </p>
          {OPTIONAL_FIELDS.map((field) => {
            const enabled = content.enabledOptionalFields.includes(field.key);
            return (
              <div key={field.key} className="rounded-lg border border-border bg-surface/60 p-3">
                <label className="flex items-center gap-2 text-xs font-medium text-text-secondary">
                  <input
                    type="checkbox"
                    checked={enabled}
                    disabled={disabled}
                    onChange={(event) => {
                      onToggleOptionalField(field.key, event.target.checked);
                    }}
                  />
                  {field.label}
                </label>
                {enabled ? (
                  wrapDrop(
                    field.key,
                    field.multiline ? (
                      <textarea
                        value={content.optionalSlots[field.key] ?? ''}
                        disabled={disabled}
                        onChange={(event) => {
                          onChange({
                            optionalSlots: {
                              ...content.optionalSlots,
                              [field.key]: event.target.value,
                            },
                          });
                        }}
                        rows={3}
                        placeholder={field.placeholder}
                        className="mt-2 w-full rounded-lg border border-dashed border-border bg-canvas px-3 py-2 text-sm text-text"
                      />
                    ) : (
                      <input
                        type="text"
                        value={content.optionalSlots[field.key] ?? ''}
                        disabled={disabled}
                        onChange={(event) => {
                          onChange({
                            optionalSlots: {
                              ...content.optionalSlots,
                              [field.key]: event.target.value,
                            },
                          });
                        }}
                        placeholder={field.placeholder}
                        className="mt-2 w-full rounded-lg border border-dashed border-border bg-canvas px-3 py-2 text-sm text-text"
                      />
                    ),
                    'mt-2',
                  )
                ) : onAppendSlot ? (
                  <LanguageCardSlotDropZone
                    slot={field.key}
                    disabled={!dropEnabled}
                    onAppend={onAppendSlot}
                    className="mt-2"
                  >
                    <p className="rounded-lg border border-dashed border-border bg-canvas/40 px-3 py-2 text-[11px] text-text-muted">
                      Enable {field.label.toLowerCase()} or drop a chat bullet here
                    </p>
                  </LanguageCardSlotDropZone>
                ) : null}
              </div>
            );
          })}
          {showSuggestions && suggestions?.example ? (
            <FieldSuggestionChip
              label="example"
              suggestion={suggestions.example.text}
              loading={suggestions.example.loading}
              onAccept={suggestions.acceptExample}
              onDismiss={suggestions.dismissExample}
            />
          ) : null}
        </div>
      </article>
    </div>
  );
}

export function applyOptionalFieldToggle(
  content: LanguageCardDraftContent,
  field: LanguageCardOptionalFieldKey,
  enabled: boolean,
): LanguageCardDraftContent {
  return toggleOptionalField(content, field, enabled);
}
