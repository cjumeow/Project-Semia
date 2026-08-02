import type { LanguageFragment } from '@semia/shared';
import { buildSnippetContextUserBlock, targetLanguageLabel } from './snippetPromptContext';

export function buildIllustrativeExamplePrompt({
  fragment,
  nativeLanguage,
}: {
  fragment: LanguageFragment;
  nativeLanguage: string;
}): { system: string; user: string } {
  const targetLang = targetLanguageLabel(nativeLanguage);
  const focus = fragment.selectedText.trim();

  const system = `You are a language tutor helping a learner study a single word or short lexical item.

Write ONE new example sentence in ${fragment.languageCode} that:
- Uses "${focus}" clearly and naturally (same sense/register as in the capture context below)
- Is a **newly invented** sentence — do NOT copy, paraphrase, or lightly edit any line from the surrounding transcript or page text
- Matches the **situational usage** implied by the capture context (topic, tone, domain, pragmatic function)

Then provide a ${targetLang} gloss for the full sentence on the next line after ---.

Strict output — only this XML:

<result>
  <illustrative_example>[New example sentence in ${fragment.languageCode}]
---
[${targetLang} translation of the full sentence]</illustrative_example>
</result>`;

  const user = buildSnippetContextUserBlock(fragment);

  return { system, user };
}
