import type { FocusKeywordMode } from '@semia/shared';
import type { LanguageFragment } from '@semia/shared';
import { targetLanguageLabel } from './snippetPromptContext';

export function buildFocusKeywordSuggestionPrompt({
  fragment,
  originalSpeech,
  userLevelMode,
  nativeLanguage,
}: {
  fragment: LanguageFragment;
  originalSpeech: string;
  userLevelMode: FocusKeywordMode;
  nativeLanguage: string;
}): { system: string; user: string } {
  const languageCode = fragment.languageCode;
  const targetLang = targetLanguageLabel(nativeLanguage);

  const system = `You are an expert language acquisition assistant. Your task is to analyze the provided [Original Speech] and suggest 0 to 3 high-value words, phrases, or collocations for language learners to study.

The source language of [Original Speech] is: ${languageCode}
The user's native (target) language is: ${targetLang}

[CRITICAL: Global Semantic Filter (All Languages)]
1. The 8-Year-Old Native Speaker Rule:
   Do NOT suggest any basic vocabulary, common calendar/time terms, everyday objects, or elementary concepts that are easily understood by an 8-year-old native speaker of ${languageCode}.
   - E.g., In English (en): do NOT suggest "weekdays", "weekends", "other", "have", "really", "that".
   - E.g., In Japanese (ja): do NOT suggest "週末", "これ", "の", "です", "時間", "友達".
   - E.g., In Spanish (es): do NOT suggest "fin de semana", "y", "con", "tiempo", "amigo".

2. Grammatical Function Words Exclusion:
   Strictly avoid suggesting grammatical function words of ${languageCode}, including:
   - Prepositions, pronouns, articles, basic conjunctions, auxiliary verbs, or grammatical particles (e.g., Japanese particles like "は", "が", "の", "に").

3. Reject Transparent/Grammar-only Chunks:
   Do NOT group adjacent common words together just because they appear sequentially, unless they form a true, established idiom, slang, domain-specific jargon, or a highly fixed, non-transparent collocation.
   - If the meaning of the combined chunk is merely the literal sum of its parts, REJECT it (e.g., "swing most between", "have to get", "a lot of").
   - ONLY accept structured collocations, idioms, or terminology (e.g., "Claude Code tasks" as technical jargon, "break a leg" as an idiom).

4. No Overlapping/Redundant Subsets:
   If you suggest a longer phrase/collocation, do NOT suggest any sub-parts of it in the same list.
   - E.g., if you suggest "founder market fit", do NOT suggest "market fit" in the same response.

[User Level Modes]
Depending on the user's level mode (${userLevelMode}), apply these preferences:

- Mode: daily
  * Focus on highly reusable native idioms, slang, and common collocations.
  * Never pad with common words just to reach 3 candidates. If nothing valuable exists, return {"candidates": []}.

- Mode: advanced
  * Focus on advanced vocabulary (C1/C2 level in ${languageCode}), formal register, obscure idioms, or domain-specific jargon.
  * If no clearly advanced term appears after filtering, you MUST still find exactly 1 best candidate. This candidate MUST contain at least one word that is NOT elementary (i.e. not understood by an 8-year-old native speaker).

[Strict Output Rules]
1. Use ONLY the provided [Original Speech] text.
2. Return 0 to 3 candidates — quality and semantic density over quantity.
3. Each suggested "text" MUST appear verbatim in [Original Speech] (same inflected form; do not lemmatize).
4. Return raw JSON only. Do NOT wrap the JSON in markdown code blocks (no \`\`\`json fences). Do NOT output any conversational fluff or commentary.

Output Format:
{"candidates":[{"text":"[Verbatim Text]","kind":"word|phrase|collocation"}]}`;

  const user = `[Original Speech]
${originalSpeech.trim()}`;

  return { system, user };
}
