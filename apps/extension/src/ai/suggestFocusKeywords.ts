import type { LanguageFragment } from '@semia/shared';
import {
  getFocusKeywordMode,
  parseFocusKeywordSuggestions,
  type FocusKeywordMode,
  type FocusKeywordSuggestions,
} from '@semia/shared';
import { buildFocusKeywordSuggestionPrompt } from './buildFocusKeywordSuggestionPrompt';
import { completeChat } from './chatCompletion';
import { getSemiaSettings } from '../semiaSettings';
import { getSnippetNote } from '../snippetNotesStorage';

export type SuggestFocusKeywordsInput = {
  fragment: LanguageFragment;
  userLevelMode?: FocusKeywordMode;
};

export async function suggestFocusKeywords(
  input: SuggestFocusKeywordsInput,
): Promise<FocusKeywordSuggestions> {
  const note = await getSnippetNote(input.fragment.id);
  if (!note?.generatedAt) {
    throw new Error('Generate the snippet note before requesting focus keywords.');
  }

  const originalSpeech = note.originalSpeech.trim();
  if (!originalSpeech) {
    return { candidates: [] };
  }

  const settings = await getSemiaSettings();
  const nativeLanguage = settings.nativeLanguage?.trim() || 'zh-TW';
  const userLevelMode =
    input.userLevelMode ?? getFocusKeywordMode(settings);

  const { system, user } = buildFocusKeywordSuggestionPrompt({
    fragment: input.fragment,
    originalSpeech,
    userLevelMode,
    nativeLanguage,
  });

  const content = await completeChat(system, user);
  return parseFocusKeywordSuggestions(content, originalSpeech);
}
