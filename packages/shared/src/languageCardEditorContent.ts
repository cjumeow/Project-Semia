import type { CardIntent, LanguageCard, LanguageCardExample } from './types';
import type {
  LanguageCardDraftContent,
  LanguageCardOptionalFieldKey,
} from './languageCardDraft';
import { isLanguageCardOptionalFieldKey } from './languageCardOptionalFields';

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

function optionalSlotText(
  content: LanguageCardDraftContent,
  field: LanguageCardOptionalFieldKey,
): string | undefined {
  if (!content.enabledOptionalFields.includes(field)) {
    return undefined;
  }

  const value = content.optionalSlots[field]?.trim() ?? '';
  return value || undefined;
}

export function scenarioFromDraftUsageNote(
  content: LanguageCardDraftContent,
): string | undefined {
  return optionalSlotText(content, 'usageNote');
}

export function buildLanguageCardFieldsFromDraftContent(
  content: LanguageCardDraftContent,
  intents: CardIntent[] = ['speaking'],
): Pick<
  LanguageCard,
  | 'focusText'
  | 'focus'
  | 'meaning'
  | 'intents'
  | 'scenario'
  | 'dialogue'
  | 'pitfalls'
  | 'personalNote'
  | 'examples'
> {
  const focusText = content.focusText.trim();

  return {
    focusText,
    focus: focusText,
    meaning: content.meaning.trim(),
    intents,
    scenario: scenarioFromDraftUsageNote(content),
    dialogue: optionalSlotText(content, 'dialogue'),
    pitfalls: optionalSlotText(content, 'pitfalls'),
    personalNote: optionalSlotText(content, 'personalNote'),
    examples: examplesFromDraftExampleSlot(content),
  };
}

function loadOptionalSlot(
  card: LanguageCard,
  field: LanguageCardOptionalFieldKey,
): string | undefined {
  switch (field) {
    case 'example':
      return card.examples.find((example) => example.kind === 'speaking')?.text;
    case 'usageNote':
      return card.scenario;
    case 'dialogue':
      return card.dialogue;
    case 'pitfalls':
      return card.pitfalls;
    case 'personalNote':
      return card.personalNote;
    default:
      return undefined;
  }
}

export function editorContentFromLanguageCard(
  card: LanguageCard,
): LanguageCardDraftContent {
  const enabledOptionalFields: LanguageCardOptionalFieldKey[] = [];
  const optionalSlots: LanguageCardDraftContent['optionalSlots'] = {};

  for (const field of [
    'example',
    'usageNote',
    'dialogue',
    'pitfalls',
    'personalNote',
  ] as const) {
    const value = loadOptionalSlot(card, field)?.trim() ?? '';
    if (value) {
      enabledOptionalFields.push(field);
      optionalSlots[field] = value;
    }
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

export function isOptionalEditorSlot(
  slot: string,
): slot is LanguageCardOptionalFieldKey {
  return isLanguageCardOptionalFieldKey(slot);
}
