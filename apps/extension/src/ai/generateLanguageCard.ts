import type { CardIntent, LanguageFragment } from '@semia/shared';
import { parseLanguageCardXml } from '@semia/shared';
import { buildLanguageCardPrompt } from './buildLanguageCardPrompt';
import { completeChat } from './chatCompletion';
import { getSemiaSettings } from '../semiaSettings';
import { getSnippetNote } from '../snippetNotesStorage';

export type CreateLanguageCardInput = {
  fragment: LanguageFragment;
  focusText: string;
  intents: CardIntent[];
  learnerNote?: string;
};

export async function generateLanguageCardContent(
  input: CreateLanguageCardInput,
): Promise<ReturnType<typeof parseLanguageCardXml>> {
  const note = await getSnippetNote(input.fragment.id);
  if (!note?.generatedAt) {
    throw new Error('Generate the snippet note before creating a language card.');
  }

  const intents = normalizeCardIntents(input.intents);
  const settings = await getSemiaSettings();
  const nativeLanguage = settings.nativeLanguage?.trim() || 'zh-TW';
  const { system, user } = buildLanguageCardPrompt({
    fragment: input.fragment,
    note,
    focusText: input.focusText.trim(),
    intents,
    learnerNote: input.learnerNote,
    nativeLanguage,
  });
  const content = await completeChat(system, user);
  return parseLanguageCardXml(content, intents);
}

export function normalizeCardIntents(intents: CardIntent[]): CardIntent[] {
  const unique = [
    ...new Set(
      intents.filter((intent) => intent === 'speaking' || intent === 'writing'),
    ),
  ];
  if (unique.length === 0) {
    throw new Error('Select at least one intent (speaking or writing).');
  }
  return unique;
}
