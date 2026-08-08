import {
  LANGUAGE_CARD_OPTIONAL_FIELD_DEFS,
  LEARNING_LANGUAGE_OPTIONS,
  NATIVE_LANGUAGE_OPTIONS,
  type LanguageCardOptionalFieldKey,
  type LearningLanguageCode,
  type NativeLanguageCode,
} from '@semia/shared';

export function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-border bg-surface/60 px-4 py-4 transition-colors hover:bg-surface">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-border"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-text">{title}</span>
        <span className="mt-1 block text-xs leading-relaxed text-text-muted">
          {description}
        </span>
      </span>
    </label>
  );
}

function LanguageSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: ReadonlyArray<{ code: string; label: string }>;
  onChange: (code: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      <select
        className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function DefaultFieldsEditor({
  enabled,
  onToggle,
}: {
  enabled: ReadonlyArray<LanguageCardOptionalFieldKey>;
  onToggle: (field: LanguageCardOptionalFieldKey) => void;
}) {
  return (
    <div className="space-y-2">
      {LANGUAGE_CARD_OPTIONAL_FIELD_DEFS.map((field) => {
        const active = enabled.includes(field.key);
        return (
          <label
            key={field.key}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-canvas/40 px-3 py-2.5"
          >
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              checked={active}
              onChange={() => onToggle(field.key)}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-text">
                {field.fieldLabel}
              </span>
              <span className="block text-[11px] text-text-muted">
                {field.placeholder}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

export function toggleDefaultField(
  current: ReadonlyArray<LanguageCardOptionalFieldKey>,
  field: LanguageCardOptionalFieldKey,
): LanguageCardOptionalFieldKey[] {
  return current.includes(field)
    ? current.filter((key) => key !== field)
    : [...current, field];
}

export function LearningLanguageSelects({
  learningLanguage,
  nativeLanguage,
  onLearningChange,
  onNativeChange,
}: {
  learningLanguage: LearningLanguageCode;
  nativeLanguage: NativeLanguageCode;
  onLearningChange: (code: LearningLanguageCode) => void;
  onNativeChange: (code: NativeLanguageCode) => void;
}) {
  return (
    <div className="space-y-4">
      <LanguageSelect
        label="Learning language"
        value={learningLanguage}
        options={LEARNING_LANGUAGE_OPTIONS}
        onChange={(code) => onLearningChange(code as LearningLanguageCode)}
      />
      <LanguageSelect
        label="Native language"
        value={nativeLanguage}
        options={NATIVE_LANGUAGE_OPTIONS}
        onChange={(code) => onNativeChange(code as NativeLanguageCode)}
      />
    </div>
  );
}
