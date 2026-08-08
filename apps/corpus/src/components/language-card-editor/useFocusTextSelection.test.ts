import { describe, expect, it } from 'vitest';
import { anchorRectFromRange } from './useFocusTextSelection';

function mockRect(
  width: number,
  height: number,
  top = 0,
  left = 0,
): DOMRect {
  return {
    width,
    height,
    top,
    left,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

describe('anchorRectFromRange', () => {
  it('uses bounding client rect when it is non-empty', () => {
    const range = {
      getBoundingClientRect: () => mockRect(120, 18, 40, 12),
      getClientRects: () => [mockRect(120, 18, 40, 12)],
    } as unknown as Range;

    const rect = anchorRectFromRange(range);
    expect(rect?.width).toBe(120);
    expect(rect?.top).toBe(40);
  });

  it('falls back to the last client rect when bounding box is empty', () => {
    const range = {
      getBoundingClientRect: () => mockRect(0, 0),
      getClientRects: () => [
        mockRect(200, 16, 10, 8),
        mockRect(160, 16, 26, 8),
      ],
    } as unknown as Range;

    const rect = anchorRectFromRange(range);
    expect(rect?.width).toBe(160);
    expect(rect?.top).toBe(26);
    expect(rect?.left).toBe(8);
  });

  it('returns null when no visible rects exist', () => {
    const range = {
      getBoundingClientRect: () => mockRect(0, 0),
      getClientRects: () => [],
    } as unknown as Range;

    expect(anchorRectFromRange(range)).toBeNull();
  });
});
