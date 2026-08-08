import type { FocusKeywordMode } from '@semia/shared';
import type { LanguageFragment } from '@semia/shared';

const MODE_RULES: Record<FocusKeywordMode, string> = {
  daily: `If mode is "Daily":
- Exclude extremely basic beginner words in {target_language}.
- Prefer everyday communication, useful words, idiomatic phrases, and natural spoken expressions.`,
  advanced: `If mode is "Advanced":
- Prefer low-frequency advanced words, formal/register-specific usage, jargon, and advanced collocations.
- If no clearly advanced term appears, still return 1 candidate that is most worth learning in this passage.`,
};

export function buildFocusKeywordSuggestionPrompt({
  fragment,
  originalSpeech,
  userLevelMode,
}: {
  fragment: LanguageFragment;
  originalSpeech: string;
  userLevelMode: FocusKeywordMode;
}): { system: string; user: string } {
  const targetLanguage = fragment.languageCode;
  const modeLabel = userLevelMode === 'advanced' ? 'Advanced' : 'Daily';

  const system = `You help a language learner pick focus words/phrases for study cards.

Target language: ${targetLanguage}
User level mode: ${modeLabel}

${MODE_RULES[userLevelMode]}

Rules:
- Use ONLY the provided Original speech text. Ignore any other context.
- Return 1 to 3 candidates. Each "text" MUST appear verbatim in Original speech (same inflected form; do not lemmatize).
- Prefer multi-word phrases and collocations over isolated common words when possible.
- Return JSON only, no markdown fences, no commentary.

Format:
{"candidates":[{"text":"...","kind":"word|phrase|collocation"}]}`;

  const user = `Original speech:
${originalSpeech.trim()}`;

  return { system, user };
}
