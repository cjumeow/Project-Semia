import { describe, expect, it } from 'vitest';
import type { LanguageCard } from './types';
import {
  applyEditorContentToLanguageCard,
  buildLanguageCardFieldsFromDraftContent,
  editorContentFromLanguageCard,
  toggleOptionalField,
} from './languageCardEditorContent';

describe('languageCardEditorContent', () => {
  it('builds formal card fields from draft content', () => {
    const fields = buildLanguageCardFieldsFromDraftContent({
      focusText: 'vessels',
      meaning: '船只',
      enabledOptionalFields: ['example', 'usageNote'],
      optionalSlots: {
        example: 'The fleet has twelve vessels.',
        usageNote: 'Often used in naval contexts.',
      },
    });

    expect(fields).toEqual({
      focusText: 'vessels',
      focus: 'vessels',
      meaning: '船只',
      intents: ['speaking'],
      scenario: 'Often used in naval contexts.',
      examples: [
        {
          kind: 'speaking',
          text: 'The fleet has twelve vessels.',
          translation: '',
        },
      ],
    });
  });

  it('round-trips established card content through the editor shape', () => {
    const card: LanguageCard = {
      id: 'card-1',
      sourceFragmentId: 'frag-1',
      focusText: 'tractable',
      focus: 'tractable',
      meaning: '易處理的',
      intents: ['speaking'],
      scenario: 'Formal writing',
      examples: [{ kind: 'speaking', text: 'A tractable problem.', translation: '' }],
      createdAt: '2026-01-01T00:00:00.000Z',
      generatedAt: '2026-01-01T00:00:00.000Z',
    };

    const content = editorContentFromLanguageCard(card);
    expect(applyEditorContentToLanguageCard(card, content)).toEqual(card);
  });

  it('toggles optional fields without leaving stale slot values enabled', () => {
    const content = toggleOptionalField(
      {
        focusText: 'word',
        meaning: '意思',
        enabledOptionalFields: ['example'],
        optionalSlots: { example: 'Sample' },
      },
      'example',
      false,
    );

    expect(content.enabledOptionalFields).toEqual([]);
    expect(content.optionalSlots.example).toBeUndefined();
  });
});
