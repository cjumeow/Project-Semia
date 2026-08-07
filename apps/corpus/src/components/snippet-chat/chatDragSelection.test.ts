import { describe, expect, it } from 'vitest';
import { applyBlockClickSelection } from './chatDragSelection';

describe('applyBlockClickSelection', () => {
  it('replaces selection on plain click', () => {
    expect(applyBlockClickSelection(new Set(['a', 'b']), 'c', false)).toEqual(
      new Set(['c']),
    );
  });

  it('adds to selection on multi-select click', () => {
    expect(applyBlockClickSelection(new Set(['a']), 'b', true)).toEqual(
      new Set(['a', 'b']),
    );
  });

  it('removes from selection when multi-select clicking selected item', () => {
    expect(applyBlockClickSelection(new Set(['a', 'b']), 'b', true)).toEqual(
      new Set(['a']),
    );
  });

  it('supports non-contiguous accumulation (middle -> lower -> upper)', () => {
    let selected = applyBlockClickSelection(new Set(), '1', false);
    selected = applyBlockClickSelection(selected, '2', true);
    selected = applyBlockClickSelection(selected, '0', true);
    expect([...selected]).toEqual(['1', '2', '0']);
  });
});
