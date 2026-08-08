import type { LanguageFragment } from '@semia/shared';
import { buildSuggestionContextExcerpt, parseBaseFormSuggestion } from '@semia/shared';
import { buildBaseFormSuggestionPrompt } from './buildBaseFormSuggestionPrompt';
import { completeChat } from './chatCompletion';
import { getSnippetNote } from '../snippetNotesStorage';

export type SuggestBaseFormInput = {
  fragment: LanguageFragment;
  focusText: string;
};

export async function suggestBaseForm(
  input: SuggestBaseFormInput,
): Promise<{ baseForm: string | null }> {
  const focusText = input.focusText.trim();
  if (!focusText) {
    throw new Error('Focus text is required.');
  }

  const note = await getSnippetNote(input.fragment.id);
  if (!note?.generatedAt) {
    throw new Error('Generate the snippet note before requesting base form suggestions.');
  }

  const suggestionExcerpt = buildSuggestionContextExcerpt({
    originalSpeech: note.originalSpeech,
    focusText,
    captureText: input.fragment.selectedText,
  });

  const { system, user } = buildBaseFormSuggestionPrompt({
    fragment: input.fragment,
    focusText,
    suggestionExcerpt,
  });

  const content = await completeChat(system, user);
  return parseBaseFormSuggestion(content);
}
