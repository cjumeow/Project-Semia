import { describe, expect, it } from 'vitest';
import type { LanguageCardExample } from '@semia/shared';
import {
  cardCountBadgeClass,
  groupExamplesByKind,
  intentChipClass,
  reviewScheduleBadgeClass,
} from './semiaUi';

describe('reviewScheduleBadgeClass', () => {
  it('uses due styling for urgent emphasis', () => {
    expect(reviewScheduleBadgeClass('urgent')).toContain('semia-badge-due');
  });

  it('uses schedule styling for normal emphasis', () => {
    expect(reviewScheduleBadgeClass('normal')).toContain('semia-badge-schedule');
  });
});

describe('cardCountBadgeClass', () => {
  it('returns cards badge class', () => {
    expect(cardCountBadgeClass()).toContain('semia-badge-cards');
  });
});

describe('intentChipClass', () => {
  it('maps speaking and writing to distinct classes', () => {
    expect(intentChipClass('speaking')).toBe('semia-intent-speaking');
    expect(intentChipClass('writing')).toBe('semia-intent-writing');
  });
});

describe('groupExamplesByKind', () => {
  it('splits examples by kind', () => {
    const examples: LanguageCardExample[] = [
      { kind: 'speaking', text: 'a', translation: '甲' },
      { kind: 'writing', text: 'b', translation: '乙' },
      { kind: 'speaking', text: 'c', translation: '丙' },
    ];
    expect(groupExamplesByKind(examples)).toEqual({
      speaking: [
        { kind: 'speaking', text: 'a', translation: '甲' },
        { kind: 'speaking', text: 'c', translation: '丙' },
      ],
      writing: [{ kind: 'writing', text: 'b', translation: '乙' }],
    });
  });
});
