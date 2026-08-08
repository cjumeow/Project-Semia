import { describe, expect, it } from 'vitest';
import {
  clearLanguageCardDraftFromMap,
  createEmptyLanguageCardDraft,
  createLanguageCardDraftContentWithDefaultFields,
  deleteLanguageCardDraftsFromMap,
  getLanguageCardDraft,
  isLanguageCardDraftContentEmpty,
  normalizeLanguageCardDraft,
  upsertLanguageCardDraft,
} from './languageCardDraft';

describe('languageCardDraft map operations', () => {
  const fragmentA = 'frag-a';
  const fragmentB = 'frag-b';

  it('upserts exactly one draft per capture id', () => {
    let map = upsertLanguageCardDraft(
      {},
      createEmptyLanguageCardDraft(fragmentA, '2026-01-01T00:00:00.000Z'),
    );
    map = upsertLanguageCardDraft(map, {
      ...createEmptyLanguageCardDraft(fragmentA, '2026-01-02T00:00:00.000Z'),
      focusText: 'hello',
    });

    expect(Object.keys(map)).toEqual([fragmentA]);
    expect(getLanguageCardDraft(map, fragmentA)?.focusText).toBe('hello');
  });

  it('keeps drafts for different captures separate', () => {
    const map = upsertLanguageCardDraft(
      upsertLanguageCardDraft(
        {},
        {
          ...createEmptyLanguageCardDraft(fragmentA, '2026-01-01T00:00:00.000Z'),
          focusText: 'a',
        },
      ),
      {
        ...createEmptyLanguageCardDraft(fragmentB, '2026-01-01T00:00:00.000Z'),
        focusText: 'b',
      },
    );

    expect(getLanguageCardDraft(map, fragmentA)?.focusText).toBe('a');
    expect(getLanguageCardDraft(map, fragmentB)?.focusText).toBe('b');
  });

  it('clears a draft by fragment id', () => {
    const map = upsertLanguageCardDraft(
      {},
      {
        ...createEmptyLanguageCardDraft(fragmentA, '2026-01-01T00:00:00.000Z'),
        focusText: 'keep-me',
      },
    );

    const cleared = clearLanguageCardDraftFromMap(map, fragmentA);
    expect(getLanguageCardDraft(cleared, fragmentA)).toBeUndefined();
  });

  it('deletes drafts when captures are removed', () => {
    const map = upsertLanguageCardDraft(
      upsertLanguageCardDraft(
        {},
        createEmptyLanguageCardDraft(fragmentA, '2026-01-01T00:00:00.000Z'),
      ),
      createEmptyLanguageCardDraft(fragmentB, '2026-01-01T00:00:00.000Z'),
    );

    const next = deleteLanguageCardDraftsFromMap(map, [fragmentA]);
    expect(getLanguageCardDraft(next, fragmentA)).toBeUndefined();
    expect(getLanguageCardDraft(next, fragmentB)).toBeDefined();
  });
});

describe('normalizeLanguageCardDraft', () => {
  it('rejects drafts stored under a different fragment id', () => {
    const normalized = normalizeLanguageCardDraft(
      {
        sourceFragmentId: 'other',
        focusText: 'x',
        meaning: '',
        enabledOptionalFields: [],
        optionalSlots: {},
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      'expected',
    );

    expect(normalized).toBeNull();
  });
});

describe('createLanguageCardDraftContentWithDefaultFields', () => {
  it('pre-enables optional fields with empty slot values', () => {
    const draft = createLanguageCardDraftContentWithDefaultFields([
      'example',
      'usageNote',
      'not-a-field' as never,
    ]);

    expect(draft.focusText).toBe('');
    expect(draft.meaning).toBe('');
    expect(draft.enabledOptionalFields).toEqual(['example', 'usageNote']);
    expect(draft.optionalSlots).toEqual({ example: '', usageNote: '' });
  });
});

describe('isLanguageCardDraftContentEmpty', () => {
  it('returns true only when all enabled fields are blank', () => {
    expect(
      isLanguageCardDraftContentEmpty({
        focusText: '  ',
        meaning: '',
        enabledOptionalFields: ['example'],
        optionalSlots: { example: '   ' },
      }),
    ).toBe(true);

    expect(
      isLanguageCardDraftContentEmpty({
        focusText: 'word',
        meaning: '',
        enabledOptionalFields: [],
        optionalSlots: {},
      }),
    ).toBe(false);
  });
});
