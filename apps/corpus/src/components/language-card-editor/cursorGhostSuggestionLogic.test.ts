import { describe, expect, it } from 'vitest';
import { resolveCursorGhostSuggestionView } from './cursorGhostSuggestionLogic';

describe('resolveCursorGhostSuggestionView', () => {
  it('shows baseForm arrow ghost when suggestion differs from value', () => {
    expect(
      resolveCursorGhostSuggestionView({
        value: 'ran',
        suggestion: 'run',
        mode: 'baseForm',
      }),
    ).toEqual({
      showGhost: true,
      showBaseFormArrow: true,
      ghostSuffix: null,
      showActions: true,
    });
  });

  it('hides baseForm ghost when suggestion matches value', () => {
    expect(
      resolveCursorGhostSuggestionView({
        value: 'run',
        suggestion: 'run',
        mode: 'baseForm',
      }).showGhost,
    ).toBe(false);
  });

  it('shows completion suffix ghost when suggestion extends value', () => {
    expect(
      resolveCursorGhostSuggestionView({
        value: 'A common way',
        suggestion: 'A common way to express this',
        mode: 'completion',
      }),
    ).toEqual({
      showGhost: true,
      showBaseFormArrow: false,
      ghostSuffix: ' to express this',
      showActions: true,
    });
  });

  it('hides actions while loading', () => {
    expect(
      resolveCursorGhostSuggestionView({
        value: 'ran',
        suggestion: 'run',
        mode: 'baseForm',
        loading: true,
      }),
    ).toEqual({
      showGhost: false,
      showBaseFormArrow: false,
      ghostSuffix: null,
      showActions: false,
    });
  });

  it('hides baseForm ghost when suggestion matches value case-insensitively', () => {
    expect(
      resolveCursorGhostSuggestionView({
        value: 'coursework',
        suggestion: 'Coursework',
        mode: 'baseForm',
      }).showGhost,
    ).toBe(false);
  });
});
