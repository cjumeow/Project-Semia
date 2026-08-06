import {
  toggleOptionalField,
  type LanguageCardDraftContent,
  type LanguageCardOptionalFieldKey,
} from '@semia/shared';

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
  content: LanguageCardDraftContent;
  disabled?: boolean;
  onChange: (patch: Partial<LanguageCardDraftContent>) => void;
  onToggleOptionalField: (
    field: LanguageCardOptionalFieldKey,
    enabled: boolean,
  ) => void;
};

export function LanguageCardEditorFields({
  content,
  disabled = false,
  onChange,
  onToggleOptionalField,
}: LanguageCardEditorFieldsProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4">
      <article className="rounded-xl border border-border bg-canvas p-4">
        <div className="mb-4">
          <label className="text-xs font-medium text-text-secondary">Focus</label>
          <input
            type="text"
            value={content.focusText}
            disabled={disabled}
            onChange={(event) => onChange({ focusText: event.target.value })}
            placeholder="Word or phrase from the capture"
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
          />
        </div>

        <div className="mb-4">
          <label className="text-xs font-medium text-text-secondary">Meaning</label>
          <textarea
            value={content.meaning}
            disabled={disabled}
            onChange={(event) => onChange({ meaning: event.target.value })}
            rows={3}
            placeholder="Explanation in your native language"
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
          />
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
                  )
                ) : null}
              </div>
            );
          })}
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
