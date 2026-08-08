import type { SettingsPageVariantProps } from './settingsPageShared';
import {
  DefaultFieldsEditor,
  LearningLanguageSelects,
  SettingsShell,
  ToggleRow,
  toggleDefaultField,
} from './settingsPageShared';

/** A — single scroll column with grouped sections */
export function SettingsPageVariantA({ state, onChange }: SettingsPageVariantProps) {
  return (
    <SettingsShell>
      <header className="shrink-0 border-b border-border bg-surface/80 px-6 py-5">
        <h2 className="font-display text-xl font-semibold text-text">Settings</h2>
        <p className="mt-1 text-sm text-text-muted">
          Corpus display, language cards, and learning preferences.
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-2xl space-y-8">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Appearance
            </h3>
            <div className="mt-3 space-y-3">
              <ToggleRow
                title="Dark mode"
                description="Use the Cursor deep palette for the corpus workspace."
                checked={state.darkModeEnabled}
                onChange={(darkModeEnabled) => onChange({ darkModeEnabled })}
              />
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Capture
            </h3>
            <div className="mt-3 space-y-3">
              <ToggleRow
                title="Context window"
                description="After a snippet note is generated, automatically build a bilingual context paragraph and show it collapsed on the note card."
                checked={state.contextWindowEnabled}
                onChange={(contextWindowEnabled) => onChange({ contextWindowEnabled })}
              />
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Language cards
            </h3>
            <div className="mt-3 space-y-4">
              <ToggleRow
                title="AI suggestions"
                description="Suggest Quick Focus keywords from original speech while drafting language cards in the inbox."
                checked={state.languageCardAiSuggestionsEnabled}
                onChange={(languageCardAiSuggestionsEnabled) =>
                  onChange({ languageCardAiSuggestionsEnabled })
                }
              />
              <div className="rounded-xl border border-border bg-surface/60 px-4 py-4">
                <p className="text-sm font-medium text-text">Default fields</p>
                <p className="mt-1 text-xs leading-relaxed text-text-muted">
                  Optional fields to show automatically on every new language card
                  draft. You can still add or remove fields per card in the editor.
                </p>
                <div className="mt-4">
                  <DefaultFieldsEditor
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
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Language learning
            </h3>
            <div className="mt-3 rounded-xl border border-border bg-surface/60 px-4 py-4">
              <p className="text-sm font-medium text-text">Your languages</p>
              <p className="mt-1 text-xs leading-relaxed text-text-muted">
                Learning language is the content you study; native language is used
                for explanations and translations.
              </p>
              <div className="mt-4">
                <LearningLanguageSelects
                  learningLanguage={state.learningLanguage}
                  nativeLanguage={state.nativeLanguage}
                  onLearningChange={(learningLanguage) =>
                    onChange({ learningLanguage })
                  }
                  onNativeChange={(nativeLanguage) => onChange({ nativeLanguage })}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </SettingsShell>
  );
}
