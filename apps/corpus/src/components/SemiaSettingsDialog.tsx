type SemiaSettingsDialogProps = {
  open: boolean;
  darkModeEnabled: boolean;
  contextWindowEnabled: boolean;
  languageCardsProEnabled: boolean;
  languageCardAiSuggestionsEnabled: boolean;
  onClose: () => void;
  onDarkModeEnabledChange: (enabled: boolean) => void;
  onContextWindowEnabledChange: (enabled: boolean) => void;
  onLanguageCardsProEnabledChange: (enabled: boolean) => void;
  onLanguageCardAiSuggestionsEnabledChange: (enabled: boolean) => void;
};

export function SemiaSettingsDialog({
  open,
  darkModeEnabled,
  contextWindowEnabled,
  languageCardsProEnabled,
  languageCardAiSuggestionsEnabled,
  onClose,
  onDarkModeEnabledChange,
  onContextWindowEnabledChange,
  onLanguageCardsProEnabledChange,
  onLanguageCardAiSuggestionsEnabledChange,
}: SemiaSettingsDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="semia-settings-title"
        aria-modal="true"
        className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="semia-settings-title"
              className="font-display text-base font-semibold text-text"
            >
              Settings
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              Corpus display and AI enrichment preferences.
            </p>
          </div>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-xs text-text-muted hover:bg-canvas hover:text-text"
            onClick={onClose}
            aria-label="Close settings"
          >
            Close
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-border bg-canvas/40 px-4 py-4">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-border"
              checked={darkModeEnabled}
              onChange={(event) => {
                onDarkModeEnabledChange(event.target.checked);
              }}
            />
            <span className="min-w-0">
              <span className="block text-base font-medium text-text">
                Dark mode
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed text-text-muted">
                Use the Cursor deep palette for the corpus workspace.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-border bg-canvas/40 px-4 py-4">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-border"
              checked={contextWindowEnabled}
              onChange={(event) => {
                onContextWindowEnabledChange(event.target.checked);
              }}
            />
            <span className="min-w-0">
              <span className="block text-base font-medium text-text">
                Context window
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed text-text-muted">
                After a snippet note is generated, automatically build a
                bilingual context paragraph and show it collapsed on the note
                card.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-border bg-canvas/40 px-4 py-4">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-border"
              checked={languageCardsProEnabled}
              onChange={(event) => {
                onLanguageCardsProEnabledChange(event.target.checked);
              }}
            />
            <span className="min-w-0">
              <span className="block text-base font-medium text-text">
                Language cards (Pro preview)
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed text-text-muted">
                Enable local language card creation while Pro billing is not
                wired yet.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-border bg-canvas/40 px-4 py-4">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-border"
              checked={languageCardAiSuggestionsEnabled}
              onChange={(event) => {
                onLanguageCardAiSuggestionsEnabledChange(event.target.checked);
              }}
            />
            <span className="min-w-0">
              <span className="block text-base font-medium text-text">
                Language card AI suggestions
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed text-text-muted">
                Suggest meaning and example text while drafting language cards
                in the inbox.
              </span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
