import type { LanguageFragment } from '@semia/shared';
import {
  buildSuggestionContextExcerpt,
  parseLanguageCardFieldSuggestions,
  type LanguageCardFieldSuggestions,
  type LanguageCardSuggestableField,
} from '@semia/shared';
import { buildLanguageCardFieldSuggestionPrompt } from './buildLanguageCardFieldSuggestionPrompt';
import { completeChat } from './chatCompletion';
import { getSemiaSettings } from '../semiaSettings';
import { getSnippetNote } from '../snippetNotesStorage';

export type SuggestLanguageCardFieldsInput = {
  fragment: LanguageFragment;
  focusText: string;
  fields: LanguageCardSuggestableField[];
};

export async function suggestLanguageCardFields(
  input: SuggestLanguageCardFieldsInput,
): Promise<LanguageCardFieldSuggestions> {
  const focusText = input.focusText.trim();
  if (!focusText) {
    throw new Error('Focus text is required.');
  }

  const fields =
    input.fields.length > 0
      ? [...new Set(input.fields)]
      : (['meaning'] as LanguageCardSuggestableField[]);

  const note = await getSnippetNote(input.fragment.id);
  if (!note?.generatedAt) {
    throw new Error('Generate the snippet note before requesting suggestions.');
  }

  const settings = await getSemiaSettings();
  const nativeLanguage = settings.nativeLanguage?.trim() || 'zh-TW';
  const suggestionExcerpt = buildSuggestionContextExcerpt({
    originalSpeech: note.originalSpeech,
    focusText,
    captureText: input.fragment.selectedText,
  });

  const { system, user } = buildLanguageCardFieldSuggestionPrompt({
    fragment: input.fragment,
    focusText,
    fields,
    nativeLanguage,
    suggestionExcerpt,
  });

  const content = await completeChat(system, user);
  return parseLanguageCardFieldSuggestions(content, fields);
}
