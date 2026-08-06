export type LanguageCardOptionalFieldKey = 'example' | 'usageNote';

export type LanguageCardDraftContent = {
  focusText: string;
  meaning: string;
  enabledOptionalFields: ReadonlyArray<LanguageCardOptionalFieldKey>;
  optionalSlots: Partial<Record<LanguageCardOptionalFieldKey, string>>;
};

/** Alias used by inbox workspace model validation. */
export type DraftSlotState = LanguageCardDraftContent;

export type LanguageCardDraft = LanguageCardDraftContent & {
  sourceFragmentId: string;
  updatedAt: string;
};

export type LanguageCardDraftsMap = Record<string, LanguageCardDraft>;

export const LANGUAGE_CARD_DRAFT_DEBOUNCE_MS = 300;

export function createEmptyLanguageCardDraftContent(): LanguageCardDraftContent {
  return {
    focusText: '',
    meaning: '',
    enabledOptionalFields: [],
    optionalSlots: {},
  };
}

export function createEmptyLanguageCardDraft(
  sourceFragmentId: string,
  updatedAt: string,
): LanguageCardDraft {
  return {
    sourceFragmentId,
    updatedAt,
    ...createEmptyLanguageCardDraftContent(),
  };
}

export function normalizeLanguageCardDraft(
  value: unknown,
  sourceFragmentId: string,
): LanguageCardDraft | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Partial<LanguageCardDraft>;
  if (record.sourceFragmentId && record.sourceFragmentId !== sourceFragmentId) {
    return null;
  }

  const enabledOptionalFields = Array.isArray(record.enabledOptionalFields)
    ? record.enabledOptionalFields.filter(
        (field): field is LanguageCardOptionalFieldKey =>
          field === 'example' || field === 'usageNote',
      )
    : [];

  const optionalSlots: LanguageCardDraftContent['optionalSlots'] = {};
  if (record.optionalSlots && typeof record.optionalSlots === 'object') {
    for (const key of ['example', 'usageNote'] as const) {
      const slotValue = (record.optionalSlots as Record<string, unknown>)[key];
      if (typeof slotValue === 'string') {
        optionalSlots[key] = slotValue;
      }
    }
  }

  return {
    sourceFragmentId,
    updatedAt:
      typeof record.updatedAt === 'string'
        ? record.updatedAt
        : new Date(0).toISOString(),
    focusText: typeof record.focusText === 'string' ? record.focusText : '',
    meaning: typeof record.meaning === 'string' ? record.meaning : '',
    enabledOptionalFields,
    optionalSlots,
  };
}

export function getLanguageCardDraft(
  map: LanguageCardDraftsMap,
  sourceFragmentId: string,
): LanguageCardDraft | undefined {
  const draft = map[sourceFragmentId];
  if (!draft) return undefined;
  return normalizeLanguageCardDraft(draft, sourceFragmentId) ?? undefined;
}

/** Enforces at most one draft per capture (keyed by sourceFragmentId). */
export function upsertLanguageCardDraft(
  map: LanguageCardDraftsMap,
  draft: LanguageCardDraft,
): LanguageCardDraftsMap {
  return {
    ...map,
    [draft.sourceFragmentId]: {
      ...draft,
      sourceFragmentId: draft.sourceFragmentId,
    },
  };
}

export function clearLanguageCardDraftFromMap(
  map: LanguageCardDraftsMap,
  sourceFragmentId: string,
): LanguageCardDraftsMap {
  if (!(sourceFragmentId in map)) {
    return map;
  }

  const next = { ...map };
  delete next[sourceFragmentId];
  return next;
}

export function deleteLanguageCardDraftsFromMap(
  map: LanguageCardDraftsMap,
  sourceFragmentIds: readonly string[],
): LanguageCardDraftsMap {
  if (sourceFragmentIds.length === 0) {
    return map;
  }

  const remove = new Set(sourceFragmentIds);
  let changed = false;
  const next: LanguageCardDraftsMap = { ...map };

  for (const fragmentId of remove) {
    if (fragmentId in next) {
      delete next[fragmentId];
      changed = true;
    }
  }

  return changed ? next : map;
}

export function isLanguageCardDraftContentEmpty(
  content: LanguageCardDraftContent,
): boolean {
  if (content.focusText.trim().length > 0) return false;
  if (content.meaning.trim().length > 0) return false;

  for (const field of content.enabledOptionalFields) {
    const value = content.optionalSlots[field] ?? '';
    if (value.trim().length > 0) {
      return false;
    }
  }

  return true;
}

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function listCreateValidationFailures(
  draft: LanguageCardDraftContent,
): string[] {
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

export function canCreateLanguageCard(draft: LanguageCardDraftContent): boolean {
  return listCreateValidationFailures(draft).length === 0;
}
