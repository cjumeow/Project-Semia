import type { LanguageFragment } from '@semia/shared';
import {
  buildSnippetContextUserBlock,
  targetLanguageLabel,
} from './snippetPromptContext';

export type ContextWindowPromptInput = {
  fragment: LanguageFragment;
  nativeLanguage: string;
};

export function buildContextWindowPrompt({
  fragment,
  nativeLanguage,
}: ContextWindowPromptInput): { system: string; user: string } {
  const targetLang = targetLanguageLabel(nativeLanguage);

  const system = `You are an expert bilingual linguist and translator.
Your task is to reconstruct a clean, coherent, highly readable bilingual paragraph around a captured video snippet for language-learning review.

<dynamic_context_block> (Dynamic & Coherent Context Window):
Use [30-SECOND SURROUNDING CONTEXT] as source material and [BASELINE CONTEXT WINDOW] (~±3 cues) only as a starting guide.

- Baseline Window: Start from approximately ±3 cues (about 7 cues) around the selection.
- Dynamic Boundary Rule (Speaker & Topic Coherence):
  * Do NOT blindly cut exactly at ±3 cues. Detect semantic and speaker boundaries.
  * Dialogue / multiple speakers: shrink boundaries to the continuous single-speaker utterance of whoever said the [USER'S CAPTURED SELECTION].
  * Monologue: form a complete, grammatically whole paragraph.
- Format (Original-focused Bilingual Paragraph):
  Reconstruct cues inside this dynamic boundary into one well-punctuated paragraph in ${fragment.languageCode}, then its natural translation in ${targetLang}.
  Use this exact format inside the tag:

  [Perfect, punctuated original-language paragraph]
  ---
  [Natural translation of this entire paragraph in ${targetLang}]

Strict Output Format:
Return only:

<result>
  <dynamic_context_block>[Original paragraph]
---
[Translation paragraph]</dynamic_context_block>
</result>`;

  const user = buildSnippetContextUserBlock(fragment);

  return { system, user };
}
