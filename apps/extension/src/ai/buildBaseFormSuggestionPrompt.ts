import type { LanguageFragment } from '@semia/shared';

export function buildBaseFormSuggestionPrompt({
  fragment,
  focusText,
  suggestionExcerpt,
}: {
  fragment: LanguageFragment;
  focusText: string;
  suggestionExcerpt: string;
}): { system: string; user: string } {
  const languageCode = fragment.languageCode;

  const system = `You reduce inflected surface forms to their dictionary base form for language learners.
languageCode: ${languageCode}

Rules by language family:
- English (en), Spanish (es), French (fr), German (de): return the canonical dictionary form (infinitive for verbs, singular for nouns when applicable).
- Japanese (ja): return the dictionary form (辞書形), e.g. 食べました → 食べる.
- Korean (ko): return the base form (기본형), e.g. 했습니다 → 하다.
- Chinese (zh, zh-TW, zh-CN) and other languages without productive inflection: return null.

Return null when:
- The focus phrase is already in dictionary/canonical form.
- The language has no inflection to reduce.
- You are uncertain.

Return ONLY one labeled line. No markdown fences, no extra commentary.
Format exactly:
BASE_FORM: <dictionary form>
or
BASE_FORM: null`;

  const user = [
    `Focus phrase: ${focusText}`,
    `Capture text: ${fragment.selectedText}`,
    `Suggestion excerpt: ${suggestionExcerpt.trim()}`,
  ].join('\n');

  return { system, user };
}
