type SnippetChatDragModeToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

export function SnippetChatDragModeToggle({
  enabled,
  onChange,
}: SnippetChatDragModeToggleProps) {
  return (
    <div
      className="flex rounded-lg border border-border bg-canvas p-0.5"
      role="group"
      aria-label="Chat interaction mode"
    >
      <button
        type="button"
        aria-pressed={!enabled}
        className={[
          'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors',
          !enabled ? 'bg-surface text-text shadow-sm' : 'text-text-muted',
        ].join(' ')}
        onClick={() => onChange(false)}
      >
        Read
      </button>
      <button
        type="button"
        aria-pressed={enabled}
        className={[
          'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors',
          enabled ? 'bg-amber-400/15 text-text shadow-sm' : 'text-text-muted',
        ].join(' ')}
        onClick={() => onChange(true)}
      >
        Drag
      </button>
    </div>
  );
}
