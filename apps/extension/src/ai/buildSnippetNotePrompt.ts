import type { LanguageFragment } from '@semia/shared';
import { isSingleWordSnippet } from './isSingleWord';

export type SnippetNotePromptInput = {
  fragment: LanguageFragment;
  nativeLanguage: string;
};

export function buildSnippetNotePrompt({
  fragment,
  nativeLanguage,
}: SnippetNotePromptInput): { system: string; user: string } {
  const singleWord = isSingleWordSnippet(fragment.selectedText);
  const context = fragment.contextCues
    .map((cue) => cue.text.trim())
    .filter(Boolean)
    .join('\n');

  const system = `You help language learners annotate video snippets.

Return ONLY valid JSON with this shape:
{
  "originalSpeech": string,
  "naturalTranslation": string,
  "backgroundNote": string,
  "example": string
}

Rules:
1. originalSpeech: lightly correct obvious ASR / caption errors using context. Keep the learner's intended phrase; do not expand into a longer quote.
2. naturalTranslation: natural translation into ${nativeLanguage}.
3. backgroundNote: explain usage, nuance, or context in ${nativeLanguage}. Maximum 3-4 short lines. No bullet lists.
4. example: ${
    singleWord
      ? `one natural example sentence in the source language (${fragment.languageCode}) that uses the word "${fragment.selectedText.trim()}".`
      : 'must be an empty string "" because this snippet is NOT a single word.'
  }`;

  const user = `Source language: ${fragment.languageCode}
Focus word: ${fragment.focusWord.text}
Captured snippet (raw): ${fragment.selectedText}
Is single word: ${singleWord ? 'yes' : 'no'}

Surrounding transcript context:
${context || '(none)'}`;

  return { system, user };
}
