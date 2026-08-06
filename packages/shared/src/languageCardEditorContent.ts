import type { CardIntent, LanguageCard, LanguageCardExample } from './types';
import type {
  LanguageCardDraftContent,
  LanguageCardOptionalFieldKey,
} from './languageCardDraft';

export function toggleOptionalField(
  content: LanguageCardDraftContent,
  field: LanguageCardOptionalFieldKey,
  enabled: boolean,
): LanguageCardDraftContent {
  const enabledOptionalFields = enabled
    ? [...new Set([...content.enabledOptionalFields, field])]
    : content.enabledOptionalFields.filter((key) => key !== field);

  const optionalSlots = { ...content.optionalSlots };
  if (!enabled) {
    delete optionalSlots[field];
  }

  return {
    ...content,
    enabledOptionalFields,
    optionalSlots,
  };
}

export function examplesFromDraftExampleSlot(
  content: LanguageCardDraftContent,
): LanguageCardExample[] {
  if (!content.enabledOptionalFields.includes('example')) {
    return [];
  }

  const text = content.optionalSlots.example?.trim() ?? '';
  if (!text) {
    return [];
  }

  return [{ kind: 'speaking', text, translation: '' }];
}

export function scenarioFromDraftUsageNote(
  content: LanguageCardDraftContent,
): string | undefined {
  if (!content.enabledOptionalFields.includes('usageNote')) {
    return undefined;
  }

  const scenario = content.optionalSlots.usageNote?.trim() ?? '';
  return scenario || undefined;
}

export function buildLanguageCardFieldsFromDraftContent(
  content: LanguageCardDraftContent,
  intents: CardIntent[] = ['speaking'],
): Pick<
  LanguageCard,
  'focusText' | 'focus' | 'meaning' | 'intents' | 'scenario' | 'examples'
> {
  const focusText = content.focusText.trim();

  return {
    focusText,
    focus: focusText,
    meaning: content.meaning.trim(),
    intents,
    scenario: scenarioFromDraftUsageNote(content),
    examples: examplesFromDraftExampleSlot(content),
  };
}

export function editorContentFromLanguageCard(
  card: LanguageCard,
): LanguageCardDraftContent {
  const speakingExample = card.examples.find(
    (example) => example.kind === 'speaking',
  );
  const enabledOptionalFields: LanguageCardOptionalFieldKey[] = [];
  const optionalSlots: LanguageCardDraftContent['optionalSlots'] = {};

  if (speakingExample?.text.trim()) {
    enabledOptionalFields.push('example');
    optionalSlots.example = speakingExample.text;
  }

  if (card.scenario?.trim()) {
    enabledOptionalFields.push('usageNote');
    optionalSlots.usageNote = card.scenario;
  }

  return {
    focusText: card.focusText,
    meaning: card.meaning,
    enabledOptionalFields,
    optionalSlots,
  };
}

export function applyEditorContentToLanguageCard(
  card: LanguageCard,
  content: LanguageCardDraftContent,
): LanguageCard {
  const fields = buildLanguageCardFieldsFromDraftContent(content, card.intents);

  return {
    ...card,
    ...fields,
  };
}
