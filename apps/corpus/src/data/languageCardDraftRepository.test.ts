import { describe, expect, it } from 'vitest';
import {
  createEmptyLanguageCardDraft,
  type LanguageCardDraft,
} from '@semia/shared';
import { corpusRepository } from './corpusRepository';

describe('corpusRepository language card drafts (mock)', () => {
  it('loads, saves, and clears a draft for one capture', async () => {
    if (corpusRepository.isLive()) {
      return;
    }

    const draft: LanguageCardDraft = {
      ...createEmptyLanguageCardDraft('frag-mock', '2026-01-01T00:00:00.000Z'),
      focusText: 'draft-only',
      meaning: 'not a formal card',
    };

    await corpusRepository.saveLanguageCardDraft(draft);
    await expect(corpusRepository.getLanguageCardDraft('frag-mock')).resolves.toEqual(
      draft,
    );

    await corpusRepository.clearLanguageCardDraft('frag-mock');
    await expect(corpusRepository.getLanguageCardDraft('frag-mock')).resolves.toBeNull();
  });
});
