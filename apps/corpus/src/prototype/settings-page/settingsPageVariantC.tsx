import type { ReactNode } from 'react';
import type { SettingsPageVariantProps } from './settingsPageShared';
import {
  DefaultFieldsEditor,
  LearningLanguageSelects,
  SettingsShell,
  ToggleRow,
  toggleDefaultField,
} from './settingsPageShared';

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-border bg-surface/70 p-5 shadow-sm">
      <h3 className="font-display text-sm font-semibold text-text">{title}</h3>
      {description ? (
        <p className="mt-1 text-xs leading-relaxed text-text-muted">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </article>
  );
}

/** C — dashboard card grid with chip-style default fields */
export function SettingsPageVariantC({ state, onChange }: SettingsPageVariantProps) {
  return (
    <SettingsShell>
      <header className="shrink-0 border-b border-border bg-surface/80 px-6 py-5">
        <h2 className="font-display text-xl font-semibold text-text">Settings</h2>
        <p className="mt-1 text-sm text-text-muted">
          Quick overview — each card is one concern.
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
          <SettingsCard
            title="Appearance"
            description="Workspace look and feel."
          >
            <ToggleRow
              title="Dark mode"
              description="Cursor deep palette."
              checked={state.darkModeEnabled}
              onChange={(darkModeEnabled) => onChange({ darkModeEnabled })}
            />
          </SettingsCard>

          <SettingsCard
            title="Capture"
            description="Snippet note enrichment."
          >
            <ToggleRow
              title="Context window"
              description="Auto bilingual context on note cards."
              checked={state.contextWindowEnabled}
              onChange={(contextWindowEnabled) => onChange({ contextWindowEnabled })}
            />
          </SettingsCard>

          <SettingsCard
            title="Language card AI"
            description="Inbox draft assistance."
          >
            <ToggleRow
              title="AI suggestions"
              description="Quick Focus chips from original speech."
              checked={state.languageCardAiSuggestionsEnabled}
              onChange={(languageCardAiSuggestionsEnabled) =>
                onChange({ languageCardAiSuggestionsEnabled })
              }
            />
          </SettingsCard>

          <SettingsCard
            title="Default card fields"
            description="Always-on optional fields for new drafts."
          >
            <DefaultFieldsEditor
              layout="chips"
              enabled={state.defaultOptionalFields}
              onToggle={(field) =>
                onChange({
                  defaultOptionalFields: toggleDefaultField(
                    state.defaultOptionalFields,
                    field,
                  ),
                })
              }
            />
            <p className="mt-3 text-[11px] text-text-muted">
              Focus and Meaning are always shown. Toggle extras you want pre-opened.
            </p>
          </SettingsCard>

          <SettingsCard
            title="Language learning"
            description="What you study vs. how we explain it."
          >
            <LearningLanguageSelects
              columns={2}
              learningLanguage={state.learningLanguage}
              nativeLanguage={state.nativeLanguage}
              onLearningChange={(learningLanguage) => onChange({ learningLanguage })}
              onNativeChange={(nativeLanguage) => onChange({ nativeLanguage })}
            />
          </SettingsCard>
        </div>
      </div>
    </SettingsShell>
  );
}
