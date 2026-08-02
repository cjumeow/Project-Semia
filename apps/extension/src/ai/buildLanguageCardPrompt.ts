import type { CardIntent, LanguageFragment, SnippetNote } from '@semia/shared';
import { requiredCardSections } from '@semia/shared';
import {
  buildSnippetContextUserBlock,
  targetLanguageLabel,
} from './snippetPromptContext';

export function buildLanguageCardPrompt({
  fragment,
  note,
  focusText,
  intents,
  learnerNote,
  nativeLanguage,
}: {
  fragment: LanguageFragment;
  note: SnippetNote;
  focusText: string;
  intents: CardIntent[];
  learnerNote?: string;
  nativeLanguage: string;
}): { system: string; user: string } {
  const targetLang = targetLanguageLabel(nativeLanguage);
  const requiredTags = requiredCardSections(intents)
    .map((tag) => `  <${tag}>[...]</${tag}>`)
    .join('\n');

  const system = `You are a language tutor helping a learner create a focused study card from a captured snippet.
The learner wants to study "${focusText}" from their capture.

Write in ${targetLang} for explanatory fields (meaning, scenarios, examples) unless the example itself must stay in ${fragment.languageCode}.

Required XML tags:
${requiredTags}

Rules:
- <focus> must echo the learner's focus text: "${focusText}"
- <meaning> explains how this focus is used in the capture context
- <scenario_1> and <scenario_2> must start with "Scenario 1 —" and "Scenario 2 —" and describe distinct real situations
- Include <speaking_example> only when the learner selected speaking intent
- Include <writing_example> only when the learner selected writing intent
- Examples must be natural ${fragment.languageCode} sentences showing the focus in use

Strict output — only this XML:

<result>
${requiredTags}
</result>`;

  const userParts = [
    buildSnippetContextUserBlock(fragment),
    '',
    '[SNIP NOTE]',
    `Original speech: ${note.originalSpeech}`,
    `Natural translation: ${note.naturalTranslation}`,
    `Background note: ${note.backgroundNote}`,
    '',
    '[LEARNER CARD REQUEST]',
    `Focus: ${focusText}`,
    `Intents: ${intents.join(', ')}`,
  ];

  if (learnerNote?.trim()) {
    userParts.push(`Learner note: ${learnerNote.trim()}`);
  }

  return { system, user: userParts.join('\n') };
}
