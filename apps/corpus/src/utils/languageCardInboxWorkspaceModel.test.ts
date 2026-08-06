import { describe, expect, it } from 'vitest';
import {
  canCreateLanguageCard,
  createInitialEditorState,
  createInitialWorkspaceSelection,
  listCreateValidationFailures,
  resolveInboxArchivePath,
  setChatContextSnippet,
  setDetailTab,
  shouldPromptArchiveWithoutFormalCards,
  startDraftEditor,
  startEditEstablishedCard,
  syncSelectionOnSnippet,
  type DraftSlotState,
} from './languageCardInboxWorkspaceModel';

describe('workspace selection + context sync', () => {
  it('syncSelectionOnSnippet aligns queue and chat context', () => {
    const state = createInitialWorkspaceSelection('s1');

    expect(syncSelectionOnSnippet(state, 's2')).toEqual({
      selectedSnippetId: 's2',
      chatContextSnippetId: 's2',
      detailTab: 'snip',
    });
  });

  it('setChatContextSnippet also updates queue selection (grill A)', () => {
    const state = {
      ...createInitialWorkspaceSelection('s1'),
      detailTab: 'language' as const,
    };

    expect(setChatContextSnippet(state, 's3')).toEqual({
      selectedSnippetId: 's3',
      chatContextSnippetId: 's3',
      detailTab: 'language',
    });
  });

  it('setDetailTab preserves selection ids', () => {
    const state = createInitialWorkspaceSelection('s1');

    expect(setDetailTab(state, 'language')).toEqual({
      selectedSnippetId: 's1',
      chatContextSnippetId: 's1',
      detailTab: 'language',
    });
  });
});

describe('editor mode transitions', () => {
  it('starts in draft mode with no editing card', () => {
    expect(createInitialEditorState()).toEqual({
      mode: 'draft',
      editingCardId: null,
    });
  });

  it('startEditEstablishedCard switches to edit mode', () => {
    expect(startEditEstablishedCard('card-1')).toEqual({
      mode: 'edit',
      editingCardId: 'card-1',
    });
  });

  it('startDraftEditor clears editing card', () => {
    expect(startDraftEditor()).toEqual({
      mode: 'draft',
      editingCardId: null,
    });
  });
});

describe('Create validation', () => {
  const validDraft = (): DraftSlotState => ({
    focusText: 'vessels',
    meaning: '船只',
    enabledOptionalFields: ['example'],
    optionalSlots: { example: 'The fleet has twelve vessels.' },
  });

  it('passes when required fields and enabled optional fields are filled', () => {
    expect(canCreateLanguageCard(validDraft())).toBe(true);
    expect(listCreateValidationFailures(validDraft())).toEqual([]);
  });

  it('fails when focus or meaning is missing', () => {
    const missingFocus = { ...validDraft(), focusText: '   ' };
    const missingMeaning = { ...validDraft(), meaning: '' };

    expect(canCreateLanguageCard(missingFocus)).toBe(false);
    expect(canCreateLanguageCard(missingMeaning)).toBe(false);
    expect(listCreateValidationFailures(missingFocus)).toContain('focusText');
    expect(listCreateValidationFailures(missingMeaning)).toContain('meaning');
  });

  it('fails when an enabled optional field is empty', () => {
    const draft = {
      ...validDraft(),
      optionalSlots: { example: '  ' },
    };

    expect(canCreateLanguageCard(draft)).toBe(false);
    expect(listCreateValidationFailures(draft)).toContain('example');
  });

  it('ignores disabled optional fields even when empty', () => {
    const draft: DraftSlotState = {
      focusText: 'vessels',
      meaning: '船只',
      enabledOptionalFields: [],
      optionalSlots: { example: '', usageNote: '' },
    };

    expect(canCreateLanguageCard(draft)).toBe(true);
  });
});

describe('inbox archive gating', () => {
  it('uses practice path when at least one formal card exists', () => {
    expect(resolveInboxArchivePath(1)).toBe('library-with-practice');
    expect(resolveInboxArchivePath(3)).toBe('library-with-practice');
  });

  it('uses library-only path when no formal cards exist', () => {
    expect(resolveInboxArchivePath(0)).toBe('library-only');
  });

  it('prompts when formal card count is zero unless setting skips confirm', () => {
    expect(shouldPromptArchiveWithoutFormalCards(0, false)).toBe(true);
    expect(shouldPromptArchiveWithoutFormalCards(0, true)).toBe(false);
    expect(shouldPromptArchiveWithoutFormalCards(2, false)).toBe(false);
  });
});
