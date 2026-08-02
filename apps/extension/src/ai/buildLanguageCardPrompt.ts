import type { CardIntent, LanguageFragment, SnippetNote } from '@semia/shared';
import {
  type LanguageCardPromptOptions,
  requiredCardSections,
} from '@semia/shared';
import {
  buildSnippetContextUserBlock,
  targetLanguageLabel,
} from './snippetPromptContext';

function exampleTags(intents: CardIntent[]): string {
  return intents
    .map(
      (intent) => `  <example kind="${intent}">
    <text>[${intent} example in capture language]</text>
    <translation>[Chinese translation]</translation>
  </example>`,
    )
    .join('\n');
}

export function buildLanguageCardPrompt({
  fragment,
  note,
  focusText,
  intents,
  learnerNote,
  nativeLanguage,
  promptOptions,
}: {
  fragment: LanguageFragment;
  note: SnippetNote;
  focusText: string;
  intents: CardIntent[];
  learnerNote?: string;
  nativeLanguage: string;
  promptOptions: LanguageCardPromptOptions;
}): { system: string; user: string } {
  const targetLang = targetLanguageLabel(nativeLanguage);
  const optionalTags: string[] = [];
  if (promptOptions.includeMeaning) {
    optionalTags.push('  <meaning>[short Chinese gloss for the focus only]</meaning>');
  }
  if (promptOptions.includeScenario) {
    optionalTags.push(
      '  <scenario>[1–2 sentences: when to use this focus, generalized; no scripted dialogue]</scenario>',
    );
  }

  const system = `You are a language tutor helping a learner create a focused study card from a captured snippet.
The learner wants to study "${focusText}" from their capture.

Write explanatory fields in ${targetLang} (Chinese). Example sentences stay in ${fragment.languageCode}.

Required XML structure:

<result>
  <focus>${focusText}</focus>
${optionalTags.join('\n')}
${exampleTags(intents)}
</result>

Rules:
- <focus> must echo exactly: "${focusText}"
- Focus validity is already verified — always produce the card XML
${
  promptOptions.includeMeaning
    ? `- <meaning>: ONLY the precise Chinese equivalent of the focus in this capture — a word or short phrase. NO background, NO "here it means", NO grammar lecture.`
    : ''
}
${
  promptOptions.includeScenario
    ? `- <scenario>: generalized usage note (e.g. "當你要表達某情境有「多種」選項時…"). NO "Scenario 1/2" labels. NO long English dialogue embedded in the scenario.`
    : ''
}
- Each <example>: natural ${fragment.languageCode} sentence using the focus; <translation> is the Chinese translation of that sentence
- Speaking examples sound spoken; writing examples suit email or formal text

Strict output — only the XML inside <result>.`;

  const userParts = [
    buildSnippetContextUserBlock(fragment),
    '',
    '[SNIP NOTE]',
    `Original speech: ${note.originalSpeech}`,
    `Natural translation: ${note.naturalTranslation}`,
    `Background note: ${note.backgroundNote}`,
  ];

  if (note.dynamicContextBlock?.trim()) {
    userParts.push(
      '',
      '[CONTEXT WINDOW]',
      note.dynamicContextBlock.trim(),
    );
  }

  userParts.push(
    '',
    '[LEARNER CARD REQUEST]',
    `Focus: ${focusText}`,
    `Intents: ${intents.join(', ')}`,
    `Required sections: ${requiredCardSections(intents, promptOptions).join(', ')}`,
  );

  if (learnerNote?.trim()) {
    userParts.push(`Learner note: ${learnerNote.trim()}`);
  }

  return { system, user: userParts.join('\n') };
}
