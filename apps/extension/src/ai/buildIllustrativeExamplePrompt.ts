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

  const system = `You are a language tutor helping a learner study a single word or short lexical item.
Write ONE natural example sentence in ${fragment.languageCode} that uses the focus word/phrase clearly.
Then provide a ${targetLang} gloss for the whole sentence on the next line after ---.

Strict output — only this XML:

<result>
  <illustrative_example>[Example sentence in ${fragment.languageCode}]
---
[${targetLang} translation of the full sentence]</illustrative_example>
</result>`;

  const user = buildSnippetContextUserBlock(fragment);

  return { system, user };
}
