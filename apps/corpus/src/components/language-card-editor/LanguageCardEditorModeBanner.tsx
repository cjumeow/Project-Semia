type LanguageCardEditorModeBannerProps = {
  isDraft: boolean;
  editingFocusText?: string;
  onBackToDraft: () => void;
};

export function LanguageCardEditorModeBanner({
  isDraft,
  editingFocusText,
  onBackToDraft,
}: LanguageCardEditorModeBannerProps) {
  return (
    <div className="shrink-0 border-b border-border bg-canvas px-4 py-2">
      <p className="text-xs text-text-secondary">
        {isDraft ? (
          <>
            <span className="font-medium text-accent">Draft</span>
            <span className="text-text-muted"> — building new card</span>
          </>
        ) : (
          <>
            <span className="font-medium text-text">Editing</span>
            <span className="text-text-muted"> · {editingFocusText}</span>
            <button
              type="button"
              className="ml-2 text-[11px] text-accent underline-offset-2 hover:underline"
              onClick={onBackToDraft}
            >
              Back to draft
            </button>
          </>
        )}
      </p>
    </div>
  );
}
