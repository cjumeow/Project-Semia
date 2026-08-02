type SemiaSettingsDialogProps = {
  open: boolean;
  contextWindowEnabled: boolean;
  onClose: () => void;
  onContextWindowEnabledChange: (enabled: boolean) => void;
};

export function SemiaSettingsDialog({
  open,
  contextWindowEnabled,
  onClose,
  onContextWindowEnabledChange,
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
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-canvas/40 px-3 py-3">
            <input
              type="checkbox"
              className="mt-0.5 rounded border-border"
              checked={contextWindowEnabled}
              onChange={(event) => {
                onContextWindowEnabledChange(event.target.checked);
              }}
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-text">
                Context window
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-text-muted">
                After a snippet note is generated, automatically build a
                bilingual context paragraph and show it collapsed on the note
                card.
              </span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
