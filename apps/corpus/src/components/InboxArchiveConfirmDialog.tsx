type InboxArchiveConfirmDialogProps = {
  open: boolean;
  dontShowAgain: boolean;
  onDontShowAgainChange: (value: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function InboxArchiveConfirmDialog({
  open,
  dontShowAgain,
  onDontShowAgainChange,
  onCancel,
  onConfirm,
}: InboxArchiveConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-labelledby="inbox-archive-confirm-title"
        aria-modal="true"
        className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="inbox-archive-confirm-title"
          className="font-display text-base font-semibold text-text"
        >
          No language cards yet
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          You have not created any language cards for this capture. Archive anyway?
        </p>
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-canvas/40 px-3 py-3">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-border"
            checked={dontShowAgain}
            onChange={(event) => onDontShowAgainChange(event.target.checked)}
          />
          <span className="text-sm text-text-secondary">Do not show this again</span>
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:bg-canvas"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:brightness-110"
            onClick={onConfirm}
          >
            Archive anyway
          </button>
        </div>
      </div>
    </div>
  );
}
