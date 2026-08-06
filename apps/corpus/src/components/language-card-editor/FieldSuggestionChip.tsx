type FieldSuggestionChipProps = {
  label: string;
  suggestion: string;
  loading?: boolean;
  onAccept: () => void;
  onDismiss: () => void;
};

export function FieldSuggestionChip({
  label,
  suggestion,
  loading = false,
  onAccept,
  onDismiss,
}: FieldSuggestionChipProps) {
  if (loading) {
    return (
      <div className="mt-2 rounded-lg border border-dashed border-border bg-canvas/60 px-3 py-2 text-[11px] text-text-muted">
        Suggesting {label.toLowerCase()}…
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-accent">
        Suggested {label}
      </p>
      <p className="mt-1 text-sm text-text">{suggestion}</p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          className="rounded-md bg-accent px-2.5 py-1 text-[11px] font-medium text-white hover:brightness-110"
          onClick={onAccept}
        >
          Accept
        </button>
        <button
          type="button"
          className="rounded-md border border-border px-2.5 py-1 text-[11px] text-text-muted hover:bg-canvas hover:text-text"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
