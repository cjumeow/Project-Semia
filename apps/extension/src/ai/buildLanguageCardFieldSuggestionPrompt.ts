import type { LanguageFragment } from '@semia/shared';
import type { LanguageCardSuggestableField } from '@semia/shared';
import { targetLanguageLabel } from './snippetPromptContext';

export function buildLanguageCardFieldSuggestionPrompt({
  fragment,
  focusText,
  fields,
  nativeLanguage,
  suggestionExcerpt,
}: {
  fragment: LanguageFragment;
  focusText: string;
  fields: ReadonlyArray<LanguageCardSuggestableField>;
  nativeLanguage: string;
  suggestionExcerpt: string;
}): { system: string; user: string } {
  const targetLang = targetLanguageLabel(nativeLanguage);
  const captureLang = fragment.languageCode;
  const requested = fields
    .map((field) => (field === 'meaning' ? 'MEANING' : 'EXAMPLE'))
    .join(' and ');

  const languageRules = [
    fields.includes('meaning')
      ? `MEANING must be a short explanation in ${targetLang}.`
      : null,
    fields.includes('example')
      ? `EXAMPLE must be one natural sentence in ${captureLang} that uses the focus phrase.`
      : null,
  ]
    .filter(Boolean)
    .join(' ');

  const system = `You help a language learner fill in language-card fields.
${languageRules}
Return ONLY labeled lines for the requested fields. No markdown fences, no extra commentary.
Format exactly:
${fields.includes('meaning') ? 'MEANING: <short explanation>' : ''}
${fields.includes('example') ? 'EXAMPLE: <example sentence in capture language>' : ''}`.trim();

  const user = [
    `Focus phrase: ${focusText}`,
    `Capture text: ${fragment.selectedText}`,
    `Suggestion excerpt: ${suggestionExcerpt.trim()}`,
    `Requested fields: ${requested}`,
  ].join('\n');

  return { system, user };
}
