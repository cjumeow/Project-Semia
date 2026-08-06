import type { LanguageFragment } from '@semia/shared';
import type { LanguageCardSuggestableField } from '@semia/shared';
import { targetLanguageLabel } from './snippetPromptContext';

export function buildLanguageCardFieldSuggestionPrompt({
  fragment,
  focusText,
  fields,
  nativeLanguage,
  originalSpeech,
  naturalTranslation,
  contextWindow,
}: {
  fragment: LanguageFragment;
  focusText: string;
  fields: ReadonlyArray<LanguageCardSuggestableField>;
  nativeLanguage: string;
  originalSpeech: string;
  naturalTranslation: string;
  contextWindow?: string;
}): { system: string; user: string } {
  const targetLang = targetLanguageLabel(nativeLanguage);
  const requested = fields
    .map((field) => (field === 'meaning' ? 'MEANING' : 'EXAMPLE'))
    .join(' and ');

  const system = `You help a language learner fill in language-card fields.
Write in ${targetLang}.
Return ONLY labeled lines for the requested fields. No markdown fences, no extra commentary.
Format exactly:
${fields.includes('meaning') ? 'MEANING: <short explanation>' : ''}
${fields.includes('example') ? 'EXAMPLE: <one natural example sentence using the focus phrase>' : ''}`.trim();

  const user = [
    `Focus phrase: ${focusText}`,
    `Capture text: ${fragment.selectedText}`,
    `Original speech: ${originalSpeech}`,
    `Natural translation: ${naturalTranslation}`,
    contextWindow?.trim()
      ? `Context window:\n${contextWindow.trim()}`
      : null,
    `Requested fields: ${requested}`,
  ]
    .filter(Boolean)
    .join('\n');

  return { system, user };
}
