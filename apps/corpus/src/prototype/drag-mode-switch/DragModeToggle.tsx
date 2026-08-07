type DragModeToggleProps = {
  variant: 'A' | 'B' | 'C' | 'D';
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

function GripIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={`h-3.5 w-3.5 ${className}`.trim()}
      aria-hidden
    >
      <circle cx="5" cy="4" r="1.2" />
      <circle cx="11" cy="4" r="1.2" />
      <circle cx="5" cy="8" r="1.2" />
      <circle cx="11" cy="8" r="1.2" />
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="11" cy="12" r="1.2" />
    </svg>
  );
}

export function DragModeToggle({
  variant,
  enabled,
  onChange,
}: DragModeToggleProps) {
  if (variant === 'A') {
    return (
      <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-canvas px-2 py-1">
        <span className="text-[11px] font-medium text-text-secondary">Drag</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          className={[
            'relative h-5 w-9 rounded-full transition-colors',
            enabled ? 'bg-accent' : 'bg-border-strong',
          ].join(' ')}
          onClick={() => onChange(!enabled)}
        >
          <span
            className={[
              'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
              enabled ? 'translate-x-4' : 'translate-x-0',
            ].join(' ')}
          />
        </button>
      </label>
    );
  }

  if (variant === 'B') {
    return (
      <button
        type="button"
        title={enabled ? 'Drag mode on' : 'Drag mode off'}
        aria-pressed={enabled}
        className={[
          'flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
          enabled
            ? 'border-amber-400/60 bg-amber-400/10 text-amber-500 ring-2 ring-amber-400/20'
            : 'border-border bg-canvas text-text-muted hover:bg-surface hover:text-text',
        ].join(' ')}
        onClick={() => onChange(!enabled)}
      >
        <GripIcon />
      </button>
    );
  }

  if (variant === 'C') {
    return (
      <div
        className="flex rounded-lg border border-border bg-canvas p-0.5"
        role="group"
        aria-label="Chat interaction mode"
      >
        <button
          type="button"
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

  return (
    <button
      type="button"
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
        enabled
          ? 'border-amber-400/50 bg-amber-400/10 text-text'
          : 'border-border bg-surface text-text-muted hover:border-border-strong hover:text-text',
      ].join(' ')}
      onClick={() => onChange(!enabled)}
    >
      <GripIcon className={enabled ? 'text-amber-500' : ''} />
      {enabled ? 'Dragging' : 'Drag off'}
    </button>
  );
}
