import type { LanguageFragment } from '@semia/shared';
import { targetLanguageLabel } from './snippetPromptContext';

export function buildFocusKeywordSuggestionPrompt({
  fragment,
  originalSpeech,
  nativeLanguage,
}: {
  fragment: LanguageFragment;
  originalSpeech: string;
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

5. Allow Variable / Placeholder Templates:
   Do NOT suggest pure, isolated factual data, numbers, statistics, or local brand/entity names.
   However, if a phrase contains a specific number, percentage, or proper noun, you MAY suggest it ONLY if the entire phrase represents a highly reusable, systematic syntactic frame (a template with "slots").
   - E.g., In English (en): "in 61% less time" is ALLOWED because it represents the reusable template: "in [X]% less time" (以減少 X% 的時間); "replaced workers with Datavant" is ALLOWED because it represents: "replace [A] with [B]".
   - E.g., In Japanese (ja): "往復2時間を移動に充てる" is ALLOWED because it represents the template: "往復 [X] 時間を [Y] に充てる" (將往返 X 小時花在 Y 上).
   - Rule: If you suggest such a template, you MUST explicitly extract and explain the underlying placeholder formula (using tags like [X], [A], [B]) in the candidate's "background_note" field, teaching users how to customize it.

6. Length Constraint (Ideally 2 to 4 Words):
   Keep suggested phrases/collocations concise (ideally 2 to 4 words). Do NOT extract long clauses or full sentence segments unless it is an unbreakable, globally recognized idiom or a highly valuable variable template as defined above. Proactively "trim the fat" (strip unnecessary words).
   - Bad (Too long): "making intelligence more abundant and affordable" (6 words - please trim to "abundant and affordable")
   - Good (Template allowed): "in 61% less time" (5 words - accepted as a crucial system template).

[Selection Preferences]
- Prioritize highly reusable idioms, collocations, slang, and domain jargon worth studying.
- Include advanced or formal terms when they are clearly valuable in context.
- Never pad with common words just to reach 3 candidates. If nothing valuable exists, return {"candidates": []}.

[Strict Output Rules]
1. Use ONLY the provided [Original Speech] text.
2. Return 0 to 3 candidates — quality and semantic density over quantity.
3. Each suggested "text" MUST appear verbatim in [Original Speech] (same inflected form; do not lemmatize).
4. Return raw JSON only. Do NOT wrap the JSON in markdown code blocks (no \`\`\`json fences). Do NOT output any conversational fluff or commentary.

Output Format:
{"candidates":[{"text":"[Verbatim Text]","kind":"word|phrase|collocation","background_note":"[Optional: placeholder formula when rule 5 applies, e.g. in [X]% less time]"}]}`;

  const user = `[Original Speech]
${originalSpeech.trim()}`;

  return { system, user };
}
