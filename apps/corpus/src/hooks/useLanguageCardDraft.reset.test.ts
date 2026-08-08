import { describe, expect, it } from 'vitest';
import { createEmptyLanguageCardDraftContent } from '@semia/shared';

describe('language card draft editor prefill', () => {
  it('empty draft content keeps focus and meaning blank for manual pick', () => {
    const empty = createEmptyLanguageCardDraftContent();
    expect(empty.focusText).toBe('');
    expect(empty.meaning).toBe('');
  });
});
