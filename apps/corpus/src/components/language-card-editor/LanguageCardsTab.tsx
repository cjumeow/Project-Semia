import { useCallback, useEffect, useState } from 'react';
import {
  appendMarkdownToSlot,
  canCreateLanguageCard,
  type LanguageCard,
  type LanguageCardDraftContent,
  type LanguageCardEditorSlotKey,
  type LanguageCardOptionalFieldKey,
} from '@semia/shared';
import type { CorpusSnippet } from '../../types/corpus';
import { useLanguageCardDraft } from '../../hooks/useLanguageCardDraft';
import { useLanguageCardEstablishedEdit } from '../../hooks/useLanguageCardEstablishedEdit';
import { useFocusKeywordSuggestions } from '../../hooks/useFocusKeywordSuggestions';
import { useLanguageCardFieldSuggestions } from '../../hooks/useLanguageCardFieldSuggestions';
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
import { LanguageCardEditorHeader } from './LanguageCardEditorHeader';

type LanguageCardsTabProps = {
  snippet: CorpusSnippet | undefined;
  languageCards: LanguageCard[];
  createEnabled: boolean;
  aiSuggestionsEnabled: boolean;
  defaultOptionalFields: ReadonlyArray<LanguageCardOptionalFieldKey>;
  isLive: boolean;
  onCardsChanged: () => Promise<void>;
};

export function LanguageCardsTab({
  snippet,
  languageCards,
  createEnabled,
  aiSuggestionsEnabled,
  defaultOptionalFields,
  isLive,
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
    updateDraft,
    flushDraft,
    resetDraftToCapture,
  } = useLanguageCardDraft(snippet?.id, defaultOptionalFields);

  const {
    content: editContent,
    loaded: editLoaded,
    updateContent,
    flushContent,
  } = useLanguageCardEstablishedEdit(editingCard, !isDraftMode);

  useEffect(() => {
    setEditorState(createInitialEditorState());
  }, [snippet?.id]);

  const editorContent: LanguageCardDraftContent = isDraftMode
    ? draft
    : editContent;
  const editorLoaded = isDraftMode ? draftLoaded : editLoaded;

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

  const handleAppendSlot = useCallback(
    (slot: LanguageCardEditorSlotKey, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        return;
      }

      if (slot === 'focus') {
        handleContentChange({
          focusText: appendMarkdownToSlot(editorContent.focusText, trimmed),
        });
        return;
      }

      if (slot === 'meaning') {
        handleContentChange({
          meaning: appendMarkdownToSlot(editorContent.meaning, trimmed),
        });
        return;
      }

      const optionalField = slot;
      const enabled = editorContent.enabledOptionalFields.includes(optionalField);
      const current = editorContent.optionalSlots[optionalField] ?? '';
      handleContentChange({
        enabledOptionalFields: enabled
          ? editorContent.enabledOptionalFields
          : [...editorContent.enabledOptionalFields, optionalField],
        optionalSlots: {
          ...editorContent.optionalSlots,
          [optionalField]: appendMarkdownToSlot(current, trimmed),
        },
      });
    },
    [editorContent, handleContentChange],
  );

  const focusKeywords = useFocusKeywordSuggestions({
    snippet,
    enabled: isDraftMode && aiSuggestionsEnabled,
    isLive,
  });

  const fieldSuggestions = useLanguageCardFieldSuggestions({
    snippet,
    content: editorContent,
    enabled: aiSuggestionsEnabled && editorLoaded,
    isLive,
    onAccept: (field, value) => {
      if (field === 'focus') {
        handleContentChange({ focusText: value });
        return;
      }
      if (field === 'meaning') {
        handleContentChange({ meaning: value });
        return;
      }
      handleContentChange({
        optionalSlots: {
          ...editorContent.optionalSlots,
          example: value,
        },
      });
    },
  });

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
    resetDraftToCapture();
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
      resetDraftToCapture();
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
      <LanguageCardEditorHeader
        isDraft={isDraftMode}
        editingFocusText={editingCard?.focusText}
        loaded={editorLoaded}
        createEnabled={createEnabled}
        creating={creating}
        canCreate={canCreateLanguageCard(draft)}
        onBackToDraft={() => {
          void switchToDraft();
        }}
        onCreate={() => {
          void handleCreate();
        }}
      />

      {createError ? (
        <p className="border-b border-border bg-canvas px-4 py-2 text-xs text-red-600">
          {createError}
        </p>
      ) : null}

      <LanguageCardEditorFields
        snippet={snippet}
        content={editorContent}
        disabled={!editorLoaded}
        showFocusAssist={isDraftMode}
        focusKeywordCandidates={focusKeywords.candidates}
        focusKeywordsLoading={focusKeywords.loading}
        focusKeywordsEnabled={isDraftMode && aiSuggestionsEnabled}
        showSuggestions={aiSuggestionsEnabled}
        suggestions={fieldSuggestions}
        onChange={handleContentChange}
        onToggleOptionalField={handleToggleOptionalField}
        onAppendSlot={handleAppendSlot}
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
