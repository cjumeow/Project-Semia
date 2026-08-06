import { useCallback, useEffect, useState } from 'react';
import type { LanguageCard } from '@semia/shared';
import {
  canCreateLanguageCard,
  type LanguageCardDraftContent,
  type LanguageCardOptionalFieldKey,
} from '@semia/shared';
import type { CorpusSnippet } from '../../types/corpus';
import { useLanguageCardDraft } from '../../hooks/useLanguageCardDraft';
import { useLanguageCardEstablishedEdit } from '../../hooks/useLanguageCardEstablishedEdit';
import {
  createInitialEditorState,
  startDraftEditor,
  startEditEstablishedCard,
  type EditorWorkspaceState,
} from '../../utils/languageCardInboxWorkspaceModel';
import { corpusRepository } from '../../data/corpusRepository';
import { EstablishedCardsStrip } from './EstablishedCardsStrip';
import {
  applyOptionalFieldToggle,
  LanguageCardEditorFields,
} from './LanguageCardEditorFields';
import { LanguageCardEditorModeBanner } from './LanguageCardEditorModeBanner';

type LanguageCardsTabProps = {
  snippet: CorpusSnippet | undefined;
  languageCards: LanguageCard[];
  createEnabled: boolean;
  onCardsChanged: () => Promise<void>;
};

function saveStateLabel(
  saveState: 'idle' | 'saving' | 'saved' | 'error',
): string {
  switch (saveState) {
    case 'saving':
      return 'Saving…';
    case 'saved':
      return 'Saved';
    case 'error':
      return 'Could not save';
    default:
      return 'Auto-saves';
  }
}

export function LanguageCardsTab({
  snippet,
  languageCards,
  createEnabled,
  onCardsChanged,
}: LanguageCardsTabProps) {
  const [editorState, setEditorState] =
    useState<EditorWorkspaceState>(createInitialEditorState);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const isDraftMode = editorState.mode === 'draft';
  const editingCard = languageCards.find(
    (card) => card.id === editorState.editingCardId,
  );

  const {
    draft,
    loaded: draftLoaded,
    saveState: draftSaveState,
    updateDraft,
    flushDraft,
    resetDraftToCapture,
  } = useLanguageCardDraft(snippet?.id);

  const {
    content: editContent,
    loaded: editLoaded,
    saveState: editSaveState,
    updateContent,
    flushContent,
  } = useLanguageCardEstablishedEdit(editingCard, !isDraftMode);

  useEffect(() => {
    setEditorState(createInitialEditorState());
  }, [snippet?.id]);

  useEffect(() => {
    if (!snippet || !draftLoaded || !isDraftMode) {
      return;
    }

    if (
      draft.focusText.trim().length === 0 &&
      snippet.selectedText.trim().length > 0
    ) {
      updateDraft({ focusText: snippet.selectedText });
    }
  }, [draft, draftLoaded, isDraftMode, snippet, updateDraft]);

  const editorContent: LanguageCardDraftContent = isDraftMode
    ? draft
    : editContent;
  const editorLoaded = isDraftMode ? draftLoaded : editLoaded;
  const saveState = isDraftMode ? draftSaveState : editSaveState;

  const handleContentChange = useCallback(
    (patch: Partial<LanguageCardDraftContent>) => {
      if (isDraftMode) {
        updateDraft(patch);
        return;
      }
      updateContent(patch);
    },
    [isDraftMode, updateContent, updateDraft],
  );

  const handleToggleOptionalField = useCallback(
    (field: LanguageCardOptionalFieldKey, enabled: boolean) => {
      const next = applyOptionalFieldToggle(editorContent, field, enabled);
      handleContentChange({
        enabledOptionalFields: next.enabledOptionalFields,
        optionalSlots: next.optionalSlots,
      });
    },
    [editorContent, handleContentChange],
  );

  const switchToDraft = useCallback(async () => {
    if (!isDraftMode) {
      await flushContent();
    }
    setEditorState(startDraftEditor());
  }, [flushContent, isDraftMode]);

  const switchToEdit = useCallback(
    async (cardId: string) => {
      if (isDraftMode) {
        await flushDraft();
      } else {
        await flushContent();
      }
      setEditorState(startEditEstablishedCard(cardId));
    },
    [flushContent, flushDraft, isDraftMode],
  );

  const handleNewDraft = useCallback(async () => {
    if (!snippet) return;
    if (isDraftMode) {
      await flushDraft();
    } else {
      await flushContent();
    }
    setEditorState(startDraftEditor());
    resetDraftToCapture(snippet.selectedText);
  }, [flushContent, flushDraft, isDraftMode, resetDraftToCapture, snippet]);

  const handleCreate = useCallback(async () => {
    if (!snippet || !createEnabled || !canCreateLanguageCard(draft)) {
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      await flushDraft();
      await corpusRepository.createLanguageCardFromDraft(snippet, draft);
      await onCardsChanged();
      resetDraftToCapture(snippet.selectedText);
      setEditorState(startDraftEditor());
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : 'Failed to create language card.',
      );
    } finally {
      setCreating(false);
    }
  }, [
    createEnabled,
    draft,
    flushDraft,
    onCardsChanged,
    resetDraftToCapture,
    snippet,
  ]);

  if (!snippet) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-center text-sm text-text-muted">
          Select a capture to build language cards.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <LanguageCardEditorModeBanner
        isDraft={isDraftMode}
        editingFocusText={editingCard?.focusText}
        onBackToDraft={() => {
          void switchToDraft();
        }}
      />

      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <p className="text-[10px] text-text-muted">
          {editorLoaded ? saveStateLabel(saveState) : 'Loading…'}
        </p>
        {isDraftMode ? (
          <button
            type="button"
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
              !createEnabled ||
              creating ||
              !draftLoaded ||
              !canCreateLanguageCard(draft)
            }
            onClick={() => {
              void handleCreate();
            }}
          >
            {creating ? 'Creating…' : 'Create'}
          </button>
        ) : (
          <p className="text-[10px] text-text-muted">Established card — auto-saved on edit</p>
        )}
      </div>

      {createError ? (
        <p className="border-b border-border bg-canvas px-4 py-2 text-xs text-red-600">
          {createError}
        </p>
      ) : null}

      <LanguageCardEditorFields
        content={editorContent}
        disabled={!editorLoaded}
        onChange={handleContentChange}
        onToggleOptionalField={handleToggleOptionalField}
      />

      <EstablishedCardsStrip
        cards={languageCards}
        isDraftMode={isDraftMode}
        editingCardId={editorState.editingCardId}
        onSelectDraft={() => {
          void handleNewDraft();
        }}
        onSelectCard={(cardId) => {
          void switchToEdit(cardId);
        }}
      />
    </div>
  );
}
