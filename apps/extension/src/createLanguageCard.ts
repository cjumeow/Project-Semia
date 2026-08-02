import type { LanguageCard } from '@semia/shared';
import {
  enrollCardInReviewQueue,
  MAX_LANGUAGE_CARDS_PER_FRAGMENT,
} from '@semia/shared';
import {
  generateLanguageCardContent,
  normalizeCardIntents,
  type CreateLanguageCardInput,
} from './ai/generateLanguageCard';
import {
  listLanguageCardsForFragment,
  saveLanguageCard,
} from './languageCardsStorage';

export async function createLanguageCard(
  input: CreateLanguageCardInput,
): Promise<LanguageCard> {
  const focusText = input.focusText.trim();
  if (!focusText) {
    throw new Error('Focus text is required.');
  }

  const existing = await listLanguageCardsForFragment(input.fragment.id);
  if (existing.length >= MAX_LANGUAGE_CARDS_PER_FRAGMENT) {
    throw new Error(
      `This capture already has ${MAX_LANGUAGE_CARDS_PER_FRAGMENT} language cards.`,
    );
  }

  const intents = normalizeCardIntents(input.intents);
  const generated = await generateLanguageCardContent({ ...input, intents });
  const now = new Date().toISOString();
  const card = enrollCardInReviewQueue(
    {
      id: crypto.randomUUID(),
      sourceFragmentId: input.fragment.id,
      focusText,
      intents,
      ...generated,
      createdAt: now,
      generatedAt: now,
    },
    now,
  );

  await saveLanguageCard(card);
  return card;
}
