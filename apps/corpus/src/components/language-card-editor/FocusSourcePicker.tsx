import { useEffect, useRef, useState } from 'react';

type FocusSourceTab = 'context-window' | 'original-speech';

type FocusSourcePickerProps = {
  open: boolean;
  contextWindow?: string;
  originalSpeech: string;
  onClose: () => void;
  onPick: (text: string) => void;
};

function SelectableSourceText({
  text,
  onPick,
  onClose,
}: {
  text: string;
  onPick: (value: string) => void;
  onClose: () => void;
}) {
  const handleMouseUp = () => {
    const selected = window.getSelection()?.toString().trim();
    if (!selected) {
      return;
    }
    onPick(selected);
    onClose();
  };

  return (
    <div
      role="textbox"
      tabIndex={0}
      className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-canvas px-3 py-2 text-sm leading-relaxed text-text selection:bg-accent/20"
      onMouseUp={handleMouseUp}
    >
      {text}
    </div>
  );
}

export function FocusSourcePicker({
  open,
  contextWindow,
  originalSpeech,
  onClose,
  onPick,
}: FocusSourcePickerProps) {
  const hasContextWindow = Boolean(contextWindow?.trim());
  const [tab, setTab] = useState<FocusSourceTab>(
    hasContextWindow ? 'context-window' : 'original-speech',
  );
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setTab(hasContextWindow ? 'context-window' : 'original-speech');
  }, [hasContextWindow, open, originalSpeech]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const activeText =
    tab === 'context-window'
      ? (contextWindow?.trim() ?? '')
      : originalSpeech.trim();

  return (
    <div
      ref={panelRef}
      className="absolute left-0 top-full z-20 mt-2 w-full rounded-xl border border-border bg-surface p-3 shadow-lg"
      role="dialog"
      aria-label="Pick focus from capture"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-text">Pick focus from capture</p>
        <button
          type="button"
          className="rounded px-2 py-0.5 text-[10px] text-text-muted hover:bg-canvas hover:text-text"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      {hasContextWindow ? (
        <div className="mb-2 flex gap-1 rounded-lg bg-canvas p-1">
          <button
            type="button"
            className={[
              'flex-1 rounded-md px-2 py-1 text-[11px] font-medium',
              tab === 'context-window'
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted hover:text-text',
            ].join(' ')}
            onClick={() => setTab('context-window')}
          >
            Context window
          </button>
          <button
            type="button"
            className={[
              'flex-1 rounded-md px-2 py-1 text-[11px] font-medium',
              tab === 'original-speech'
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted hover:text-text',
            ].join(' ')}
            onClick={() => setTab('original-speech')}
          >
            Original speech
          </button>
        </div>
      ) : null}

      <p className="mb-2 text-[10px] text-text-muted">
        Select text below to fill the focus field.
      </p>

      {activeText ? (
        <SelectableSourceText text={activeText} onPick={onPick} onClose={onClose} />
      ) : (
        <p className="text-xs text-text-muted">No source text available.</p>
      )}
    </div>
  );
}
