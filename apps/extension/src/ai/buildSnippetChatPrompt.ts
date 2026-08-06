import type { LanguageFragment, SnippetNote } from '@semia/shared';
import {
  buildActiveCapturePromptBlock,
  GLOBAL_SNIPPET_CHAT_GROUNDING_RULES,
  PER_SNIPPET_CHAT_GROUNDING_RULES,
} from '@semia/shared';
import {
  buildSnippetContextUserBlock,
  targetLanguageLabel,
} from './snippetPromptContext';

export function buildSnippetChatSystemPrompt({
  fragment,
  note,
  nativeLanguage,
  globalThread = false,
}: {
  fragment?: LanguageFragment;
  note?: SnippetNote;
  nativeLanguage: string;
  globalThread?: boolean;
}): string {
  const targetLang = targetLanguageLabel(nativeLanguage);

  if (!fragment) {
    return `You are a helpful language learning tutor.
The user is not discussing a specific capture right now.
Answer general questions about language learning, study strategies, grammar, and usage.
Write explanations in ${targetLang} unless quoting example sentences in another language.
Be concise and practical.`;
  }

  const groundingRules = globalThread
    ? GLOBAL_SNIPPET_CHAT_GROUNDING_RULES
    : PER_SNIPPET_CHAT_GROUNDING_RULES;

  const contextParts = globalThread
    ? [buildActiveCapturePromptBlock(fragment), '', buildSnippetContextUserBlock(fragment), '']
    : [buildSnippetContextUserBlock(fragment), ''];

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

  return `${groundingRules}
Write explanations in ${targetLang} unless the user asks for example sentences in ${fragment.languageCode}.

${contextParts.join('\n')}

Guidelines:
- When listing study points, collocations, or examples, use single-level markdown bullets (\`- item\`) only; do not nest sub-bullets.
- Proactively suggest practical study angles (daily usage, example sentences, spoken vs written register) when helpful.
- Stay grounded in the ACTIVE CAPTURE / snippet context; do not invent facts about the source.
- Be concise unless the user asks for depth.`;
}
