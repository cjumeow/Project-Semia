import { X } from 'lucide-react';
import { type RefObject } from 'react';
import {
  LANGUAGE_CARD_OPTIONAL_FIELD_DEFS,
  type LanguageCardOptionalFieldKey,
} from '@semia/shared';
import type { LanguageCardEditorSlotKey } from '@semia/shared';
import { CardFieldEditor, type CardFieldEditorHandle } from './CardFieldEditor';
import { CursorGhostSuggestion } from './CursorGhostSuggestion';
import { LanguageCardSlotDropZone } from './LanguageCardSlotDropZone';
import type { LanguageCardFieldSuggestionView } from '../../hooks/useLanguageCardFieldSuggestions';

const CHIP_GHOST_CLASS =
  'rounded-full border border-dashed border-zinc-300 px-2.5 py-1 text-xs text-text-muted transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/60';

type OptionalFieldChipAddersProps = {
  enabledFields: ReadonlyArray<LanguageCardOptionalFieldKey>;
  disabled?: boolean;
  dropEnabled: boolean;
  values: Partial<Record<LanguageCardOptionalFieldKey, string>>;
  editorRefs: Record<
    LanguageCardOptionalFieldKey,
    RefObject<CardFieldEditorHandle | null>
  >;
  showExampleGhost?: boolean;
  exampleSuggestion?: LanguageCardFieldSuggestionView;
  onExampleFocus?: () => void;
  onExampleBlur?: () => void;
  onEnable: (field: LanguageCardOptionalFieldKey) => void;
  onDisable: (field: LanguageCardOptionalFieldKey) => void;
  onChange: (field: LanguageCardOptionalFieldKey, value: string) => void;
  onAppend: (slot: LanguageCardEditorSlotKey, text: string) => void;
};

function OptionalFieldChip({
  label,
  slot,
  disabled,
  dropEnabled,
  onEnable,
  onAppend,
}: {
  label: string;
  slot: LanguageCardOptionalFieldKey;
  disabled: boolean;
  dropEnabled: boolean;
  onEnable: () => void;
  onAppend: (slot: LanguageCardEditorSlotKey, text: string) => void;
}) {
  const chip = (
    <button
      type="button"
      disabled={disabled}
      className={`${CHIP_GHOST_CLASS} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
      onClick={onEnable}
    >
      + {label}
    </button>
  );

  if (!dropEnabled) {
    return chip;
  }

  return (
    <LanguageCardSlotDropZone
      slot={slot}
      disabled={disabled}
      onAppend={onAppend}
      className="inline-flex"
    >
      {chip}
    </LanguageCardSlotDropZone>
  );
}

export function OptionalFieldChipAdders({
  enabledFields,
  disabled = false,
  dropEnabled,
  values,
  editorRefs,
  showExampleGhost = false,
  exampleSuggestion,
  onExampleFocus,
  onExampleBlur,
  onEnable,
  onDisable,
  onChange,
  onAppend,
}: OptionalFieldChipAddersProps) {
  const hiddenFields = LANGUAGE_CARD_OPTIONAL_FIELD_DEFS.filter(
    (field) => !enabledFields.includes(field.key),
  );
  const visibleFields = LANGUAGE_CARD_OPTIONAL_FIELD_DEFS.filter((field) =>
    enabledFields.includes(field.key),
  );

  return (
    <div className="space-y-3">
      {hiddenFields.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
            Add field
          </span>
          {hiddenFields.map((field) => (
            <OptionalFieldChip
              key={field.key}
              label={field.chipLabel}
              slot={field.key}
              disabled={disabled}
              dropEnabled={dropEnabled}
              onEnable={() => onEnable(field.key)}
              onAppend={onAppend}
            />
          ))}
        </div>
      ) : null}

      {visibleFields.map((field) => (
        <div
          key={field.key}
          className="border-t border-zinc-300/50 pt-3 dark:border-zinc-700/50"
        >
          <div className="language-card-field-inset language-card-field-input rounded-lg border p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="text-xs font-medium text-text-secondary">
                {field.fieldLabel}
              </label>
              <button
                type="button"
                className="rounded p-0.5 text-text-muted hover:bg-zinc-200/80 hover:text-red-500 dark:hover:bg-zinc-700"
                aria-label={`Remove ${field.fieldLabel}`}
                disabled={disabled}
                onClick={() => onDisable(field.key)}
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </div>
            {field.key === 'example' &&
            showExampleGhost &&
            !(values.example ?? '').trim() ? (
              <CursorGhostSuggestion
                value={values.example ?? ''}
                suggestion={exampleSuggestion?.suggestion ?? null}
                mode="completion"
                multiline
                disabled={disabled}
                loading={exampleSuggestion?.loading ?? false}
                placeholder={field.placeholder}
                onChange={(nextValue) => onChange(field.key, nextValue)}
                onFocus={onExampleFocus}
                onBlur={onExampleBlur}
                onAccept={() => exampleSuggestion?.accept()}
                onDismiss={() => exampleSuggestion?.dismiss()}
              />
            ) : dropEnabled ? (
              <LanguageCardSlotDropZone
                slot={field.key}
                disabled={disabled}
                onAppend={onAppend}
              >
                <CardFieldEditor
                  ref={editorRefs[field.key]}
                  value={values[field.key] ?? ''}
                  disabled={disabled}
                  placeholder={field.placeholder}
                  onChange={(nextValue) => onChange(field.key, nextValue)}
                />
              </LanguageCardSlotDropZone>
            ) : (
              <CardFieldEditor
                ref={editorRefs[field.key]}
                value={values[field.key] ?? ''}
                disabled={disabled}
                placeholder={field.placeholder}
                onChange={(nextValue) => onChange(field.key, nextValue)}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
