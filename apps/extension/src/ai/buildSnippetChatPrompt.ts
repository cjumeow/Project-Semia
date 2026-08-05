import type { LanguageFragment, SnippetNote } from '@semia/shared';
import {
  buildSnippetContextUserBlock,
  targetLanguageLabel,
} from './snippetPromptContext';

export function buildSnippetChatSystemPrompt({
  fragment,
  note,
  nativeLanguage,
}: {
  fragment?: LanguageFragment;
  note?: SnippetNote;
  nativeLanguage: string;
}): string {
  const targetLang = targetLanguageLabel(nativeLanguage);

  if (!fragment) {
    return `You are a helpful language learning tutor.
The user is not discussing a specific capture right now.
Answer general questions about language learning, study strategies, grammar, and usage.
Write explanations in ${targetLang} unless quoting example sentences in another language.
Be concise and practical.`;
  }

  const contextParts = [buildSnippetContextUserBlock(fragment), ''];

  if (note?.generatedAt) {
    contextParts.push(
      '[SNIP NOTE]',
      `Original speech: ${note.originalSpeech}`,
      `Natural translation: ${note.naturalTranslation}`,
      `Background note: ${note.backgroundNote}`,
    );
    if (note.dynamicContextBlock?.trim()) {
      contextParts.push('', '[CONTEXT WINDOW]', note.dynamicContextBlock.trim());
    }
  } else {
    contextParts.push(
      '[SNIP NOTE]',
      '(Not generated yet — use transcript/page context only.)',
    );
  }

  return `You are a language tutor helping a learner understand a captured snippet from real media.
Write explanations in ${targetLang} unless the user asks for example sentences in ${fragment.languageCode}.

The following snippet context is attached for this conversation. Use it to give accurate, contextual advice about vocabulary, usage, collocations, and example sentences.

${contextParts.join('\n')}

Guidelines:
- Proactively suggest practical study angles (daily usage, example sentences, spoken vs written register) when helpful.
- Stay grounded in the snippet context; do not invent facts about the source.
- Be concise unless the user asks for depth.`;
}
