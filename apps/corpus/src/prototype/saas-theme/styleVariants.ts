export type StyleVariantKey = 'A' | 'B' | 'C';

export type StyleVariantDefinition = {
  key: StyleVariantKey;
  label: string;
  description: string;
  badges: {
    dueNow: string;
    cards: string;
    schedule: string;
  };
  intents: {
    speaking: string;
    writing: string;
  };
};

/** A/B/C — snippet meta badges (Due now, n cards) + language-card intent chips. */
export const STYLE_VARIANTS: StyleVariantDefinition[] = [
  {
    key: 'A',
    label: 'Warm urgent',
    description:
      'Due now = amber; cards = accent-soft blue — closest to current production cues',
    badges: {
      dueNow: 'proto-badge-due-a',
      cards: 'proto-badge-cards-a',
      schedule: 'proto-badge-schedule-a',
    },
    intents: {
      speaking: 'proto-intent-speaking-a',
      writing: 'proto-intent-writing-a',
    },
  },
  {
    key: 'B',
    label: 'Cool neutral',
    description: 'Due now = rose urgency; cards = slate border chip — quieter chrome',
    badges: {
      dueNow: 'proto-badge-due-b',
      cards: 'proto-badge-cards-b',
      schedule: 'proto-badge-schedule-b',
    },
    intents: {
      speaking: 'proto-intent-speaking-b',
      writing: 'proto-intent-writing-b',
    },
  },
  {
    key: 'C',
    label: 'Accent unified',
    description: 'Due now + cards both accent-blue family; intent = outline pills',
    badges: {
      dueNow: 'proto-badge-due-c',
      cards: 'proto-badge-cards-c',
      schedule: 'proto-badge-schedule-c',
    },
    intents: {
      speaking: 'proto-intent-speaking-c',
      writing: 'proto-intent-writing-c',
    },
  },
];

export function styleVariantForKey(key: string): StyleVariantDefinition {
  return STYLE_VARIANTS.find((variant) => variant.key === key) ?? STYLE_VARIANTS[0]!;
}
