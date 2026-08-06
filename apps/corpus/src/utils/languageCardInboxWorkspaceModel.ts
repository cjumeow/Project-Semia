export type { DraftSlotState } from '@semia/shared';

export type DetailTab = 'snip' | 'language';

export type EditorMode = 'draft' | 'edit';

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

export {
  canCreateLanguageCard,
  listCreateValidationFailures,
} from '@semia/shared';
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
