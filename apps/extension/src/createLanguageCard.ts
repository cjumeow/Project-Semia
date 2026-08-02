import type { LanguageCard } from '@semia/shared';
import {
  generateLanguageCardContent,
  normalizeCardIntents,
  type CreateLanguageCardInput,
} from './ai/generateLanguageCard';
import { saveLanguageCard } from './languageCardsStorage';

export async function createLanguageCard(
  input: CreateLanguageCardInput,
): Promise<LanguageCard> {
  const focusText = input.focusText.trim();
  if (!focusText) {
    throw new Error('Focus text is required.');
  }

  const intents = normalizeCardIntents(input.intents);
  const generated = await generateLanguageCardContent({ ...input, intents });
  const now = new Date().toISOString();
  const card: LanguageCard = {
    id: crypto.randomUUID(),
    sourceFragmentId: input.fragment.id,
    focusText,
    intents,
    learnerNote: input.learnerNote?.trim() || undefined,
    ...generated,
    createdAt: now,
    generatedAt: now,
  };

  await saveLanguageCard(card);
  return card;
}
