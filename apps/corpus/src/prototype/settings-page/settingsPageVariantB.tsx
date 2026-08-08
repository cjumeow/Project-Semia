import { useState } from 'react';
import type { SettingsPageVariantProps } from './settingsPageShared';
import {
  DefaultFieldsEditor,
  LearningLanguageSelects,
  SettingsShell,
  ToggleRow,
  toggleDefaultField,
} from './settingsPageShared';

type SectionKey = 'appearance' | 'capture' | 'cards' | 'languages';

const SECTIONS: Array<{ key: SectionKey; label: string }> = [
  { key: 'appearance', label: 'Appearance' },
  { key: 'capture', label: 'Capture' },
  { key: 'cards', label: 'Language cards' },
  { key: 'languages', label: 'Languages' },
];

/** B — Cursor-style sidebar nav within settings */
export function SettingsPageVariantB({ state, onChange }: SettingsPageVariantProps) {
  const [section, setSection] = useState<SectionKey>('appearance');
  const current = SECTIONS.find((entry) => entry.key === section)!;

  return (
    <SettingsShell>
      <div className="flex min-h-0 flex-1">
        <nav className="flex w-52 shrink-0 flex-col border-r border-border bg-shelf/50 px-2 py-4">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Settings
          </p>
          <ul className="mt-2 space-y-0.5">
            {SECTIONS.map((entry) => {
              const active = entry.key === section;
              return (
                <li key={entry.key}>
                  <button
                    type="button"
                    className={[
                      'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                      active
                        ? 'bg-accent-soft font-medium text-accent'
                        : 'text-text-secondary hover:bg-canvas hover:text-text',
                    ].join(' ')}
                    onClick={() => setSection(entry.key)}
                  >
                    {entry.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="shrink-0 border-b border-border px-6 py-5">
            <h2 className="font-display text-lg font-semibold text-text">
              {current.label}
            </h2>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-xl space-y-4">
              {section === 'appearance' ? (
                <ToggleRow
                  title="Dark mode"
                  description="Use the Cursor deep palette for the corpus workspace."
                  checked={state.darkModeEnabled}
                  onChange={(darkModeEnabled) => onChange({ darkModeEnabled })}
                />
              ) : null}

              {section === 'capture' ? (
                <ToggleRow
                  title="Context window"
                  description="After a snippet note is generated, automatically build a bilingual context paragraph and show it collapsed on the note card."
                  checked={state.contextWindowEnabled}
                  onChange={(contextWindowEnabled) => onChange({ contextWindowEnabled })}
                />
              ) : null}

              {section === 'cards' ? (
                <>
                  <ToggleRow
                    title="AI suggestions"
                    description="Suggest Quick Focus keywords from original speech while drafting language cards."
                    checked={state.languageCardAiSuggestionsEnabled}
                    onChange={(languageCardAiSuggestionsEnabled) =>
                      onChange({ languageCardAiSuggestionsEnabled })
                    }
                  />
                  <div className="rounded-xl border border-border bg-surface/60 px-4 py-4">
                    <p className="text-sm font-medium text-text">Default fields</p>
                    <p className="mt-1 text-xs text-text-muted">
                      Pre-enable optional fields on every new draft.
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
                </>
              ) : null}

              {section === 'languages' ? (
                <div className="rounded-xl border border-border bg-surface/60 px-4 py-4">
                  <p className="text-sm font-medium text-text">Learning preferences</p>
                  <p className="mt-1 text-xs text-text-muted">
                    Used for subtitles, explanations, and AI output language.
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
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </SettingsShell>
  );
}
