import { FileText, Pencil } from 'lucide-react';

/** Truncate long focus previews in the editing bar and card strip. */
const FOCUS_PREVIEW_MAX_CLASS = 'max-w-48';

type LanguageCardEditorHeaderProps = {
  isDraft: boolean;
  editingFocusText?: string;
  loaded: boolean;
  createEnabled: boolean;
  creating: boolean;
  canCreate: boolean;
  onBackToDraft: () => void;
  onCreate: () => void;
};

export function LanguageCardEditorHeader({
  isDraft,
  editingFocusText,
  loaded,
  createEnabled,
  creating,
  canCreate,
  onBackToDraft,
  onCreate,
}: LanguageCardEditorHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-2">
      <div className="min-w-0 flex-1">
        {isDraft ? (
          <span className="flex items-center gap-1 text-xs text-text-muted">
            <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Draft
          </span>
        ) : (
          <span className="flex min-w-0 items-center gap-1.5 text-xs">
            <span className="flex shrink-0 items-center gap-1 text-text-muted">
              <Pencil className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Editing
            </span>
            {editingFocusText ? (
              <span
                className={[
                  'min-w-0 truncate text-text-muted/70',
                  FOCUS_PREVIEW_MAX_CLASS,
                ].join(' ')}
              >
                {editingFocusText}
              </span>
            ) : null}
            <button
              type="button"
              className="shrink-0 text-[11px] text-accent underline-offset-2 hover:underline"
              onClick={onBackToDraft}
            >
              Back to draft
            </button>
          </span>
        )}
      </div>

      {isDraft ? (
        <button
          type="button"
          className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!createEnabled || creating || !loaded || !canCreate}
          onClick={onCreate}
        >
          {creating ? 'Creating…' : 'Create'}
        </button>
      ) : null}
    </div>
  );
}
