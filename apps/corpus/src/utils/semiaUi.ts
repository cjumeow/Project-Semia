import type { CardIntent } from '@semia/shared';
import type { LanguageCardExample } from '@semia/shared';

const SNIPPET_BADGE_BASE = 'semia-snippet-badge shrink-0';

/** Review schedule pill on snippet rows — variant B (cool neutral). */
export function reviewScheduleBadgeClass(emphasis: 'urgent' | 'normal'): string {
  return emphasis === 'urgent'
    ? `${SNIPPET_BADGE_BASE} semia-badge-due`
    : `${SNIPPET_BADGE_BASE} semia-badge-schedule`;
}

/** Linked language-card count on snippet rows — variant B. */
export function cardCountBadgeClass(): string {
  return `${SNIPPET_BADGE_BASE} semia-badge-cards`;
}

/** Speaking / Writing intent chip — variant B (bordered). */
export function intentChipClass(intent: CardIntent): string {
  return intent === 'speaking' ? 'semia-intent-speaking' : 'semia-intent-writing';
}

export function groupExamplesByKind(examples: LanguageCardExample[]): {
  speaking: LanguageCardExample[];
  writing: LanguageCardExample[];
} {
  const speaking: LanguageCardExample[] = [];
  const writing: LanguageCardExample[] = [];
  for (const example of examples) {
    if (example.kind === 'speaking') {
      speaking.push(example);
    } else {
      writing.push(example);
    }
  }
  return { speaking, writing };
}
