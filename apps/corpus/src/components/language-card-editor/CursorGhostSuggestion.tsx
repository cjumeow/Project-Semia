import {
  resolveCursorGhostSuggestionView,
  type CursorGhostSuggestionMode,
} from './cursorGhostSuggestionLogic';

export type CursorGhostSuggestionProps = {
  value: string;
  suggestion: string | null;
  mode?: CursorGhostSuggestionMode;
  multiline?: boolean;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onAccept: () => void;
  onDismiss: () => void;
};

const fieldShellClass =
  'language-card-field-inset language-card-field-input relative overflow-hidden rounded-lg border dark:bg-zinc-800/60 dark:border-zinc-700/80';

const fieldInputClass =
  'relative w-full resize-none bg-transparent px-0 py-0 text-sm text-text caret-accent outline-none';

function InFieldActions({
  loading,
  onAccept,
  onDismiss,
}: {
  loading: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="pointer-events-auto absolute bottom-1.5 right-1.5 z-10 flex overflow-hidden rounded-md border border-border bg-surface/95 shadow-sm backdrop-blur-sm">
      <button
        type="button"
        disabled={loading}
        className="border-r border-border px-2 py-1 text-[10px] font-medium text-text hover:bg-canvas disabled:opacity-50"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onAccept}
      >
        Accept
      </button>
      <button
        type="button"
        className="px-2 py-1 text-[10px] text-text-muted hover:bg-canvas hover:text-text"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onDismiss}
      >
        Dismiss
      </button>
    </div>
  );
}

export function CursorGhostSuggestion({
  value,
  suggestion,
  mode = 'completion',
  multiline = false,
  disabled = false,
  loading = false,
  placeholder,
  className = '',
  inputClassName = '',
  onChange,
  onFocus,
  onBlur,
  onAccept,
  onDismiss,
}: CursorGhostSuggestionProps) {
  const view = resolveCursorGhostSuggestionView({
    value,
    suggestion,
    mode,
    loading,
  });
  const rows = multiline ? Math.max(2, value.split('\n').length) : undefined;
  const inputPaddingRight = view.showActions ? 'pr-24' : '';
  const showPlaceholder = !value && !view.showGhost && !loading;

  return (
    <div className={className}>
      <div
        className={[
          fieldShellClass,
          view.showGhost || loading ? 'ring-1 ring-accent/20' : '',
        ].join(' ')}
      >
        <div
          aria-hidden
          className={[
            'pointer-events-none absolute inset-0 px-3 py-2 text-sm leading-relaxed',
            multiline ? 'whitespace-pre-wrap break-words' : 'flex items-center',
            inputPaddingRight,
          ].join(' ')}
        >
          <span
            className={
              multiline ? 'whitespace-pre-wrap text-transparent' : 'whitespace-pre text-transparent'
            }
          >
            {value}
          </span>
          {view.showBaseFormArrow ? (
            <>
              <span className="whitespace-pre text-text-muted/35"> → </span>
              <span className="whitespace-pre text-text-muted/45">{suggestion}</span>
            </>
          ) : null}
          {view.ghostSuffix ? (
            <span className="whitespace-pre-wrap text-text-muted/45">{view.ghostSuffix}</span>
          ) : null}
          {loading ? (
            <span className="ml-1 text-text-muted/50">…</span>
          ) : null}
        </div>

        <div className={['relative px-3 py-2', inputPaddingRight].join(' ')}>
          {multiline ? (
            <textarea
              value={value}
              disabled={disabled}
              rows={rows}
              placeholder={showPlaceholder ? placeholder : undefined}
              className={[fieldInputClass, 'min-h-[4.5rem]', inputClassName].join(' ')}
              onChange={(event) => onChange(event.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          ) : (
            <input
              type="text"
              value={value}
              disabled={disabled}
              placeholder={showPlaceholder ? placeholder : undefined}
              className={[fieldInputClass, inputClassName].join(' ')}
              onChange={(event) => onChange(event.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          )}
        </div>

        {view.showActions ? (
          <InFieldActions
            loading={loading}
            onAccept={onAccept}
            onDismiss={onDismiss}
          />
        ) : null}
      </div>
    </div>
  );
}
