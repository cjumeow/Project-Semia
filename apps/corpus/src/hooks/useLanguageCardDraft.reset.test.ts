import { describe, expect, it } from 'vitest';
import {
  createEmptyLanguageCardDraftContent,
  createLanguageCardDraftContentWithDefaultFields,
} from '@semia/shared';

describe('language card draft editor prefill', () => {
  it('empty draft content keeps focus and meaning blank for manual pick', () => {
    const empty = createEmptyLanguageCardDraftContent();
    expect(empty.focusText).toBe('');
    expect(empty.meaning).toBe('');
    expect(empty.enabledOptionalFields).toEqual([]);
  });

  it('default optional fields are applied to fresh draft content', () => {
    const draft = createLanguageCardDraftContentWithDefaultFields([
      'pitfalls',
      'personalNote',
    ]);
    expect(draft.enabledOptionalFields).toEqual(['pitfalls', 'personalNote']);
    expect(draft.optionalSlots).toEqual({ pitfalls: '', personalNote: '' });
  });
});
