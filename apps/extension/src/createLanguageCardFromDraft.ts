import type { LanguageCard, LanguageFragment } from '@semia/shared';
import {
  buildLanguageCardFieldsFromDraftContent,
  enrollCardInReviewQueue,
  listCreateValidationFailures,
  MAX_LANGUAGE_CARDS_PER_FRAGMENT,
  type LanguageCardDraftContent,
} from '@semia/shared';
import { clearLanguageCardDraft } from './languageCardDraftsStorage';
import {
  listLanguageCardsForFragment,
  saveLanguageCard,
} from './languageCardsStorage';

export type CreateLanguageCardFromDraftInput = {
  fragment: LanguageFragment;
  draft: LanguageCardDraftContent;
};

export async function createLanguageCardFromDraft(
  input: CreateLanguageCardFromDraftInput,
): Promise<LanguageCard> {
  const failures = listCreateValidationFailures(input.draft);
  if (failures.length > 0) {
    throw new Error(
      `Draft is incomplete. Missing: ${failures.join(', ')}.`,
    );
  }

  const existing = await listLanguageCardsForFragment(input.fragment.id);
  if (existing.length >= MAX_LANGUAGE_CARDS_PER_FRAGMENT) {
    throw new Error(
      `This capture already has ${MAX_LANGUAGE_CARDS_PER_FRAGMENT} language cards.`,
    );
  }

  const now = new Date().toISOString();
  const fields = buildLanguageCardFieldsFromDraftContent(input.draft);
  const card = enrollCardInReviewQueue(
    {
      id: crypto.randomUUID(),
      sourceFragmentId: input.fragment.id,
      createdAt: now,
      generatedAt: now,
      ...fields,
    },
    now,
  );

  await saveLanguageCard(card);
  await clearLanguageCardDraft(input.fragment.id);
  return card;
}
