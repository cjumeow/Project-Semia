import {
  LANGUAGE_CARD_OPTIONAL_FIELD_DEFS,
  LEARNING_LANGUAGE_OPTIONS,
  NATIVE_LANGUAGE_OPTIONS,
  type LanguageCardOptionalFieldKey,
  type LearningLanguageCode,
  type NativeLanguageCode,
} from '@semia/shared';
import type { ReactNode } from 'react';
import { InboxIcon, LibraryIcon, SettingsIcon } from '../../components/SemiaNavIcons';
import type { SettingsPageState } from './settingsPageMockData';

export type SettingsPageVariantProps = {
  state: SettingsPageState;
  onChange: (patch: Partial<SettingsPageState>) => void;
};

export function SettingsShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      <aside className="flex w-[220px] shrink-0 flex-col border-r border-border bg-shelf">
        <header className="border-b border-border px-4 py-4">
          <h1 className="font-display text-lg font-semibold text-text">SEMIA</h1>
          <p className="mt-1 text-[11px] text-text-muted">Prototype · settings page</p>
        </header>
        <nav className="flex-1 space-y-1 p-2">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-text-secondary hover:bg-canvas"
          >
            <InboxIcon size={14} />
            Inbox
            <span className="ml-auto text-[10px] tabular-nums text-text-muted">5</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-text-secondary hover:bg-canvas"
          >
            <LibraryIcon size={14} />
            Library
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md bg-accent-soft px-2 py-2 text-sm text-accent"
          >
            <SettingsIcon size={14} />
            Settings
          </button>
        </nav>
      </aside>
      <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-canvas">{children}</section>
    </div>
  );
}

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

export function LanguageSelect({
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
  layout = 'list',
}: {
  enabled: ReadonlyArray<LanguageCardOptionalFieldKey>;
  onToggle: (field: LanguageCardOptionalFieldKey) => void;
  layout?: 'list' | 'chips';
}) {
  if (layout === 'chips') {
    return (
      <div className="flex flex-wrap gap-2">
        {LANGUAGE_CARD_OPTIONAL_FIELD_DEFS.map((field) => {
          const active = enabled.includes(field.key);
          return (
            <button
              key={field.key}
              type="button"
              className={[
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                active
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-border bg-canvas text-text-muted hover:border-accent/40 hover:text-text',
              ].join(' ')}
              onClick={() => onToggle(field.key)}
            >
              {field.chipLabel}
            </button>
          );
        })}
      </div>
    );
  }

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
  columns = 1,
}: {
  learningLanguage: LearningLanguageCode;
  nativeLanguage: NativeLanguageCode;
  onLearningChange: (code: LearningLanguageCode) => void;
  onNativeChange: (code: NativeLanguageCode) => void;
  columns?: 1 | 2;
}) {
  const gridClass =
    columns === 2
      ? 'grid gap-4 sm:grid-cols-2'
      : 'space-y-4';

  return (
    <div className={gridClass}>
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

export function SettingsStatePanel({ state }: { state: SettingsPageState }) {
  return (
    <pre className="max-h-28 overflow-auto rounded-lg border border-border bg-surface/80 p-3 font-mono text-[10px] leading-relaxed text-text-muted">
      {JSON.stringify(state, null, 2)}
    </pre>
  );
}
