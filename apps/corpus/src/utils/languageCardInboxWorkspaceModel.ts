export type DetailTab = 'snip' | 'language';

export type EditorMode = 'draft' | 'edit';

export type OptionalCardFieldKey = 'example' | 'usageNote';

export type InboxArchivePath = 'library-with-practice' | 'library-only';

export type WorkspaceSelectionState = {
  selectedSnippetId: string | null;
  chatContextSnippetId: string | null;
  detailTab: DetailTab;
};

export type EditorWorkspaceState = {
  mode: EditorMode;
  editingCardId: string | null;
};

export type DraftSlotState = {
  focusText: string;
  meaning: string;
  enabledOptionalFields: ReadonlyArray<OptionalCardFieldKey>;
  optionalSlots: Partial<Record<OptionalCardFieldKey, string>>;
};

export function createInitialWorkspaceSelection(
  selectedSnippetId: string | null,
): WorkspaceSelectionState {
  return {
    selectedSnippetId,
    chatContextSnippetId: selectedSnippetId,
    detailTab: 'snip',
  };
}

export function syncSelectionOnSnippet(
  state: WorkspaceSelectionState,
  snippetId: string,
): WorkspaceSelectionState {
  return {
    ...state,
    selectedSnippetId: snippetId,
    chatContextSnippetId: snippetId,
  };
}

/** Grill answer A: AI context switch also updates inbox queue selection. */
export function setChatContextSnippet(
  state: WorkspaceSelectionState,
  snippetId: string,
): WorkspaceSelectionState {
  return syncSelectionOnSnippet(state, snippetId);
}

export function setDetailTab(
  state: WorkspaceSelectionState,
  detailTab: DetailTab,
): WorkspaceSelectionState {
  return {
    ...state,
    detailTab,
  };
}

export function createInitialEditorState(): EditorWorkspaceState {
  return {
    mode: 'draft',
    editingCardId: null,
  };
}

export function startDraftEditor(): EditorWorkspaceState {
  return createInitialEditorState();
}

export function startEditEstablishedCard(cardId: string): EditorWorkspaceState {
  return {
    mode: 'edit',
    editingCardId: cardId,
  };
}

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function listCreateValidationFailures(draft: DraftSlotState): string[] {
  const failures: string[] = [];

  if (!isNonEmpty(draft.focusText)) {
    failures.push('focusText');
  }
  if (!isNonEmpty(draft.meaning)) {
    failures.push('meaning');
  }

  for (const field of draft.enabledOptionalFields) {
    const value = draft.optionalSlots[field] ?? '';
    if (!isNonEmpty(value)) {
      failures.push(field);
    }
  }

  return failures;
}

export function canCreateLanguageCard(draft: DraftSlotState): boolean {
  return listCreateValidationFailures(draft).length === 0;
}

export function resolveInboxArchivePath(
  formalCardCount: number,
): InboxArchivePath {
  return formalCardCount > 0 ? 'library-with-practice' : 'library-only';
}

export function shouldPromptArchiveWithoutFormalCards(
  formalCardCount: number,
  skipConfirmSetting: boolean,
): boolean {
  if (formalCardCount > 0) return false;
  return !skipConfirmSetting;
}
