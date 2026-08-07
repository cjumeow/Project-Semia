// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import {
  createMultiBlockDragGhostElement,
  multiBlockDragLabel,
  shouldUseMultiBlockDragGhost,
} from './chatDragGhost';

describe('chatDragGhost', () => {
  it('uses custom ghost only for multi-block drags', () => {
    expect(shouldUseMultiBlockDragGhost(1)).toBe(false);
    expect(shouldUseMultiBlockDragGhost(2)).toBe(true);
  });

  it('labels block count', () => {
    expect(multiBlockDragLabel(3)).toBe('3 blocks');
  });

  it('builds a language-card styled ghost element', () => {
    const ghost = createMultiBlockDragGhostElement(document, 3);
    expect(ghost.querySelector('svg')).not.toBeNull();
    expect(ghost.textContent).toBe('3 blocks');
    expect(ghost.style.background).toBe('#1f57d1');
  });
});
