import type { CardIntent, LanguageFragment } from '@semia/shared';
import {
  isWholeCaptureFocus,
  parseLanguageCardXml,
  validateFocusText,
} from '@semia/shared';
import { buildLanguageCardPrompt } from './buildLanguageCardPrompt';
import { completeChat } from './chatCompletion';
import { getSemiaSettings } from '../semiaSettings';
import { getSnippetNote } from '../snippetNotesStorage';

export type CreateLanguageCardInput = {
  fragment: LanguageFragment;
  focusText: string;
  intents: CardIntent[];
  learnerNote?: string;
  includeScenario: boolean;
};

export type GeneratedLanguageCardFields = {
  focus: string;
  meaning: string;
  scenario?: string;
  examples: ReturnType<typeof parseLanguageCardXml>['examples'];
};

export async function generateLanguageCardContent(
  input: CreateLanguageCardInput,
): Promise<GeneratedLanguageCardFields> {
  const note = await getSnippetNote(input.fragment.id);
  if (!note?.generatedAt) {
    throw new Error('Generate the snippet note before creating a language card.');
  }

  const focusText = input.focusText.trim();
  validateFocusText(focusText, {
    dynamicContextBlock: note.dynamicContextBlock,
    selectedText: input.fragment.selectedText,
    originalSpeech: note.originalSpeech,
    naturalTranslation: note.naturalTranslation,
  });

  const intents = normalizeCardIntents(input.intents);
  const includeMeaning = !isWholeCaptureFocus(focusText, {
    selectedText: input.fragment.selectedText,
    originalSpeech: note.originalSpeech,
  });
  const promptOptions = {
    includeScenario: input.includeScenario,
    includeMeaning,
  };

  const settings = await getSemiaSettings();
  const nativeLanguage = settings.nativeLanguage?.trim() || 'zh-TW';
  const { system, user } = buildLanguageCardPrompt({
    fragment: input.fragment,
    note,
    focusText,
    intents,
    learnerNote: input.learnerNote,
    nativeLanguage,
    promptOptions,
  });
  const content = await completeChat(system, user);
  const parsed = parseLanguageCardXml(content, intents, promptOptions);
  const meaning = includeMeaning
    ? (parsed.meaning ?? '')
    : note.naturalTranslation.trim();

  if (!meaning) {
    throw new Error('Could not determine meaning for this language card.');
  }

  return {
    focus: parsed.focus,
    meaning,
    scenario: parsed.scenario,
    examples: parsed.examples,
  };
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
