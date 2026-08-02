import type { LanguageCard } from '@semia/shared';
import { LanguageCardView } from './LanguageCardView';

type LanguageCardPreviewModalProps = {
  card: LanguageCard | null | undefined;
  onClose: () => void;
};

export function LanguageCardPreviewModal({
  card,
  onClose,
}: LanguageCardPreviewModalProps) {
  if (!card) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="language-card-preview-title"
        aria-modal="true"
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="font-mono text-[10px] text-text-muted">
          Language card created
        </p>
        <h2
          id="language-card-preview-title"
          className="font-reading mt-2 text-xl font-semibold text-text"
        >
          {card.focus}
        </h2>
        <p className="mt-1 text-xs text-text-muted">{card.focusText}</p>
        <div className="mt-4">
          <LanguageCardView card={card} />
        </div>
        <button
          type="button"
          className="mt-5 w-full rounded-md border border-border py-2.5 text-sm text-text-secondary hover:bg-canvas"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
