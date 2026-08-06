import { describe, expect, it } from 'vitest';
import { appendMarkdownToSlot } from './languageCardSlotDrop';

describe('appendMarkdownToSlot', () => {
  it('sets content when slot is empty', () => {
    expect(appendMarkdownToSlot('', 'First line')).toBe('First line');
  });

  it('appends with a newline when slot already has content', () => {
    expect(appendMarkdownToSlot('Line one', 'Line two')).toBe(
      'Line one\nLine two',
    );
  });

  it('ignores empty fragments', () => {
    expect(appendMarkdownToSlot('Existing', '   ')).toBe('Existing');
  });
});
