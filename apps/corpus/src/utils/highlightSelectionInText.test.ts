import { describe, expect, it } from 'vitest';
import {
  findSelectionRange,
  splitTextBySelection,
} from './highlightSelectionInText';

describe('findSelectionRange', () => {
  it('finds an exact match', () => {
    expect(findSelectionRange('Alpha target beta.', 'target')).toEqual({
      start: 6,
      end: 12,
    });
  });

  it('finds a case-insensitive match', () => {
    expect(findSelectionRange('Alpha Target beta.', 'target')).toEqual({
      start: 6,
      end: 12,
    });
  });

  it('tolerates flexible whitespace in the paragraph', () => {
    expect(
      findSelectionRange('We should break a leg tonight.', 'break  a leg'),
    ).toEqual({ start: 10, end: 21 });
  });

  it('returns null when the selection is not present', () => {
    expect(findSelectionRange('Hello world.', 'missing')).toBeNull();
  });
});

describe('splitTextBySelection', () => {
  it('wraps only the matched span', () => {
    expect(splitTextBySelection('Alpha target beta.', 'target')).toEqual([
      { text: 'Alpha ', highlighted: false },
      { text: 'target', highlighted: true },
      { text: ' beta.', highlighted: false },
    ]);
  });

  it('returns the whole string unhighlighted when no match exists', () => {
    expect(splitTextBySelection('Hello world.', 'missing')).toEqual([
      { text: 'Hello world.', highlighted: false },
    ]);
  });
});
